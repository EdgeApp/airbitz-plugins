export default function parse({ objects = [] }) {
  return objects.map(obj => ({
    pair: obj.pair,
    rateWeBuy: parseFloat(obj.rate_we_buy),
    rateWeSell: parseFloat(obj.rate_we_sell)
  }));
}
