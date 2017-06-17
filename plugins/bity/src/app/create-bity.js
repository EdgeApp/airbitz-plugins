import createBityInstance from '../bity';
import { airbitzStorageFactory } from '../airbitz';

const HOST = process.env.HOST;
const CLIENT_ID = process.env.CLIENT_ID;

export default function createBity() {
  const bityCfg = {
    host: HOST,
    clientId: CLIENT_ID,
    storage: airbitzStorageFactory()
  };

  return createBityInstance(bityCfg);
}
