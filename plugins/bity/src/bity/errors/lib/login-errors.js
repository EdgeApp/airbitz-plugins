import { createError } from './utils';

export const ERROR_INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';

export function parse(err) {
  const { status, data = {} } = err;
  const { error = '', error_description: errorDescription = '' } = data; // eslint-disable-line camelcase

  const isInvalidCredentialsError = status === 401 &&
    error === 'invalid_grant' &&
    errorDescription.toLowerCase() === 'invalid credentials given.';

  switch (true) {
    case isInvalidCredentialsError:
      return createError(ERROR_INVALID_CREDENTIALS);
    default:
      return err;
  }
}
