import { spawn, take, put, call, race } from 'redux-saga/effects';

import {
  AIRBITZ_WALLET_ERROR_KEY,
  AIRBITZ_PUBLIC_ADDRESS_ERROR_KEY,
  REQUEST_ERROR_KEY,
  CONFIRM_SPENDING_ERROR_KEY
} from './constants';
import * as actions from './actions';

import * as utils from './utils';

import { actions as authStoreActions } from '../auth';
import { exchangeDirection } from '../currencies';
import { actions as quotaStoreActions } from '../quota';

const DEV_CRYPTO_ADDRESS = 'mhpKcBvzNYsfs2dWoZJDUMB6zwCuEMsLRt';

export default function exchangeOrderDaemonFactory(bity) {
  return function* runExchangeOrderDaemon() {
    yield [
      // yield spawn(listenUnauth),
      // yield spawn(listenFetchIntents, bity)
      yield spawn(listenCreateOrderIntents, bity)
    ];
  };
}

function* listenCreateOrderIntents(bity) {
  while (true) { // eslint-disable-line no-constant-condition
    const { payload: formData } = yield take(actions.CREATE);
    const { inputCurrencyCode, outputCurrencyCode } = formData;
    const exchangePerformer = getExchangePerformer(inputCurrencyCode, outputCurrencyCode);

    yield call(exchangePerformer, bity, formData);
  }
}

// ==========================
// exchange performers
// ==========================
function getExchangePerformer(inputCurrencyCode, outputCurrencyCode) {
  const direction = exchangeDirection.calcExchangeDirection(inputCurrencyCode, outputCurrencyCode);
  switch (direction) {
    case exchangeDirection.FIAT_TO_CRYPTO:
      return performExchangeFromFiatToCrypto;
    case exchangeDirection.CRYPTO_TO_FIAT:
      return performExchangeCryptoToFiat;
    default:
      throw new Error(`Unsupported pair of currencies "${inputCurrencyCode}", "${outputCurrencyCode}"`);
  }
}

function* performExchangeFromFiatToCrypto(bity, formData) {
  yield put(actions.started());

  // -------------------
  // obtain selected Airbitz wallet
  // -------------------
  const getAirbitzWalletResult = yield call(getAirbitzWalletStep);
  if (getAirbitzWalletResult.canceled) {
    yield put(actions.canceled());
    return;
  }
  if (getAirbitzWalletResult.error) {
    yield put(actions.failed(AIRBITZ_WALLET_ERROR_KEY, getAirbitzWalletResult.error));
    return;
  }
  const wallet = getAirbitzWalletResult.data;

  // -------------------
  // obtain public address for selected Airbitz wallet
  // -------------------
  const getAirbitzPublicAddressResult = yield call(getPublicAddressOfAirbitzWalletStep, wallet);
  if (getAirbitzPublicAddressResult.canceled) {
    yield put(actions.canceled());
    return;
  }
  if (getAirbitzPublicAddressResult.error) {
    yield put(actions.failed(AIRBITZ_PUBLIC_ADDRESS_ERROR_KEY, getAirbitzPublicAddressResult.error));
    return;
  }
  const { data: { address: airbitzPublicAddress, requestId } } = getAirbitzPublicAddressResult;

  // -------------------
  // send the request to bity
  // -------------------
  const requestResult = yield call(sendFiatToCryptoRequestStep, bity, formData, airbitzPublicAddress);
  if (requestResult.canceled) {
    yield call(disposePublicAddressOfAirbitzWallet, wallet, requestId);
    yield put(actions.canceled());
    return;
  }
  if (requestResult.error) {
    yield call(disposePublicAddressOfAirbitzWallet, wallet, requestId);
    yield put(actions.failed(REQUEST_ERROR_KEY, requestResult.error));
    return;
  }
  const { data: response } = requestResult;

  // -------------------
  // dispose public address of airbitz wallet
  // -------------------
  yield call(disposePublicAddressOfAirbitzWallet, wallet, requestId);

  // -------------------
  // force refresh of quota data
  // -------------------
  const refreshQuotaResult = yield call(refreshQuotaStep);
  if (refreshQuotaResult.canceled) {
    yield put(actions.canceled());
    return;
  }

  // -------------------
  // after the success
  // -------------------
  yield put(actions.succeed(response, exchangeDirection.FIAT_TO_CRYPTO));
}

