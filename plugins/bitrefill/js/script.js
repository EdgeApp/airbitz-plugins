"use strict";

var selectedWallet = null;
var refundAddress = null;

function onWalletChange (wallet) {
  selectedWallet = wallet;
}

function showPaymentUI (order) {
  Airbitz.core.createSpendRequest(selectedWallet, order.payment.address, order.satoshiPrice, {
    label: "Bitrefill",
    category: 'Expense:Mobile Phone',
    bizId: 8498, // Bizid of Bitrefill in the Airbitz directory. Used to show logo on transaction list and details
    notes: order.itemDesc,
    success: function(response) {
      if (response.back) {
        console.log("User pressed back button. Funds not sent")
      } else {
        console.log("Bitcoin sent")
        Airbitz.core.finalizeReceiveRequest(selectedWallet, resp.address);
      }
    },
    error: function() {
      Airbitz.ui.showAlert("Payment Error", "Error sending funds");
    }
  });
}

function initWidget (refundAddress) {
  /* global BitRefillWidget */

  BitRefillWidget('#widget', {
    key: '2APYLLO1H3TRQAXXPQJMP6RE6',
    refundAddress: refundAddress,
    showBTCAddress: false,
    showIntroduction: true,
    sendBitrefillEmails: true,
    paymentButtons: [{
      title: 'Send Payment',
      callback: showPaymentUI
    }]
  });
}

function main () {
  Airbitz.ui.title('Bitrefill');

  // If the user changes the wallet, we want to know about it
  Airbitz.core.setupWalletChangeListener(onWalletChange);

  // After loading, lets fetch the currently selected wallet
  Airbitz.core.getSelectedWallet({
      success: function (wallet) {
        onWalletChange(wallet);

        Airbitz.core.createReceiveRequest(selectedWallet, {
          label: 'Bitrefill',
          category: 'Expense:Mobile Phone',
          notes: 'Automatic refund. There was an error processing your order.',
          bizId: 8498, // Bizid of Bitrefill in the Airbitz directory. Used to show logo on transaction list and details
          success: function (resp) {
            refundAddress = resp.address;
            initWidget(resp.address);
          },
          error: function() { console.log("Error getting address") }
        });
      },
      error: function() {
        Airbitz.ui.showAlert("Wallet Error", "Unable to load wallet!");
      }
  });

  // Enable FastClick if loaded
  if (FastClick) {
    FastClick.attach(document.body);
  }
}

main();
