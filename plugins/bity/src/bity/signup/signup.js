import * as parser from './signup-2-response-parser';

const URL = '/user_signup/user_signup/';

export default function signupRequestFactory(ajax) {
  return (data) => {
    const { username, email, password, affiliateCode } = data;

    const requestData = {
      username,
      email,
      password
    };

    if (typeof affiliateCode === 'string' && affiliateCode.length > 0) {
      requestData.code = affiliateCode;
    }

    const ajaxCfg = {
      method: 'POST',
      url: URL,
      data: requestData
    };

    return ajax(ajaxCfg)
      .then(resp => parser.parseSuccessResponse(resp.data))
      .catch(resp => Promise.reject(parser.parseErrorResponse(resp.data)));
  };
}
