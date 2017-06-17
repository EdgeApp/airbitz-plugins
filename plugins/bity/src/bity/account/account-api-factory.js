const FETCH_URL = '/account/info/';

export default function accountApiFactory(ajax) {
  return {
    info: {
      fetch: sendFetchAccountInfoRequest
    }
  };

  function sendFetchAccountInfoRequest() {
    const cfg = {
      url: FETCH_URL,
      method: 'GET'
    };

    return ajax(cfg)
      .then(({ data }) => ({
        userId: data.first_person_id,
        userName: data.username,
        email: data.email,
        isActive: data.is_active
      }));
  }
}
