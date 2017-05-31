import * as utils from './utils';

export default function parse({ objects = [] }) {
  return objects.map((obj) => {
    const countries = obj.countries.map(utils.extractCountryCodeFromUrl);
    const currencies = obj.currencies.map(utils.extractCurrencyCodeFromUrl);
    const code = obj.payment_method_code;
    const provider = utils.extractProviderData(obj);
    const descriptions = utils.extractDescriptions(obj);

    return {
      countries,
      currencies,
      code,
      provider,
      descriptions
    };
  });
}
