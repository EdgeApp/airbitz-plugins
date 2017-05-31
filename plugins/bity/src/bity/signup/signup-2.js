import * as parser from './signup-2-response-parser';

const URL = '/user_signup/user_signup2/';

export default function signup2RequestFactory(ajax) {
  return (data) => {
    const { username, phoneNumber: phone, password } = data;

    const ajaxCfg = {
      method: 'POST',
      url: URL,
      data: {
        username,
        phone,
        password
      }
    };

    return ajax(ajaxCfg)
      .then(resp => parser.parseSuccessResponse(resp.data))
      .catch(resp => Promise.reject(parser.parseErrorResponse(resp.data)));
  };
}
