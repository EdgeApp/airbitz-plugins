import { fetchFactory } from './phone';
import loadListOfPhonesFactory from './load-list-of-phones-factory';
import loadPhoneDetailsFactory from './load-phone-details-factory';
import registerPhoneFactory from './register-phone-factory';
import requestVerificationCodeFactory from './request-verification-code-factory';
import submitVerificationCodeFactory from './submit-verification-code-factory';

export default function phoneFactory(ajax) {
  return {
    fetch: fetchFactory(ajax),
    loadListOfPhones: loadListOfPhonesFactory(ajax),
    loadPhoneDetails: loadPhoneDetailsFactory(ajax),
    registerPhone: registerPhoneFactory(ajax),
    requestVerificationCode: requestVerificationCodeFactory(ajax),
    submitVerificationCode: submitVerificationCodeFactory(ajax)
  };
}
