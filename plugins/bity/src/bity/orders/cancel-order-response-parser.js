export default function parseCancelOrderResponse(data) {
  return {
    canceled: data.order_cancelled === true
  };
}
