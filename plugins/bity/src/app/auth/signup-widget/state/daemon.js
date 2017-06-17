import { take, spawn, put, call, race, select } from 'redux-saga/effects';

import * as actions from './actions';
import * as selectors from './selectors';
import * as notificationActions from '../../../notifications/actions';
import { actions as authStoreActions } from '../../../common-data/auth';

export default function signupDaemonFactory(bity) {
  return function* runSignupDaemon() {
    yield [
      yield spawn(listenSignupIntents, bity)
    ];
  };
}

function* listenSignupIntents(bity) {
  while (true) { // eslint-disable-line no-constant-condition
    const { payload: originalFormData } = yield take(actions.SIGNUP_REQUESTED);
    yield put(actions.signupStarted());

    const formData = prepareFormData(originalFormData);

    const res = yield race({
      authenticated: take(authStoreActions.AUTHENTICATED),
      signupResult: call(sendSignupRequest, bity, formData)
    });

    const isMounted = yield select(selectors.isMounted);

    if (typeof res.authenticated !== 'undefined') {
      if (isMounted) {
        yield put(actions.signupCanceled());
      }
      continue; // eslint-disable-line no-continue
    }

    const { signupResult: { error } } = res;
    if (error) {
      yield call(notifyAboutFailedSignup, error);
      if (isMounted) {
        yield put(actions.signupFailed(error));
      }
      continue; // eslint-disable-line no-continue
    }

    if (isMounted) {
      yield put(actions.signupSucceed(formData));
    }
  }
}

function* sendSignupRequest(bity, formData) {
  try {
    const data = yield call(bity.signup.signup, formData);
    return { data };
  } catch (error) {
    return { error };
  }
}

function* notifyAboutFailedSignup(error) {
  const title = 'Signup failed';
  const msg = `Signup failed.\n${error.message}`;
  yield put(notificationActions.notify({ title, msg }));
}

function prepareFormData(rawFormData) {
  const { password, email } = rawFormData;
  let username = rawFormData.username;
  if (typeof username !== 'string' || username.length === 0) {
    username = email;
  }

  let affiliateCode;
  try {
    // due this code https://github.com/Airbitz/airbitz-plugins/blob/master/lib/js/airbitz-bridge-dev.js#L101
    affiliateCode = window.Airbitz.config.get('AFFILIATE_CODE');
  } catch (e) { // eslint-disable-line no-empty
  }

  return { username, password, email, affiliateCode };
}
