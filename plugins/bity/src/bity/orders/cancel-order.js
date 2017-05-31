import parse from './cancel-order-response-parser';

const URL = '/order/';

export default function cancelOrderFactory(ajax) {
  return (orderId) => {
    const ajaxCfg = {
      method: 'POST',
      url: `${URL}/${orderId}/cancel/`,
      data: {}
    };

    return ajax(ajaxCfg)
      .then(resp => parse(resp.data));
  };
}
