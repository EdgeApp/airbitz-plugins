export default function normalizeRequestCfgPlugin(ajax) {
  return function (cfg = {}) {
    const { url: prevUrl, data, query, form, headers = {}, ...rest } = cfg;

    const url = appendQuery(prevUrl, query);

    let body = null;

    if (isNotEmptyObject(data)) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
    } else if (isNotEmptyObject(form)) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = objectToQueryString(form);
    }

    const acceptHeaderIsDefined = isNotEmptyString(headers.Accept) || isNotEmptyString(headers.accept);
    if (!acceptHeaderIsDefined) {
      headers.Accept = 'application/json, text/plain, */*';
    }

    const nextCfg = {
      url,
      headers,
      body,
      ...rest
    };

    return ajax(nextCfg);
  };
}

function appendQuery(url, query) {
  if (!isNotEmptyObject(query)) {
    return url;
  }

  const queryStr = objectToQueryString(query);

  const parts = url.split('?');
  if (parts.length === 1) {
    parts.push('');
  }

  if (parts[1].length > 0) {
    parts[1] = `${parts[1]}&${queryStr}`;
  } else {
    parts[1] = queryStr;
  }

  return `${parts[0]}?${parts[1]}`;
}

function objectToQueryString(obj) {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
}

function isNotEmptyObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]' &&
    Object.keys(obj).length > 0;
}

function isNotEmptyString(v) {
  return typeof v === 'string' && v.length > 0;
}
