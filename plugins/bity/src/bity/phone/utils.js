export function parsePhoneData(obj = {}) {
  const {
    cli,
    is_active: isActive,
    is_verified: isVerified,
    person: userDataUrl,
    resource_uri: phoneDataUrl
  } = obj;

  const phoneId = extractPhoneIdFromUrl(phoneDataUrl);
  const userId = extractUserIdFromUrl(userDataUrl);

  return {
    id: phoneId,
    cli,
    isActive: isActive === true,
    isVerified: isVerified === true,
    userId
  };
}

export function extractUserIdFromUrl(url) {
  const res = /([^/]+)\/?$/.exec(url);
  if (!Array.isArray(res) || res.length < 2) {
    throw new Error('Can\'t extract user id');
  }
  return res[1];
}

export function extractPhoneIdFromUrl(url) {
  const res = /([^/]+)\/?$/.exec(url);
  if (!Array.isArray(res) || res.length < 2) {
    throw new Error('Can\'t extract phone id');
  }
  return res[1];
}

export function parseErrorResponse(data) {
  // in some cases bity backend returns HTTP 500 with HTML
  if (!isObject(data)) {
    return {
      code: 500,
      message: ''
    };
  }

  return data.error;
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
