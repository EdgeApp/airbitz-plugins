import parse from './order-details-parser';

const URL = '/order/';

export default function getOrderDetailsFactory(ajax) {
  return (orderId) => {
    const ajaxCfg = {
      method: 'GET',
      url: `${URL}/${orderId}/`
    };

    return ajax(ajaxCfg)
      .then(resp => parse(resp.data));
  };
}
