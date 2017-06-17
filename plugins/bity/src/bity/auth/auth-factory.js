import authAjaxPluginFactory from './auth-ajax-plugin';

const STORAGE_KEY = 'bity.auth';

const LOGIN_PATH = '/o/token/';
const REFRESH_TOKEN_PATH = '/o/token/';
const LOGOUT_PATH = '/o/revoke_token/';

// in order to reduce the size of cookies
const ACCESS_TOKEN_KEY = 'a';
const REFRESH_TOKEN_KEY = 'b';

export default function authFactory(opts = {}) {
  const { clientId, storage } = opts;

  let authStatus = hasAccessToken();
  let hasLoginRequest = false;
  let authStatusListeners = [];

  const authAjaxPlugin = authAjaxPluginFactory({
    getAccessToken,
    hasAccessToken,
    onUnauthResponse
  });

  return {
    authAjaxPlugin,
    authApiFactory(ajax) {
      return {
        login: sendLoginRequest.bind(this, ajax),
        logout: sendLogoutRequest.bind(this, ajax),
        refreshAccessToken: refreshAccessToken.bind(this, ajax),
        isAuthenticated,
        onAuthStatusChanged
      };
    }
  };

  function isAuthenticated() {
    return authStatus;
  }

  function onAuthResponse(data) {
    storeData(data);
    updateAuthStatus(true);
  }

  function onUnauthResponse() {
    clearStoredData();
    updateAuthStatus(false);
  }

  function updateAuthStatus(status) {
    if (authStatus === status) {
      return;
    }
    authStatus = status;
    notifyAuthStatusListeners();
  }

  // ------------------------
  // auth status listeners
  // ------------------------
  function onAuthStatusChanged(fn) {
    const unsubscribe = () => {
      authStatusListeners = authStatusListeners.filter(listenerFn => listenerFn !== fn);
    };
    authStatusListeners.push(fn);
    return unsubscribe;
  }

  function notifyAuthStatusListeners() {
    authStatusListeners.forEach((fn) => {
      fn();
    });
  }

  // ------------------------
  // storage I/O
  // ------------------------
  function getAccessToken() {
    return getStoredData()[ACCESS_TOKEN_KEY] || '';
  }

  function getRefreshToken() {
    return getStoredData()[REFRESH_TOKEN_KEY] || '';
  }

  function hasAccessToken() {
    return isNotEmptyString(getAccessToken());
  }

  function getStoredData() {
    const rawData = storage.getItem(STORAGE_KEY);
    try {
      return JSON.parse(rawData) || {};
    } catch (e) {
      return {};
    }
  }

  function storeData(data) {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function clearStoredData() {
    storage.removeItem(STORAGE_KEY);
  }

  // ------------------------
  // network
  // ------------------------
  function sendLoginRequest(ajax, user, password) {
    if (hasLoginRequest) {
      throw new Error('Can\'t send several login requests at the same time');
    }

    hasLoginRequest = true;

    const cfg = {
      url: LOGIN_PATH,
      method: 'POST',
      form: {
        client_id: clientId,
        grant_type: 'password',
        username: user,
        password
      }
    };

    return ajax(cfg)
      .then((resp) => {
        hasLoginRequest = false;

        const { data = {} } = resp;

        // TODO also see expires_in
        const { access_token, refresh_token } = data;
        const nextData = {
          [ACCESS_TOKEN_KEY]: access_token,
          [REFRESH_TOKEN_KEY]: refresh_token
        };

        onAuthResponse(nextData);

        return {
          ...resp,
          data: nextData
        };
      })
      .catch((resp) => {
        hasLoginRequest = false;
        return Promise.reject(resp);
      });
  }

  function sendLogoutRequest(ajax) {
    if (hasLoginRequest) {
      throw new Error('Can\'t logout when the login request is in the fly');
    }

    const cfg = {
      url: LOGOUT_PATH,
      method: 'POST',
      query: {
        client_id: clientId,
        token: getAccessToken()
      }
    };

    clearStoredData();
    updateAuthStatus(false);

    return ajax(cfg);
  }

  function refreshAccessToken(ajax) {
    const refreshToken = getRefreshToken();

    const cfg = {
      url: REFRESH_TOKEN_PATH,
      method: 'POST',
      form: {
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }
    };

    return ajax(cfg)
      .then((resp) => {
        const { data = {} } = resp;

        // TODO also see expires_in
        const { access_token, refresh_token } = data;
        const nextData = {
          [ACCESS_TOKEN_KEY]: access_token,
          [REFRESH_TOKEN_KEY]: refresh_token
        };

        storeData(nextData);

        return {
          ...resp,
          data: nextData
        };
      })
      .catch(resp => Promise.reject(resp));
  }
}

function isNotEmptyString(v) {
  return typeof v === 'string' && v.length > 0;
}
