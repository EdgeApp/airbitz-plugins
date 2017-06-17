import { createError } from './utils';

export const ERROR_NETWORK = 'NETWORK';

export function parse(err) {
  const { status } = err;
  const isNetworkError = status === -1; // TODO avoid hardcoded value

  switch (true) {
    case isNetworkError:
      return createError(ERROR_NETWORK);
    default:
      return err;
  }
}
