import { isUnknownError, createUnknownError } from './lib/utils';
import { parse as parseLoginErrors } from './lib/login-errors';
import { parse as parseNetworkErrors } from './lib/network-errors';

const parsers = [
  parseNetworkErrors,
  parseLoginErrors
];

export default function parseBityErrorResponse(response) {
  const count = parsers.length;
  let parser;
  let result;
  for (let i = 0; i < count; i++) {
    parser = parsers[i];
    result = parser(response);
    if (!isUnknownError(result)) {
      return result;
    }
  }
  return createUnknownError(response);
}
