
(function(root) {
  root.Airbitz = {};
  Airbitz = root.Airbitz;
  Airbitz.config = {};
  Airbitz.core = {};
  Airbitz.ui = {};
  Airbitz._callbacks = {};
  Airbitz._results = {};
  Airbitz._listeners = {};
  Airbitz._walletListener = null;
  Airbitz._denomListener = null;
  Airbitz._bridge = _bridge();

  /**
   * Returns a bitid address for the given uri and message
   * @return {string} bitid address
   */
  Airbitz.core.bitidAddress = function(uri, message) {
    return Airbitz._bridge.bitidAddress(uri, message);
  };

  /**
   * Returns a bitid signature for the given uri and message
   * @return {string} bitid signature
   */
  Airbitz.core.bitidSignature = function(uri, message) {
    return Airbitz._bridge.bitidSignature(uri, message);
  };

  /**
   * Returns the user's currently selected wallet
   * @return {object} a wallet
   */
  Airbitz.core.getSelectedWallet = function(options) {
    Airbitz._bridge.selectedWallet(options);
  };

  /**
   * Returns a list of the wallets for this account, included archived wallets
   * @return {object} an array of wallets
   */
  Airbitz.core.wallets = function(options) {
    Airbitz._bridge.wallets(options);
  };

  /**
   * Create a receive request from the provided wallet.
   * @param {object} wallet - the wallet object
   * @return {object} an object with an address and requestId
   */
  Airbitz.core.createReceiveRequest = function(wallet, options) {
    Airbitz._bridge.createReceiveRequest(wallet, options);
  };

  /**
   * Finalizing a request marks the address as used and it will not be used for
   * future requests. The metadata will also be written for this address.  This
   * is useful so that when a future payment comes in, the metadata can be
   * auto-populated.
   * @return true if the request was successfully finalized.
   * @param {object} wallet - the wallet object
   * @param {string} requestId - the bitcoin address to finalize
   */
  Airbitz.core.finalizeReceiveRequest = function(wallet, requestId) {
    Airbitz._bridge.finalizeRequest(wallet, requestId);
  },

  /**
   * Request that the user spends.
   * @param {object} wallet - the wallet object
   * @param {string} toAddress - the recipient address
   * @param {number} amountSatoshi - how many satoshis to spend
   * @param {amountFiat} amountFiat - not required, but the fiat value at the time of the request
   */
  Airbitz.core.createSpendRequest = function(wallet, toAddress, amountSatoshi, options) {
    Airbitz._bridge.createSpendRequest(wallet, toAddress, amountSatoshi, 0, options);
  };

  /**
   * Request that the user spends to 2 outputs.
   * @param {object} wallet - the wallet object
   * @param {string} toAddress - the recipient address
   * @param {number} amountSatoshi - how many satoshis to spend
   * @param {string} toAddress2 - the recipient address
   * @param {number} amountSatoshi2 - how many satoshis to spend
   * @param {amountFiat} amountFiat - not required, but the fiat value at the time of the request
   */
  Airbitz.core.createSpendRequest2 = function(wallet, toAddress, amountSatoshi, toAddress2, options) {
    Airbitz._bridge.createSpendRequest2(wallet, toAddress, amountSatoshi, toAddress2, 0, options);
  };

  /**
   * Rquest that the user creates and signs a transaction
   * @param {object} wallet - the wallet object
   * @param {string} toAddress - the recipient address
   * @param {number} amountSatoshi - how many satoshis to spend
   * @param {amountFiat} amountFiat - not required, but the fiat value at the time of the request
   */
  Airbitz.core.requestSign = function(wallet, toAddress, amountSatoshi, options) {
    Airbitz._bridge.requestSign(wallet, toAddress, amountSatoshi, 0, options);
  };

  /**
   * Broadcast a transaction to the bitcoin network.
   * @param {object} the wallet object
   * @param {string} the raw hex to be saved to the database
   */
  Airbitz.core.broadcastTx = function(wallet, rawtx) {
    Airbitz._bridge.broadcastTx(wallet, tx);
  };

  /**
   * Save the transaction to transaction database This should only be called if
   * the transaction has been successfully broadcasted, either by using
   * #Airbitz.core.broadcastTx or by a third party.
   * @param {object} the wallet object
   * @param {string} the raw hex to be saved to the database
   */
  Airbitz.core.saveTx = function(wallet, rawtx) {
    Airbitz._bridge.saveTx(wallet, rawtx);
  };

  /**
   * Launches the native OS's camera or file browser so the user can select a
   * file. The options.success callback will be triggered when complete.
   */
  Airbitz.core.requestFile = function(options) {
    Airbitz._bridge.requestFile(options);
  };

  /**
   * Securely persist data into the Airbitz core. Only the current plugin will
   * have access to that data.
   * @param {string} key - the key to access the data in the future
   * @param {object} data - the data to write, which will be encrypted and backed up
   */
  Airbitz.core.writeData = function(key, data) {
    Airbitz._bridge.writeData(key, JSON.stringify(data));
  };

  /**
   * Clear all data in the Airbitz core, for the current plugin.
   */
  Airbitz.core.clearData = function() {
    Airbitz._bridge.clearData();
  };

  /**
   * Read the securely stored data from disk.
   * @param {string} key - the key to access the data.
   */
  Airbitz.core.readData = function(key) {
    var data = Airbitz._bridge.readData(key);
    return (data && data !== 'undefined') ? JSON.parse(data) : null;
  };

  /**
   * There is affiliate data only if the account was installed via an affiliate
   * link.
   * @return {object} dictionary of affiliate data
   */
  Airbitz.core.getAffiliateInfo = function() {
    var data = Airbitz._bridge.getAffiliateInfo();
    return (data && data !== 'undefined') ? JSON.parse(data) : null;
  };

  /**
   * Get the user's currently selected BTC denomination. It can be BTC, mBTC or
   * bits.
   * @return {string} a denomination string
   */
  Airbitz.core.getBtcDenomination = function() {
    return Airbitz._bridge.getBtcDenomination();
  }

  /**
   * Convert satoshis to a fiat currency value.
   * @param {number} satoshis - the satoshi to convert
   * @param {number} currencyNum - the ISO 3166 currency code
   * @return {number} the converted fiat value
   */
  Airbitz.core.satoshiToCurrency = function(satoshi, currencyNum) {
    return Airbitz._bridge.satoshiToCurrency(satoshi, currencyNum);
  }

  /**
   * Convert a fiat currency value to a satoshi value.
   * @param {number} currency - the fiat currency to convert
   * @param {number} currencyNum - the ISO 3166 currency code
   * @return {number} the converted satoshi value
   */
  Airbitz.core.currencyToSatoshi = function(currency, currencyNum) {
    return Airbitz._bridge.currencyToSatoshi(currency, currencyNum);
  }

  /**
   * Formats satoshis to display to the user. This uses the user's BTC
   * denomination to format including the correct code and symbol.
   * @param {number} satoshi - the satoshi value to format
   * @param {boolean} withSymbol - whether to include a currency symbol when formatting
   * @return {string} the formatted satoshi value in either BTC, mBTC or bits.
   */
  Airbitz.core.formatSatoshi = function(satoshi, withSymbol) {
    return Airbitz._bridge.formatSatoshi(satoshi, withSymbol);
  }

  /**
   * Formats currencies to display to the user. This uses the user's BTC
   * denomination to format including the correct code and symbol.
   * @param {number} currency - the satoshi value to format
   * @param {boolean} withSymbol - whether to include a currency symbol when formatting
   * @return {string} the formatted satoshi value in either BTC, mBTC or bits.
   */
  Airbitz.core.formatCurrency = function(currency, currencyNum, withSymbol) {
    return Airbitz._bridge.formatCurrency(currency, currencyNum, withSymbol);
  }

  /**
   * Fetch a configuration value. These are set in the native code, before the
   * webview is every loaded.
   * @param {key} key - the configuration key to fetch a value for
   * @return {string}
   */
  Airbitz.config.get = function(key) {
    return Airbitz._bridge.getConfig(key);
  };

  /**
   * Callback is called when wallet is changed AND every time plugin is created.
   * @param {function} callback - a function that will be called when the user
   * changes their currently selected wallet.
   */
  Airbitz.core.setWalletChangeListener = function(callback) {
    Airbitz._walletListener = callback;
  };

  Airbitz._bridge.walletChanged = function(newWallet) {
    if (Airbitz._walletListener) {
      var j = JSON.parse(newWallet);
      if (j.success) {
        Airbitz._walletListener(j.result);
      }
    }
  };

  /**
   * Callback is called when the user has changed their BTC denomination.
   * @param {function} callback - a function that will be called when the user
   * changes their BTC denomination.
   */
  Airbitz.core.setDenominationChangeListener = function(callback) {
    Airbitz._denomListener = callback;
  };

  Airbitz._bridge.denominationUpdate = function(newDenom) {
    if (Airbitz._denomListener) {
      var j = JSON.parse(newDenom);
      if (j.success) {
        Airbitz._denomListener(j.result.value);
      }
    }
  };

  /**
   * Removes an exchange rate listener for a currency number
   * @param {number} currencyNum - the currency number
   * @param {function} callback - the callback to remove
   */
  Airbitz.core.removeExchangeRateListener = function(currencyNum, callback) {
    var i = Airbitz._listeners[currencyNum].indexOf(callback);
    Airbitz._listeners[currencyNum].splice(i, 1);
  };

  Airbitz._bridge.exchangeRateUpdate = function() {
    for (var k in Airbitz._listeners) {
      for (var i = 0; i < Airbitz._listeners[k].length; ++i) {
        Airbitz._listeners[k][i]();
      }
    }
  };

  /**
   * Add an exchange rate listener that will be called when the exchange rate
   * is updated.
   * @param {number} currencyNum - the currency number
   * @param {function} callback - the callback to respond to exchange rate updes
   */
  Airbitz.core.addExchangeRateListener = function(currencyNum, callback) {
    if (!Airbitz._listeners[currencyNum]) {
      Airbitz._listeners[currencyNum] = [];
    }
    Airbitz._listeners[currencyNum].push(callback);
  };

  /**
   * Launches a native alert dialog.
   * @param {string} title - the dialog title
   * @param {string} message - the message body of the dialog
   */
  Airbitz.ui.showAlert = function(title, message, options) {
    Airbitz._bridge.showAlert(title, message, options || {});
  };

  /**
   * Hide an alerts that are currently displayed.
   */
  Airbitz.ui.hideAlert = function(title, message, options) {
    Airbitz._bridge.hideAlert();
  };

  /**
   * Set the title of the current view. This updates the native apps titlebar.
   * @param {string} title - the title string
   */
  Airbitz.ui.title = function(s) {
    Airbitz._bridge.title(s);
  };

  /**
   * Log messages to the ABC core at a particular level.
   * @param {number} level - ERROR = 0, WARNING = 1, INFO = 2, DEBUG = 3;
   */
  Airbitz.ui.debugLevel = function(level, text) {
    Airbitz._bridge.debugLevel(level, text);
  };

  /**
   * Go back in the navigation stack. 
   */
  Airbitz.ui.back = function() {
    Airbitz._bridge.back();
  };

  /**
   * Exit the plugin. This pops the current fragment or view controller of the
   * stack and destroys the webview.
   */
  Airbitz.ui.exit = function() {
    Airbitz._bridge.exit();
  };

  /**
   * Launch an external web page or application.
   * @param {string} uri - the uri or url to open in a different app.
   */
  Airbitz.ui.launchExternal = function(uri) {
    Airbitz._bridge.launchExternal(uri);
  };


  /**
   * Clear the naviation stack. Helpful when overriding the behavior of the
   * back button.
   */
  Airbitz.ui.navStackClear = function() {
    Airbitz._bridge.navStackClear();
  };

  /**
   * Push a new URL onto the nav stack.
   */
  Airbitz.ui.navStackPush = function(path) {
    Airbitz._bridge.navStackPush(path);
  };

  /**
   * Pop a URL off the nav stack.
   */
  Airbitz.ui.navStackPop = function() {
    Airbitz._bridge.navStackPop();
  };

  /**
   * @deprecated Airbitz no longer supports this behavior.
   */
  Airbitz.ui.showNavBar = function() {
    Airbitz._bridge.showNavBar();
  };

  /**
   * @deprecated Airbitz no longer supports this behavior.
   */
  Airbitz.ui.hideNavBar = function() {
    Airbitz._bridge.hideNavBar();
  };

  Airbitz.buffer = '';
  Airbitz.bufferClear = function() {
    Airbitz.buffer = '';
  };
  Airbitz.bufferAdd = function(s) {
    Airbitz.buffer += s;
  };

})(this);