function* performExchangeCryptoToFiat(bity, formData) {
  yield put(actions.started());

  // -------------------
  // obtain selected Airbitz wallet
  // -------------------
  const getAirbitzWalletResult = yield call(getAirbitzWalletStep);
  if (getAirbitzWalletResult.canceled) {
    yield put(actions.canceled());
    return;
  }
  if (getAirbitzWalletResult.error) {
    yield put(actions.failed(AIRBITZ_WALLET_ERROR_KEY, getAirbitzWalletResult.error));
    return;
  }
  const wallet = getAirbitzWalletResult.data;

  // -------------------
  // send the request to bity in order to obtain public crypto address
  // -------------------
  const requestResult = yield call(sendCryptoToFiatRequestStep, bity, formData);
  if (requestResult.canceled) {
    yield put(actions.canceled());
    return;
  }
  if (requestResult.error) {
    yield put(actions.failed(REQUEST_ERROR_KEY, requestResult.error));
    return;
  }
  const { data: orderDetails } = requestResult;
  const { outputCryptoAddress, orderId } = orderDetails;

  // -------------------
  // ask the Airbitz user to confirm the transaction
  // -------------------
  const btcAmount = formData.inputAmount;
  const confirmationResult = yield call(askConfirmBtcSpendingStep, wallet, outputCryptoAddress, btcAmount);
  if (confirmationResult.canceled) {
    yield put(actions.canceled());
    return;
  }
  if (confirmationResult.error) {
    yield put(actions.failed(CONFIRM_SPENDING_ERROR_KEY, confirmationResult.error));
    return;
  }

  const { data: { back } } = confirmationResult;
  if (back === true) {
    yield call(sendCancelOrderRequest, bity, orderId);
    yield put(actions.canceled());
    return;
  }

  // -------------------
  // force refresh of quota data
  // -------------------
  const refreshQuotaResult = yield call(refreshQuotaStep);
  if (refreshQuotaResult.canceled) {
    yield put(actions.canceled());
    return;
  }

  // -------------------
  // after the success
  // -------------------
  yield put(actions.succeed(orderDetails, exchangeDirection.CRYPTO_TO_FIAT));
}

// ==========================
// steps
// ==========================
function* getAirbitzWalletStep() {
  const res = yield race({
    walletRequest: call(getAirbitzWallet),
    unauth: take(authStoreActions.UNAUTHENTICATED)
  });

  if (typeof res.unauth !== 'undefined') {
    return { canceled: true };
  }

  const { data, error } = res.walletRequest;
  return { data, error };
}

function* getPublicAddressOfAirbitzWalletStep(wallet) {
  const res = yield race({
    addressRequest: call(getPublicAddressOfAirbitzWallet, wallet),
    unauth: take(authStoreActions.UNAUTHENTICATED)
  });

  if (typeof res.unauth !== 'undefined') {
    return { canceled: true };
  }

  const { data, error } = res.addressRequest;
  if (typeof error !== 'undefined') {
    return { data: null, error };
  }

  const { address: originalAddress, requestId } = data;
  // replace obtained public address by testnet address for dev
  const address = process.env.NODE_ENV === 'production' ? originalAddress : DEV_CRYPTO_ADDRESS;
  return { data: { address, requestId }, error };
}

function* sendFiatToCryptoRequestStep(bity, formData, airbitzPublicAddress) {
  const category = utils.getFiatToCryptoRequestCategoryParameter(formData.outputCurrencyCode);

  const dataForRequest = {
    ...formData,
    cryptoAddress: airbitzPublicAddress,
    category
  };

  const res = yield race({
    request: call(sendFiatToCryptoRequest, bity, dataForRequest),
    unauth: take(authStoreActions.UNAUTHENTICATED)
  });

  if (typeof res.unauth !== 'undefined') {
    return { canceled: true };
  }

  const { data, error } = res.request;
  return { data, error };
}

