import { fetchAllPaymentMethodsFactory } from './payment-methods';

export default function paymentMethodsApiFactory(ajax) {
  return {
    fetchAllMethods: fetchAllPaymentMethodsFactory(ajax)
  };
}
