import { UNKNOWN_ERROR } from './unknown-errors';

export function createError(code) {
  return { code };
}

export function createUnknownError(err) {
  return err;
}

export function isUnknownError(err = {}) {
  const { code } = err;
  return code === UNKNOWN_ERROR || typeof code === 'undefined';
}
