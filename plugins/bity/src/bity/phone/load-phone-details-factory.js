import { BASE_URL } from './constants';
import * as utils from './utils';

export default function loadPhoneDetailsFactory(ajax) {
  return (id) => {
    const ajaxCfg = {
      method: 'GET',
      url: `${BASE_URL}/${id}/`
    };

    return ajax(ajaxCfg)
      .then(resp => parse(resp.data))
      .catch(resp => Promise.reject(utils.parseErrorResponse(resp.data)));
  };
}

function parse(data) {
  return utils.parsePhoneData(data);
}
