import { fetchAllRatesFactory } from './exchange-rates';

export default function exchangeRatesApiFactory(ajax) {
  return {
    fetchAllRates: fetchAllRatesFactory(ajax)
  };
}
