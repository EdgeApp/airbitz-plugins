import authFactory from './auth';
import ajaxFactory from './ajax';
import prefixPluginFactory from './ajax/plugins/prefix-plugin';
import cookiesStorageFactory from './storage/cookies-storage';
import accountApiFactory from './account';
import ordersApiFactory from './orders';
import paymentMethodsApiFactory from './payment-methods';
import exchangeRatesApiFactory from './exchange-rates';
import bankAccountsApiFactory from './bank-accounts';
import quotaApiFactory from './quota';
import phoneApiFactory from './phone';
import signupApiFactory from './signup';

export default function createBityInstance(opts = {}) {
  const {
    clientId,
    host = '/',
    storage: externalStorage
  } = opts;

  let storage;
  if (typeof externalStorage === 'undefined') {
    storage = cookiesStorageFactory();
  } else {
    storage = externalStorage;
  }

  const { authAjaxPlugin, authApiFactory } = authFactory({
    clientId,
    storage
  });

  const baseAjax = ajaxFactory();

  // ajax used for auth requests
  // 1) ajax requests for auth uses different URL prefix
  // 2) we do not need to sign the ajax requests for auth
  const ajaxForAuth = prefixPluginFactory(host)(baseAjax);

  // ajax used for REST API requests
  const REST_API_PREFIX = '/api/v1'; // TODO REST API prefix should be declared in the external config

  let ajaxForApi = authAjaxPlugin(baseAjax);
  ajaxForApi = prefixPluginFactory(`${host}/${REST_API_PREFIX}`)(ajaxForApi);

  const accountApi = accountApiFactory(ajaxForApi);
  const ordersApi = ordersApiFactory(ajaxForApi);
  const exchangeRatesApi = exchangeRatesApiFactory(ajaxForApi);
  const paymentMethodsApi = paymentMethodsApiFactory(ajaxForApi);
  const bankAccountsApi = bankAccountsApiFactory(ajaxForApi);
  const quotaApi = quotaApiFactory(ajaxForApi);
  const phoneApi = phoneApiFactory(ajaxForApi);
  const signupApi = signupApiFactory(ajaxForApi);

  return {
    auth: authApiFactory(ajaxForAuth),
    account: accountApi,
    orders: ordersApi,
    exchangeRates: exchangeRatesApi,
    paymentMethods: paymentMethodsApi,
    bankAccounts: bankAccountsApi,
    quota: quotaApi,
    phone: phoneApi,
    signup: signupApi
  };
}
