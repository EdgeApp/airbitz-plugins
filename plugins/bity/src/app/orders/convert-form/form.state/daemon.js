import { spawn, take, put, select, race, call } from 'redux-saga/effects';

import * as notificationActions from '../../../notifications/actions';

import {
  selectors as exchangeRatesSelectors
} from '../../../common-data/exchange-rates';

import {
  selectors as quotaSelectors
} from '../../../common-data/quota';

import {
  selectors as paymentMethodsStoreSelectors
} from '../../../common-data/payment-methods';

import * as formActions from './form/actions';
import * as formSelectors from './form/selectors';
import * as bankAccountsActions from './bank-accounts/actions';

import * as exchangePartiesSelectors from './exchange-parties/selectors';
import * as bankAccountsSelectors from './bank-accounts/selectors';
import * as paymentMethodsSelectors from './payment-methods/selectors';
import * as externalReferenceSelectors from './external-reference/selectors';

import { actions as authActions } from '../../../common-data/auth';

import {
  actions as exchangeOrderActions,
  selectors as exchangeOrderSelectors
} from '../../../common-data/exchange-order';

import { data as bankAccountsDataStore } from '../../../common-data/bank-accounts';

export default function convertFormDaemonFactory() {
  return function* runConvertFormDaemon() {
    yield [
      yield spawn(onMounted),
      yield spawn(listenSubmitIntents),
      yield spawn(onBankAccountsChanged),
      yield spawn(listenUnauth)
    ];
  };
}

function* onMounted() {
  while (true) { // eslint-disable-line no-constant-condition
    yield take(formActions.MOUNTED);

    const rates = yield select(exchangeRatesSelectors.getData);
    const quota = yield select(quotaSelectors.getData);
    const bankAccounts = yield select(bankAccountsDataStore.selectors.getData);
    const paymentMethods = yield select(paymentMethodsStoreSelectors.getData);

    yield put(formActions.setupInitialStateData({
      rates,
      quota,
      bankAccounts,
      paymentMethods
    }));
  }
}

function* onBankAccountsChanged() {
  while (true) { // eslint-disable-line no-constant-condition
    yield take(bankAccountsDataStore.actions.CHANGED);
    const isMounted = yield select(formSelectors.isMounted);
    if (!isMounted) {
      continue; // eslint-disable-line no-continue
    }
    const data = yield select(bankAccountsDataStore.selectors.getData);
    yield put(bankAccountsActions.allAccountsChanged(data));
  }
}

function* listenSubmitIntents() {
  while (true) { // eslint-disable-line no-constant-condition
    const { payload: router } = yield take(formActions.SUBMIT);

    const rawInputAmount = yield select(exchangePartiesSelectors.getInputAmount);
    const inputAmount = parseFloat(rawInputAmount);
    const inputCurrencyCode = yield select(exchangePartiesSelectors.getInputSelectedCurrencyCode);
    const outputCurrencyCode = yield select(exchangePartiesSelectors.getOutputSelectedCurrencyCode);
    const paymentMethodCode = yield select(paymentMethodsSelectors.getSelectedPaymentMethodId);
    const externalReference = yield select(externalReferenceSelectors.getExternalReference);

    const allBankAccounts = yield select(bankAccountsSelectors.getAllBankAccounts);
    const bankAccountId = yield select(bankAccountsSelectors.getSelectedAccountId);
    const bankAccountUuid = getBankAccountUuid(allBankAccounts, bankAccountId);

    const formData = {
      inputAmount,
      inputCurrencyCode,
      outputCurrencyCode,
      bankAccountUuid,
      paymentMethodCode,
      externalReference
    };
    yield put(exchangeOrderActions.createOrder(formData));

    const res = yield race({
      canceled: take(exchangeOrderActions.CANCELED),
      failed: take(exchangeOrderActions.FAILED),
      succeed: take(exchangeOrderActions.SUCCEED)
    });

    if (typeof res.canceled !== 'undefined') {
      continue; // eslint-disable-line no-continue
    }

    const isSucceed = typeof res.succeed !== 'undefined';
    if (isSucceed) {
      yield call(processSuccessfulResult, router);
    } else {
      yield call(processFailedResult, router, res.failed.payload);
    }
  }
}

function* listenUnauth() {
  while (true) { // eslint-disable-line no-constant-condition
    yield take(authActions.UNAUTHENTICATED);
    yield put(formActions.reset());
  }
}

function* processSuccessfulResult(router) {
  const isMounted = yield select(formSelectors.isMounted);
  if (isMounted) {
    yield call(redirectToSuccessPage, router);
  } else {
    yield call(showSuccessNotification);
  }

  yield put(formActions.reset());
}

function* processFailedResult(router) {
  const isAirbitzWalletError = yield select(exchangeOrderSelectors.hasAirbitzWalletError);
  const isAirbitzPublicAddressError = yield select(exchangeOrderSelectors.hasAirbitzPublicAddressError);
  const isRequestError = yield select(exchangeOrderSelectors.hasRequestError);
  const isConfirmSpendingError = yield select(exchangeOrderSelectors.hasConfirmSpendingError);

  switch (true) {
    case isAirbitzWalletError:
      yield call(processAirbitzWalletError);
      break;
    case isAirbitzPublicAddressError:
      yield call(processAirbitzPublicAddressError);
      break;
    case isRequestError:
      yield call(processRequestError, router);
      break;
    case isConfirmSpendingError:
      yield call(processConfirmSpendingError);
      break;
  }
}

function* processAirbitzWalletError() {
  yield call(showNotification, 'Error', 'Can\'t obtain the Airbitz wallet');
}

function* processAirbitzPublicAddressError() {
  yield call(showNotification, 'Error', 'Can\'t obtain the Airbitz public address');
}

function* processRequestError(router) {
  const isMounted = yield select(formSelectors.isMounted);

  // We expects that the result of exchangeOrderSelectors.getRequestError is a raw response
  const { data: { error: { code, message: rawMsg } } } = yield select(exchangeOrderSelectors.getRequestError);

  if (code === 'payment_amount_exceeds_quota' && isMounted) {
    // TODO DRY for URL
    // TODO get rid of router
    yield call(router.replace, '/quota/exceeded');
    return;
  }

  let msg = rawMsg;
  switch (code) {
    // TODO DRY for error code
    case 'payment_amount_exceeds_quota':
      msg = 'Amount exceeds quota';
      break;
  }

  yield call(showErrorNotification, msg);
}

function* processConfirmSpendingError() {
  yield call(showNotification, 'Error', 'Can\'t obtain confirmation for spending');
}

function* redirectToSuccessPage(router) {
  // TODO DRY for url
  // TODO get rid of router
  yield call(router.push, 'convert/success');
}

function* showSuccessNotification() {
  const title = 'Success';
  const msg = 'Your order has been placed';
  yield call(showNotification, title, msg);
}

function* showErrorNotification(reasonMsg) {
  const title = 'Error';
  const msg = `Your order has not been placed.\n${reasonMsg}`;
  yield call(showNotification, title, msg);
}

function* showNotification(title, msg) {
  yield put(notificationActions.notify({ title, msg }));
}

function getBankAccountUuid(bankAccounts, bankAccountId) {
  const list = bankAccounts.filter(({ id }) => id === bankAccountId);
  if (list.length === 0) {
    return '';
  }
  return list[0].uuid;
}
