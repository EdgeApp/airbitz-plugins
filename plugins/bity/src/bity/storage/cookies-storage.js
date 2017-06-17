import cookies from 'cookies-js';

export default function cookiesStorageFactory() {
  return {
    getItem,
    setItem,
    removeItem
  };

  function getItem(key) {
    const value = cookies.get(key);
    if (typeof value === 'undefined') {
      return null;
    }
    return value;
  }

  function setItem(key, value) {
    cookies.set(key, value, {
      domain: window.location.hostname
    });
  }

  function removeItem(key) {
    cookies.expire(key);
  }
}
