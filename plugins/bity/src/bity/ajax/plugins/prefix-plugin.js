export default function prefixPluginFactory(prefix = '/') {
  return function prefixPlugin(ajax) {
    return function applyPrefix(cfg) {
      const { url: prevUrl } = cfg;
      const url = [prefix, prevUrl].join('/').replace(/([^:]\/)\/+/g, '$1');
      return ajax({
        ...cfg,
        url
      });
    };
  };
}
