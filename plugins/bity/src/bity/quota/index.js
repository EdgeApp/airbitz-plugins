import { fetchFactory } from './quota';

export default function quotaFactory(ajax) {
  return {
    fetch: fetchFactory(ajax)
  };
}
