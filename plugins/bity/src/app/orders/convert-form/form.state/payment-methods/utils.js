import * as paymentMethodsUtils from '../../../../../bity/payment-methods/utils';
import { utils as currenciesUtils } from '../../../../common-data/currencies';
import { EMPTY_PAYMENT_METHOD_ID } from '../constants';

export function findEnabledPaymentMethodsByCurrencyCode(paymentMethods, quotaData, currencyCode) {
  return paymentMethodsUtils.findEnabledPaymentMethodsByCurrencyCode(paymentMethods, quotaData, currencyCode);
}

export function calcSelectedPaymentMethod(availablePaymentMethods, previousId) {
  if (isEmptyArray(availablePaymentMethods)) {
    return EMPTY_PAYMENT_METHOD_ID;
  }

  const isPartOf = availablePaymentMethods.some(obj => obj.code === previousId);
  if (isPartOf) {
    return previousId;
  }
  return availablePaymentMethods[0].code;
}

export function calcVisibilityOfPaymentMethodsUi(inputCurrencyCode, availablePaymentMethods) {
  if (!currenciesUtils.isFiatCurrency(inputCurrencyCode)) {
    return false;
  }
  return Array.isArray(availablePaymentMethods) && availablePaymentMethods.length > 1;
}

function isEmptyArray(obj) {
  return !Array.isArray(obj) || obj.length === 0;
}
