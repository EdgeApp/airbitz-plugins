import parse from './response-parser';

const URL = '/rate2/';

export function fetchAllRatesFactory(ajax) {
  return () => {
    const ajaxCfg = {
      method: 'GET',
      url: URL
    };

    return ajax(ajaxCfg)
      .then(resp => parse(resp.data));
  };
}
