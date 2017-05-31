const URL = '/phone/';

const defaultQuery = {
  is_active: true
};

export function fetchFactory(ajax) {
  return () => {
    const ajaxCfg = {
      method: 'GET',
      url: URL,
      query: defaultQuery
    };

    return ajax(ajaxCfg)
      .then(resp => parse(resp.data));
  };
}

function parse({ objects = [] }) {
  return objects.map(obj => ({
    number: obj.cli,
    person: obj.person,
    resourceUri: obj.resource_uri,
    isActive: obj.is_active,
    isVerified: obj.is_verified
  }));
}
