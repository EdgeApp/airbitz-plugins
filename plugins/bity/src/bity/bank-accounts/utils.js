export function parseBankAccountData(obj) {
  const {
    abanumber: abaNumber,
    account,
    address1,
    address2,
    bankaddress1: bankAddress1,
    bankname: bankName,
    bicswift: bicOrSwift,
    city,
    country,
    currency: currencyUrl,
    iban,
    id,
    is_active: isActive,
    is_primary: isPrimary,
    is_verified: isVerified,
    label,
    localized_label: localizedLabel,
    owner_name: ownerName,
    person: personUrl,
    sortcode: sortCode,
    source,
    state,
    uuid,
    zipcode: zipCode
  } = obj;

  const currencyCode = extractCurrencyCode(currencyUrl);
  const userId = extractUserId(personUrl);

  return {
    id: id.toString(),
    uuid,

    abaNumber,
    account,
    bankAddress1,
    bankName,
    bicOrSwift,
    currencyCode,
    iban,

    ownerName,
    userId,

    isActive,
    isPrimary,
    isVerified,

    label,
    localizedLabel,

    address1,
    address2,
    city,
    country,
    state,
    zipCode,

    sortCode,
    source
  };
}

export function parseErrorResponse(data) {
  // in some cases bity backend returns HTTP 500 with HTML
  if (!isObject(data)) {
    return {
      code: 500,
      message: ''
    };
  }

  const { error = {} } = data;
  if (error.code === 'invalid_iban') {
    return {
      code: 'invalid_iban',
      message: 'Invalid value of IBAN'
    };
  }

  if (error.code === 'invalid_bicswift') {
    return {
      code: 'invalid_bicswift',
      message: 'Invalid value of BIC or SWIFT'
    };
  }

  return error;
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function extractCurrencyCode(v = '') {
  const regExp = /([^/]+)\/$/g;
  const res = regExp.exec(v);
  if (!Array.isArray(res) || res.length < 2) {
    throw new Error(`Can't extract the value of currency from "${v}"`);
  }
  return res[1];
}

function extractUserId(v = '') {
  const regExp = /([^/]+)\/$/g;
  const res = regExp.exec(v);
  if (!Array.isArray(res) || res.length < 2) {
    throw new Error(`Can't extract the value of user id from "${v}"`);
  }
  return res[1];
}
