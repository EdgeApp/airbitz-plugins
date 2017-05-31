import signupRequestFactory from './signup';
import signup2RequestFactory from './signup-2';

export default function signupApiFactory(ajax) {
  return {
    signup: signupRequestFactory(ajax),
    signup2: signup2RequestFactory(ajax)
  };
}
