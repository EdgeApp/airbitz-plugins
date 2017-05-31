export default function normalizeResponsePlugin(ajax) {
  return function (cfg) {
    return ajax(cfg)
      .then((response) => {
        const { status, statusText } = response;
        const config = cfg;

        return new Promise((resolve, reject) => {
          parseResponseBody(response)
            .then((data) => {
              const nextResponse = {
                status,
                statusText,
                config,
                data
              };

              if (response.ok) {
                resolve(nextResponse);
              } else {
                reject(nextResponse);
              }
            });
        });
      });
  };
}

const JSON = 'application/json';

function parseResponseBody(response) {
  const contentType = response.headers.get('Content-Type');
  switch (contentType) {
    case JSON:
      return response.json();
    default:
      return response.text();
  }
}
