import { BASE_URL } from './constants';
import { parseErrorResponse } from './utils';

export default function submitVerificationCodeFactory(ajax) {
  return (phoneNumber, verificationCode) => {
    const ajaxCfg = {
      method: 'POST',
      url: `${BASE_URL}/verifycode/`,
      data: {
        cli: phoneNumber,
        verifycode: verificationCode
      }
    };

    return ajax(ajaxCfg)
      .then(resp => parse(resp.data))
      .catch(resp => Promise.reject(parseErrorResponse(resp.data)));
  };
}

function parse() {
  // This resource returns nothing if everything is okay
  return {
    success: true
  };
}
