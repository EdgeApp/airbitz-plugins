import 'whatwg-fetch';
import normalizeResponsePlugin from './plugins/normalize-response-plugin';
import normalizeRequestCfgPlugin from './plugins/normalize-request-cfg-plugin';

export default function ajaxFactory() {
  return function (cfg) {
    let ajax = basicAjax;

    ajax = normalizeRequestCfgPlugin(ajax);
    ajax = normalizeResponsePlugin(ajax);

    return ajax(cfg);
  };
}

function basicAjax({ url, ...opts }) {
  return fetch(url, opts)
    .catch(() => Promise.reject({
      status: -1 // TODO avoid hardcoded value
    }));
}
