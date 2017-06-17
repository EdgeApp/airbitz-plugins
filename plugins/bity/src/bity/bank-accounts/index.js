import loadListOfBankAccountsFactory from './load-list-of-bank-accounts';
import registerBankAccountFactory from './register-bank-account';

export default function bankAccountsApiFactory(ajax) {
  return {
    loadListOfBankAccounts: loadListOfBankAccountsFactory(ajax),
    add: registerBankAccountFactory(ajax)
  };
}
