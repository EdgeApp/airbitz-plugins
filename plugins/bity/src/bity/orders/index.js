import fetchListOfOrdersFactory from './fetch-list-of-orders';
import * as createOrder from './create-order';
import cancelOrderFactory from './cancel-order';
import getOrderDetailsFactory from './get-order-details';

export default function ordersApiFactory(ajax) {
  return {
    fetchListOfOrders: fetchListOfOrdersFactory(ajax),
    exchangeFiatToCrypto: createOrder.exchangeFiatToCryptoFactory(ajax),
    exchangeCryptoToFiat: createOrder.exchangeCryptoToFiatFactory(ajax),
    cancelOrder: cancelOrderFactory(ajax),
    getOrderDetails: getOrderDetailsFactory(ajax)
  };
}
