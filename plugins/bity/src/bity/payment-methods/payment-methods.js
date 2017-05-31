import parse from './response-parser';

const URL = '/payment_method/';

export function fetchAllPaymentMethodsFactory(ajax) {
  return () => {
    const ajaxCfg = {
      method: 'GET',
      url: URL
    };

    return ajax(ajaxCfg)
      .then(resp => parse(resp.data));
  };
}
