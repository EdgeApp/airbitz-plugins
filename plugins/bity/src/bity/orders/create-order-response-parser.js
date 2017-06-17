import parseOrderDetails from './order-details-parser';

export default function parse(data) {
  return parseOrderDetails(data);
}

export function parseCryptoToFiatResponse(data) {
  const outputCryptoAddress = data.payment_url;
  const orderId = extractOrderId(data);

  return {
    outputCryptoAddress,
    orderId
  };
}

function extractOrderId({ resource_uri: v }) {
  const res = /([^/]+)\/?$/.exec(v);
  if (!Array.isArray(res) || res.length < 2) {
    throw new Error('Can\'t extract order id');
  }
  return res[1];
}
