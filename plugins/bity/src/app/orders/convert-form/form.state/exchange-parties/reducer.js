import * as actions from './actions';
import * as utils from './utils';

export default function exchangePartiesReducer(state, action) {
  switch (action.type) {
    case actions.INPUT_AMOUNT_CHANGED:
      return onInputAmountChanged(state, action);
    case actions.OUTPUT_AMOUNT_CHANGED:
      return onOutputAmountChanged(state, action);
    case actions.INPUT_CURRENCY_CODE_CHANGED:
      return onInputCurrencyCodeChanged(state, action);
    case actions.OUTPUT_CURRENCY_CODE_CHANGED:
      return onOutputCurrencyCodeChanged(state, action);
    case actions.RATES_CHANGED:
      return onRatesChanged(state, action);
    case actions.SWAPPED_AROUND:
      return onSwap(state, action);
    default:
      return state;
  }
}

function onInputAmountChanged(state, action) {
  const { payload: amount } = action;
  const nextState = {
    ...state,
    exchangeParties: {
      ...state.exchangeParties,
      input: {
        ...state.exchangeParties.input,
        amount
      }
    }
  };

  const { meta: { isInternal } } = action;
  if (isInternal) {
    return nextState;
  }

  return recalculateAndUpdateOutputAmount(nextState);
}

function onOutputAmountChanged(state, action) {
  const { payload: amount } = action;
  const nextState = {
    ...state,
    exchangeParties: {
      ...state.exchangeParties,
      output: {
        ...state.exchangeParties.output,
        amount
      }
    }
  };

  const { meta: { isInternal } } = action;
  if (isInternal) {
    return nextState;
  }

  return updateInputAmountWhenOutputChanged(nextState);
}

function recalculateAndUpdateOutputAmount(state) {
  const inputAmount = state.exchangeParties.input.amount;
  const inputCurrencyCode = state.exchangeParties.input.selectedCurrencyCode;
  const outputCurrencyCode = state.exchangeParties.output.selectedCurrencyCode;
  const rates = state.rates;

  const outputAmount = utils.calcOutputAmount(inputAmount, inputCurrencyCode, outputCurrencyCode, rates);
  return exchangePartiesReducer(state, actions.outputAmountChanged(outputAmount, true));
}

function updateInputAmountWhenOutputChanged(state) {
  const outputAmount = state.exchangeParties.output.amount;
  const inputCurrencyCode = state.exchangeParties.input.selectedCurrencyCode;
  const outputCurrencyCode = state.exchangeParties.output.selectedCurrencyCode;
  const rates = state.rates;

  const inputAmount = utils.calcInputAmount(outputAmount, inputCurrencyCode, outputCurrencyCode, rates);
  return exchangePartiesReducer(state, actions.inputAmountChanged(inputAmount, true));
}

function onInputCurrencyCodeChanged(state, { payload: selectedCurrencyCode }) {
  const nextState = {
    ...state,
    exchangeParties: {
      ...state.exchangeParties,
      input: {
        ...state.exchangeParties.input,
        selectedCurrencyCode
      }
    }
  };

  return recalculateAndUpdateOutputAmount(nextState);
}

function onOutputCurrencyCodeChanged(state, { payload: selectedCurrencyCode }) {
  const nextState = {
    ...state,
    exchangeParties: {
      ...state.exchangeParties,
      output: {
        ...state.exchangeParties.output,
        selectedCurrencyCode
      }
    }
  };

  return recalculateAndUpdateOutputAmount(nextState);
}

function onRatesChanged(state) {
  return recalculateAndUpdateOutputAmount(state);
}

function onSwap(state) {
  const {
    exchangeParties: {
      input: prevInput,
      output: prevOutput
    }
  } = state;

  const nextState = {
    ...state,
    exchangeParties: {
      ...state.exchangeParties,
      input: prevOutput,
      output: prevInput
    }
  };

  return recalculateAndUpdateOutputAmount(nextState);
}
