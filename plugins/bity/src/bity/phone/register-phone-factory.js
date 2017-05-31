import { BASE_URL } from './constants';
import { parseErrorResponse } from './utils';

export default function registerPhoneFactory(ajax) {
  return (phoneNumber, userId) => {
    const ajaxCfg = {
      method: 'POST',
      url: BASE_URL,
      data: {
        cli: phoneNumber,
        person: createPersonResourceUrl(userId)
      }
    };

    return ajax(ajaxCfg)
      .then(resp => parseResponse(resp.data))
      .catch(resp => Promise.reject(parseErrorResponse(resp.data)));
  };
}

function parseResponse() {
  // This resource returns nothing if everything is okay
  return {
    success: true
  };
}

// TODO DRY. This should be in another place
// TODO get rid of the hardcoded value '/api/v1/'
// TODO why we need this?
function createPersonResourceUrl(userId) {
  return `/api/v1/person/${userId}/`;
}
