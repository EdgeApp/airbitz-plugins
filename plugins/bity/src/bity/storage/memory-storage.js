export default function memoryStorageFactory() {
  let storage = {};

  return {
    getItem,
    setItem,
    removeItem,
    clear
  };

  function getItem(key) {
    const value = storage[key];
    if (typeof value === 'undefined') {
      return null;
    }
    return value;
  }

  function setItem(key, value) {
    storage[key] = value;
  }

  function removeItem(key) {
    delete storage[key];
  }

  function clear() {
    storage = {};
  }
}