function* sendCryptoToFiatRequestStep(bity, formData) {
  const { inputCurrencyCode, outputCurrencyCode } = formData;
  const category = utils.getCryptoToFiatRequestCategoryParameter(inputCurrencyCode, outputCurrencyCode);

  const dataForRequest = {
    ...formData,
    category
  };

  const res = yield race({
    request: call(sendCryptoToFiatRequest, bity, dataForRequest),
    unauth: take(authStoreActions.UNAUTHENTICATED)
  });

  if (typeof res.unauth !== 'undefined') {
    return { canceled: true };
  }

  const { data, error } = res.request;
  return { data, error };
}

function* refreshQuotaStep() {
  yield put(quotaStoreActions.fetchData());

  const res = yield race({
    succeed: take(quotaStoreActions.FETCH_SUCCEED),
    failed: take(quotaStoreActions.FETCH_FAILED),
    canceled: take(quotaStoreActions.FETCH_CANCELED),
    unauth: take(authStoreActions.UNAUTHENTICATED)
  });

  if (typeof res.unauth !== 'undefined') {
    return { canceled: true };
  }
  return {};
}

function* askConfirmBtcSpendingStep(wallet, outputCryptoAddress, btcAmount) {
  const res = yield race({
    confirmationResult: call(askConfirmBtcSpending, wallet, outputCryptoAddress, btcAmount),
    unauth: take(authStoreActions.UNAUTHENTICATED)
  });

  if (typeof res.unauth !== 'undefined') {
    return { canceled: true };
  }

  const { data = {}, error } = res.confirmationResult;
  return { data, error };
}

// ==========================
// utils
// ==========================
function* getAirbitzWallet() {
  const promiseFactory = () => new Promise((resolve, reject) => {
    window.Airbitz.core.getSelectedWallet({
      success: resolve,
      error: reject
    });
  });

  try {
    const wallet = yield call(promiseFactory);
    return { data: wallet };
  } catch (e) {
    return { error: e };
  }
}

function* getPublicAddressOfAirbitzWallet(wallet, extraOpts = {}) {
  const defaultOpts = {
    label: 'Bity.com',
    category: 'Exchange:Buy Bitcoin',
    bizId: 10865,
    notes: utils.createNotesForAirbitz()
  };

  const opts = {
    ...defaultOpts,
    ...extraOpts
  };

  const promiseFactory = () => new Promise((resolve, reject) => {
    window.Airbitz.core.createReceiveRequest(wallet, {
      ...opts,
      success: resolve,
      error: reject
    });
  });

  try {
    const { address, requestId } = yield call(promiseFactory);
    return { data: { address, requestId } };
  } catch (e) {
    return { error: e };
  }
}

function disposePublicAddressOfAirbitzWallet(wallet, requestId) {
  window.Airbitz.core.finalizeReceiveRequest(wallet, requestId);
}

function* sendFiatToCryptoRequest(bity, formData) {
  try {
    const data = yield call(bity.orders.exchangeFiatToCrypto, formData);
    return { error: null, data };
  } catch (e) {
    return { error: e };
  }
}

function* sendCryptoToFiatRequest(bity, formData) {
  try {
    const data = yield call(bity.orders.exchangeCryptoToFiat, formData);
    return { error: null, data };
  } catch (e) {
    return { error: e };
  }
}

function* askConfirmBtcSpending(wallet, outputCryptoAddress, btcAmount) {
  const satoshiAmount = btcToSatoshi(btcAmount);

  const defaultOpts = {
    label: 'Bity.com',
    category: 'Exchange:Sell Bitcoin',
    notes: utils.createNotesForAirbitz()
  };

  const promiseFactory = () => new Promise((resolve, reject) => {
    const opts = {
      ...defaultOpts,
      success: resolve,
      error: reject
    };
    window.Airbitz.core.createSpendRequest(wallet, outputCryptoAddress, satoshiAmount, opts);
  });

  try {
    const result = yield call(promiseFactory);
    return { data: result };
  } catch (e) {
    return { error: e };
  }
}

function* sendCancelOrderRequest(bity, orderId) {
  try {
    const data = yield call(bity.orders.cancelOrder, orderId);
    return { error: null, data };
  } catch (e) {
    return { error: e };
  }
}

function btcToSatoshi(btcValue) {
  return Math.floor(btcValue * 100000000);
}
