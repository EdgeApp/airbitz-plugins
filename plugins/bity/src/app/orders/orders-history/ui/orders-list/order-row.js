import React, { PropTypes } from 'react';
import { withRouter } from 'react-router';
import numeral from 'numeral';
import * as bityConstants from '../../../../../bity/orders/constants';
import styles from './styles.less';
import * as utils from './utils';

const fiatCurrencies = { ...bityConstants.fiatCurrencies };

const cryptoCurrencies = { ...bityConstants.cryptoCurrencies };

const currencies = {
  ...fiatCurrencies,
  ...cryptoCurrencies
};

export const orderPropType = PropTypes.shape({
  reference: PropTypes.string.isRequired,
  date: PropTypes.instanceOf(Date),
  status: PropTypes.object.isRequired,
  from: PropTypes.shape({
    currency: PropTypes.oneOf(Object.values(currencies)),
    amount: PropTypes.number.isRequired
  }).isRequired,
  to: PropTypes.shape({
    currency: PropTypes.oneOf(Object.values(currencies)),
    amount: PropTypes.number.isRequired
  }).isRequired
});

const propTypes = {
  order: orderPropType.isRequired,
  router: PropTypes.object.isRequired
};

export default withRouter(OrderRow);

function OrderRow({ order, router }) {
  const { reference, id } = order;

  const statusTitle = getOrderStatusTitle(order);

  return (
    <div className={styles.row} onClick={handleClick}>
      <div className={styles.cellReference}>{reference}</div>
      <div className={styles.cellType}>{getOrderTypeTitle(order)}</div>
      <div className={styles.cellDate}>{getOrderDateTitle(order)}</div>
      <div className={styles.cellAmount}>{getOrderAmountTitle(order)}</div>
      <div className={styles.cellStatus}>{statusTitle}</div>
    </div>
  );

  function handleClick(event) {
    event.preventDefault();
    // TODO router.push should be in another place
    router.push(`orders/${id}`);
  }
}

OrderRow.propTypes = propTypes;

// --------------------------
// title for order type
// --------------------------
function getOrderTypeTitle(order) {
  const { from, to } = order;

  const isSaleOfCryptoCurrency = isCryptoCurrency(from.currency);
  if (isSaleOfCryptoCurrency) {
    return `${from.currency} sell`;
  }

  const isPurchaseOfCryptoCurrency = isCryptoCurrency(to.currency);
  if (isPurchaseOfCryptoCurrency) {
    return `${to.currency} purchase`;
  }

  throw new Error(`Unknown condition for order "${JSON.stringify(order)}"`);
}

function isFiatCurrency(v) {
  return Object.values(fiatCurrencies).indexOf(v) !== -1;
}

function isCryptoCurrency(v) {
  return Object.values(cryptoCurrencies).indexOf(v) !== -1;
}

function isEmptyAmount(v) {
  return isNaN(parseFloat(v));
}

// --------------------------
// title for order amount
// --------------------------
const cryptoCurrencyFormat = '0.0000';
const fiatCurrencyFormat = '0,0.00';

function getOrderAmountTitle({ from, to }) { // eslint-disable-line react/prop-types
  return (
    <span>
      {createAmountPart(from)}
      <span className="orders__icon-arrow-right" />
      {createAmountPart(to)}
    </span>
  );
}

function createAmountPart({ currency, amount }) { // eslint-disable-line react/prop-types
  if (isEmptyAmount(amount)) {
    return null;
  }

  let title;
  if (isCryptoCurrency(currency)) {
    title = `${numeral(amount).format(cryptoCurrencyFormat)} ${currency}`;
  } else if (isFiatCurrency(currency)) {
    title = `${numeral(amount).format(fiatCurrencyFormat)} ${currency}`;
  } else {
    throw new Error(`Unknown condition: currency "${currency}", amount: "${amount}"`);
  }

  return (<span>{title}</span>);
}

// --------------------------
// title for order status
// --------------------------
function getOrderStatusTitle({ status }) {
  return utils.getOrderStatusTitle(status);
}

// --------------------------
// title for order date
// --------------------------
const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

function getOrderDateTitle({ date }) {
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}
