import { BASE_URL } from './constants';
import { parseBankAccountData, parseErrorResponse } from './utils';

export default function registerBankAccountFactory(ajax) {
  return (data, userId) => {
    const {
      bankName: bankname,
      bicOrSwift: bicswift,
      iban,
      currencyCode,
      accountHolderName: owner_name,
      personalLabel: label,

      // address data
      country = '',
      state = '',
      city = '',
      address1 = '',
      address2 = '',
      zipCode: zipcode = ''
    } = data;

    const currency = currencyCodeToCurrencyUrl(currencyCode);
    const person = userIdToPersonUrl(userId);

    const requestData = {
      bankname,
      bicswift,
      iban,
      currency,
      owner_name,
      label,
      person,
      country,
      state,
      city,
      address1,
      address2,
      zipcode
    };

    const ajaxCfg = {
      method: 'POST',
      url: BASE_URL,
      data: requestData
    };

    return ajax(ajaxCfg)
      .then(resp => parseBankAccountData(resp.data))
      .catch(resp => Promise.reject(parseErrorResponse(resp.data)));
  };
}

// TODO DRY. This should be in another place
// TODO get rid of the hardcoded value '/api/v1/'
// TODO why we need this?
function currencyCodeToCurrencyUrl(currencyCode) {
  return `/api/v1/currency/${currencyCode}/`;
}

// TODO DRY. This should be in another place
// TODO get rid of the hardcoded value '/api/v1/'
// TODO why we need this?
function userIdToPersonUrl(userId) {
  return `/api/v1/person/${userId}/`;
}
