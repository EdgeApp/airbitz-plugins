import { BASE_URL } from './constants';
import * as utils from './utils';

export default function loadListOfBankAccountsFactory(ajax) {
  return (query = {}) => {
    const ajaxCfg = {
      method: 'GET',
      url: BASE_URL,
      query
    };

    return ajax(ajaxCfg)
      .then(resp => parse(resp.data))
      .catch(resp => Promise.reject(utils.parseErrorResponse(resp.data)));
  };
}

function parse({ objects = [] }) {
  return objects.map(utils.parseBankAccountData);
}
