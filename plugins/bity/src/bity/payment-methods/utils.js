import * as quotaUtils from '../quota/utils';

export function findEnabledPaymentMethodsByCurrencyCode(paymentMethods, quotaData, inputCurrencyCode) {
  const quotaGroup = quotaUtils.getQuotaGroup(quotaData);
  return paymentMethods
    .filter(obj => filterByCurrency(obj, inputCurrencyCode))
    .filter(obj => isPaymentMethodEnabled(obj, quotaGroup))
    .filter(obj => !isDeprecatedPaymentMethod(obj))
    .filter(obj => isAllowedFiatPaymentMethod(obj, inputCurrencyCode));
}

function filterByCurrency({ currencies }, currencyCode) {
  return currencies.indexOf(currencyCode) > -1;
}

function isPaymentMethodEnabled(paymentMethod) {
  const { code, provider } = paymentMethod;
  // XXX: For now, we just allow BANKXFER and BTCGATEWAY, so we filter out fast bank transfer methods
  if ((code === 'SKRILLPSP' || code === 'SOFORTPSP')) {
    return false;
  }

  return provider.enabled === true;
}

const deprecatedPaymentMethodCodes = [
  'STRAIGHT'
];
function isDeprecatedPaymentMethod({ code }) {
  return deprecatedPaymentMethodCodes.indexOf(code) !== -1;
}

const allowedFiatToCryptoPaymentMethodCodes = [
  'BANKXFER'
];

function isAllowedFiatPaymentMethod({ code }, inputCurrencyCode) {
  if (!isFiatCurrency(code)) {
    return true;
  }
  return allowedFiatToCryptoPaymentMethodCodes.indexOf(inputCurrencyCode) > -1;
}

// TODO DRY
const fiatCurrencyCodes = ['EUR', 'CHF'];
function isFiatCurrency(currencyCode) {
  return fiatCurrencyCodes.indexOf(currencyCode) > -1;
}

// ==========================
// parse raw response data
// ==========================
export function extractCurrencyCodeFromUrl(url) {
  const res = /([^/]+)\/?$/.exec(url);
  if (!Array.isArray(res) || res.length < 2) {
    throw new Error('Can\'t extract currency code');
  }
  return res[1];
}

export function extractCountryCodeFromUrl(url) {
  const res = /([^/]+)\/?$/gi.exec(url);
  if (!Array.isArray(res) || res.length < 2) {
    throw new Error('Can\'t extract country code');
  }
  return res[1];
}

export function extractProviderData(rawPaymentMethodData) {
  const {
    payment_provider: {
      accounts: rawAccounts = [],
      close_time: closeTime,
      is_24hrs: is24Hrs,
      is_open: isOpen,
      open_time: openTime,
      open_weekend: openWeekend,
      provider_enabled: enabled,
      provider_name: name
    }
  } = rawPaymentMethodData;

  const accounts = rawAccounts.map((obj) => {
    const { currency, details, name } = obj;
    const currencyCode = extractCurrencyCode(currency);

    return {
      currencyCode,
      details,
      name
    };
  });

  return {
    accounts,
    closeTime,
    is24Hrs,
    isOpen,
    openTime,
    openWeekend,
    enabled,
    name
  };
}

// TODO DRY
function extractCurrencyCode(url = '') {
  const res = /([^/]+)\/?$/.exec(url);
  if (!Array.isArray(res) || res.length < 2) {
    throw new Error('Can\'t extract currency code');
  }
  return res[1];
}

export function extractDescriptions({ text = [] }) {
  return text.map((obj) => {
    const {
      payment_method_description: description,
      payment_method_disabled_message: disabledMessage,
      payment_method_image_path: imagePath,
      payment_method_locale: locale,
      payment_method_name: name
    } = obj;

    return {
      description,
      disabledMessage,
      imagePath,
      locale,
      name
    };
  });
}
