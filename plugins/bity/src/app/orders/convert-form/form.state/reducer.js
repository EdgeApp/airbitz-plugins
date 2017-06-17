import { EMPTY_AMOUNT, EMPTY_ACCOUNT_ID, EMPTY_PAYMENT_METHOD_ID } from './constants';
import { fiatCurrencies, cryptoCurrencies } from '../../../common-data/currencies';

import formReducer from './form/reducer';
import * as formActions from './form/actions';

import ratesReducer from './rates/reducer';
import * as ratesActions from './rates/actions';

import quotaReducer from './quota/reducer';
import * as quotaActions from './quota/actions';

import exchangePartiesReducer from './exchange-parties/reducer';
import * as exchangePartiesActions from './exchange-parties/actions';

import bankAccountsReducer from './bank-accounts/reducer';
import * as bankAccountsActions from './bank-accounts/actions';

import paymentMethodsReducer from './payment-methods/reducer';
import * as paymentMethodsActions from './payment-methods/actions';

import externalReferenceReducer from './external-reference/reducer';
import * as externalReferenceActions from './external-reference/actions';

import errorsReducer from './errors/reducer';
import * as errorsActions from './errors/actions';

const ratesActionTypes = extractActionTypes(ratesActions);
const quotaActionTypes = extractActionTypes(quotaActions);
const exchangePartiesActionTypes = extractActionTypes(exchangePartiesActions);
const bankAccountsActionTypes = extractActionTypes(bankAccountsActions);
const paymentMethodsActionTypes = extractActionTypes(paymentMethodsActions);
const externalReferenceActionTypes = extractActionTypes(externalReferenceActions);

const allActionTypes = [].concat(
  ratesActionTypes,
  quotaActionTypes,
  exchangePartiesActionTypes,
  bankAccountsActionTypes,
  externalReferenceActionTypes,
  paymentMethodsActionTypes
);

const currencyListA = fiatCurrencies.map(({ code }) => code);
const currencyListB = cryptoCurrencies.map(({ code }) => code);

const initialState = {
  rates: {},
  quota: {},
  exchangeParties: {
    input: {
      amount: EMPTY_AMOUNT,
      selectedCurrencyCode: currencyListA[0],
      currencyList: currencyListA
    },
    output: {
      amount: EMPTY_AMOUNT,
      selectedCurrencyCode: currencyListB[0],
      currencyList: currencyListB
    }
  },
  bankAccounts: {
    all: [],
    available: [],
    selectedId: EMPTY_ACCOUNT_ID
  },
  paymentMethods: {
    all: [],
    available: [],
    selectedId: EMPTY_PAYMENT_METHOD_ID,
    showUi: false
  },
  externalReference: '',
  errors: {
    input: {
      positiveNumber: false,
      min: false,
      max: false,
      minAllowedValue: EMPTY_AMOUNT,
      maxAllowedValue: EMPTY_AMOUNT
    },
    bankAccounts: {
      required: false
    },
    externalReference: {
      max: false
    },
    form: {
      invalid: false
    }
  },
  form: {
    mounted: false,
    showBankAccounts: false, // TODO this needs a better place in the state
    showExternalReference: false // TODO this needs a better place in the state
  }
};

export default function convertFormReducer(state = initialState, action = {}) {
  switch (action.type) {
    case formActions.SETUP_INITIAL_STATE_DATA:
      return onSetupInitialData(state, action);
    case formActions.MOUNTED:
      return formReducer(state, action);
    case formActions.RESET:
      return resetState(state, action);
    default:
      return processOtherActions(state, action);
  }
}

function onSetupInitialData(state, { payload }) {
  const { rates, quota, bankAccounts, paymentMethods } = payload;

  let nextState = { ...state };

  nextState = convertFormReducer(nextState, ratesActions.ratesChanged(rates));
  nextState = convertFormReducer(nextState, quotaActions.quotaChanged(quota));
  nextState = convertFormReducer(nextState, bankAccountsActions.allAccountsChanged(bankAccounts));
  nextState = convertFormReducer(nextState, paymentMethodsActions.paymentMethodsChanged(paymentMethods));

  return nextState;
}

function resetState() {
  return { ...initialState };
}

function processOtherActions(state, action) {
  let nextState = processOwnAction(state, action);
  nextState = updateAnotherPartOfState(nextState, action);
  nextState = updateErrorsState(nextState, action);
  nextState = formReducer(nextState, action);
  return nextState;
}

function processOwnAction(state, action) {
  const isRatesAction = ratesActionTypes.indexOf(action.type) !== -1;
  const isQuotaAction = quotaActionTypes.indexOf(action.type) !== -1;
  const isExchangePartiesAction = exchangePartiesActionTypes.indexOf(action.type) !== -1;
  const isBankAccountsAction = bankAccountsActionTypes.indexOf(action.type) !== -1;
  const isPaymentMethodsAction = paymentMethodsActionTypes.indexOf(action.type) !== -1;
  const isExternalReferenceAction = externalReferenceActionTypes.indexOf(action.type) !== -1;

  switch (true) {
    case isRatesAction:
      return ratesReducer(state, action);
    case isQuotaAction:
      return quotaReducer(state, action);
    case isExchangePartiesAction:
      return exchangePartiesReducer(state, action);
    case isBankAccountsAction:
      return bankAccountsReducer(state, action);
    case isPaymentMethodsAction:
      return paymentMethodsReducer(state, action);
    case isExternalReferenceAction:
      return externalReferenceReducer(state, action);
    default:
      return state;
  }
}

function updateAnotherPartOfState(state, action) {
  let nextState = { ...state };

  if (action.type === ratesActions.RATES_CHANGED) {
    nextState = afterRatesChanged(nextState, action);
  }

  if (action.type === quotaActions.QUOTA_CHANGED) {
    nextState = afterQuotaChanged(state, action);
  }

  if (action.type === bankAccountsActions.ALL_ACCOUNTS_CHANGED) {
    nextState = afterBankAccountsChanged(state, action);
  }

  nextState = updateBankAccounts(nextState, action);
  nextState = updatePaymentMethods(nextState, action);

  return nextState;
}

function updateErrorsState(state, action) {
  if (allActionTypes.indexOf(action.type) === -1) {
    return state;
  }
  return errorsReducer(state, errorsActions.validateAll());
}

function afterRatesChanged(state) {
  return processOtherActions(state, exchangePartiesActions.ratesChanged());
}

function afterQuotaChanged(state) {
  return state;
}

function afterBankAccountsChanged(state) {
  return state;
}

function updateBankAccounts(state, action) {
  switch (action.type) {
    case exchangePartiesActions.OUTPUT_CURRENCY_CODE_CHANGED:
    case exchangePartiesActions.SWAPPED_AROUND:
      return bankAccountsReducer(state, action);
    default:
      return state;
  }
}

function updatePaymentMethods(state, action) {
  switch (action.type) {
    case exchangePartiesActions.OUTPUT_CURRENCY_CODE_CHANGED:
    case exchangePartiesActions.SWAPPED_AROUND:
      return paymentMethodsReducer(state, action);
    default:
      return state;
  }
}

function extractActionTypes(obj) {
  return Object.keys(obj)
    .filter(key => typeof obj[key] === 'string')
    .map(key => obj[key]);
}
