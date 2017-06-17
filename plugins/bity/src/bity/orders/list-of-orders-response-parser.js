import * as constants from './constants';

export default function parse({ meta: rawMeta = {}, objects = [] }) {
  const orders = objects.map((rawOrder) => {
    const reference = getOrderReference(rawOrder);
    const date = getOrderDate(rawOrder);
    const status = getOrderStatus(rawOrder);
    const from = getTransactionInput(rawOrder);
    const to = getTransactionOutput(rawOrder);
    const id = extractOrderId(rawOrder);

    return {
      reference,
      date,
      status,
      from,
      to,
      id
    };
  });

  const meta = parseRawMeta(rawMeta);

  return { meta, orders };
}

function getOrderReference({ inputtransactions = [] }) {
  return inputtransactions[0].reference;
}

function getOrderDate({ timestamp_created: str }) {
  const parts = str.split(/[: T-]/).map(parseFloat);
  return new Date(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0, parts[5] || 0, 0);
}

// TODO DRY see ./order-details-parser.js
function getOrderStatus({ status }) {
  switch (status) {
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

function getTransactionInput({ inputtransactions: inputTransactions }) {
  const { currency, amount } = inputTransactions[0];
  return {
    currency,
    amount: parseFloat(amount)
  };
}

function getTransactionOutput(rawOrder) {
  const { outputtransactions: outputTransactions = [] } = rawOrder;

  if (outputTransactions.length > 0) {
    return {
      currency: outputTransactions[0].currency,
      amount: parseFloat(outputTransactions[0].amount)
    };
  }

  const { category = '' } = rawOrder;
  if (category.toLowerCase() === 'buy') {
    return {
      currency: constants.cryptoCurrencies.BTC,
      amount: NaN
    };
  }

  throw new Error(`Can't parse transaction output for order "${JSON.stringify(rawOrder)}"`);
}

function parseRawMeta(rawMeta = {}) {
  const {
    limit: rawLimit,
    offset: rawOffset,
    total_count: rawTotalCount,
    next: rawNextPageUrl,
    previous: rawPrevPageUrl
  } = rawMeta;

  const limit = parseInt(rawLimit, 10);
  const offset = parseInt(rawOffset, 10);
  const totalCount = parseInt(rawTotalCount, 10);

  const hasPrevPage = typeof rawPrevPageUrl === 'string' && rawPrevPageUrl.length > 0;
  const hasNextPage = typeof rawNextPageUrl === 'string' && rawNextPageUrl.length > 0;

  return {
    limit,
    offset,
    totalCount,
    prevPageUrl: rawPrevPageUrl,
    nextPageUrl: rawNextPageUrl,
    hasPrevPage,
    hasNextPage
  };
}

function extractOrderId({ resource_uri: v }) {
  const res = /([^/]+)\/?$/.exec(v);
  if (!Array.isArray(res) || res.length < 2) {
    throw new Error('Can\'t extract order id');
  }
  return res[1];
}
