import parse from './list-of-orders-response-parser';

const URL = '/order/';

export default function fetchListOfOrdersFactory(ajax) {
  return (query = {}) => {
    const ajaxCfg = {
      method: 'GET',
      url: URL,
      query
    };

    return ajax(ajaxCfg)
      .then(resp => parse(resp.data));
  };
}
