export default function parseOrderDetails(data) {
  const orderId = extractOrderId(data);
  const orderStatus = makeStatusDetails(data.status);
  const personId = extractPersonId(data);
  const input = extractInputTransactionDetails(data);
  const output = extractOutputTransactionDetails(data);

  return {
    id: orderId,
    personId,
    input,
    output,
    status: orderStatus,
    raw: data
  };
}

function extractOrderId({ resource_uri: v }) {
  const res = /([^/]+)\/?$/.exec(v);
  if (!Array.isArray(res) || res.length < 2) {
    throw new Error('Can\'t extract order id');
  }
  return res[1];
}

function extractInputTransactionDetails(data) {
  const { inputtransactions = [] } = data;
  const raw = inputtransactions[0];

  const {
    amount: rawAmount,
    currency: currencyCode,
    payment_method: paymentMethodUrl,
    reference,
    status: rawStatus
  } = raw;

  const amount = parseFloat(rawAmount);
  const paymentMethodCode = extractPaymentMethodCode(paymentMethodUrl);
  const status = makeStatusDetails(rawStatus);

  return {
    amount,
    currencyCode,
    paymentMethodCode,
    reference,
    status
  };
}

function extractOutputTransactionDetails(data) {
  const { outputtransactions = [] } = data;
  const raw = outputtransactions[0];

  // this may occurs if there is an exchange from fiat to crypto
  if (typeof raw === 'undefined') {
    return {
      amount: NaN,
      currencyCode: '',
      paymentMethodCode: '',
      reference: '',
      status: {}
    };
  }

  const {
    amount: rawAmount,
    currency: currencyCode,
    payout_method: paymentMethodUrl,
    reference,
    status: rawStatus
  } = raw;

  const amount = parseFloat(rawAmount);
  const paymentMethodCode = extractPaymentMethodCode(paymentMethodUrl);
  const status = makeStatusDetails(rawStatus);

  return {
    amount,
    currencyCode,
    paymentMethodCode,
    reference,
    status
  };
}

function extractPaymentMethodCode(v = '') {
  const res = /([^/]+)\/?$/.exec(v);
  if (!Array.isArray(res) || res.length < 2) {
    throw new Error('Can\'t extract payment method code');
  }
  return res[1];
}

function extractPersonId({ person = '' }) {
  const res = /([^/]+)\/?$/.exec(person);
  if (!Array.isArray(res) || res.length < 2) {
    throw new Error('Can\'t extract person id');
  }
  return res[1];
}

// TODO DRY see ./list-of-orders-response-parser.js
function makeStatusDetails(v) {
  switch (v) {
    case 'OPEN':
      return {
        isOpen: true
      };
    case 'CANC':
      return {
        isCanceled: true
      };
    case 'RCVE':
      return {
        isPaymentReceived: true
      };
    case 'CONF':
      return {
        isConfirmed: true
      };
    case 'FILL':
      return {
        isPaymentFinalized: true
      };
    default:
      return {};
  }
}
