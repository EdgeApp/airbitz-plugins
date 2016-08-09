"use strict";

var selectedWallet = null;

Airbitz.ui.title('Bitrefill');

function onWalletChange (wallet) {
  selectedWallet = wallet;
}

// If the user changes the wallet, we want to know about it
Airbitz.core.setupWalletChangeListener(onWalletChange);

// After loading, lets fetch the currently selected wallet
Airbitz.core.getSelectedWallet({
    success: onWalletChange,
    error: function() {
      Airbitz.ui.showAlert("Wallet Error", "Unable to load wallet!");
    }
});

BitRefillWidget('#widget', {
  key: '43eAxCKcEIEOU37rvAJqAl',
  baseUrl: 'https://draper-staging-api.bitrefill.com/widget',
  showBTCAddress: false,
  paymentButtons: [{
    title: 'Pay With Account Balance',
    callback: function (order) {
      Airbitz.core.createSpendRequest(selectedWallet, order.payment.address, order.satoshiPrice, {
        label: "BitRefill",
        category: "",
        notes: order.itemDesc,
        success: function(response) {
          if (response.back) {
            console.log("User pressed back button. Funds not sent")
          } else {
            console.log("Bitcoin sent")
          }
        },
        error: function() {
          Airbitz.ui.showAlert("Payment Error", "Error sending funds");
        }
      });
    }
  }],
  userEmail: 'test@testing.com',
  sendBitrefillEmails: true
});
