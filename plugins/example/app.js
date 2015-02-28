var selected = null;
window.onload = function() {
    var fiat = function(satoshi, currencyNum) {
      var value = Airbitz.core.satoshiToCurrency(satoshi, currencyNum);
      return Airbitz.core.formatCurrency(value, currencyNum, true);
    }
    var $qrcode = $('#qrcode');
    var qrcode = new QRCode($qrcode[0], {
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    var title = 'Example App';
    Airbitz.ui.title(title);
    Airbitz.ui.title('Loading wallets...');
    Airbitz.core.wallets({success: function(data) {
      $.each(data, function(index, wallet) {
          $td1 = $('<td />').append(wallet.name);
          $td2 = $('<td />').append(Airbitz.core.formatSatoshi(wallet.balance, true));
          $td3 = $('<td />').append(fiat(wallet.balance, wallet.currencyNum));
          $d = $('<tr/>').append($td1).append($td2).append($td3);
          $d.click(function() {
              selected = wallet;
              $('#request').html('Receive Request for ' + wallet.name);
              $('#requestPanel').show()
          });
          $('#wallets tbody').append($d);
          Airbitz.ui.title(title);
      });
    }});
    $('#requestPanel').hide()
    $('#request').click(function() {
        Airbitz.ui.title('Loading receive request...');
        Airbitz.core.createReceiveRequest(selected, {success: function(data) {
          var address = data['address'];
          var uri = "bitcoin://" + address;
          var $address = $('#address');
          $qrcode.attr('href', uri);
          $address.html('Pay to ' + address);
          $address.attr('href', uri);
          qrcode.makeCode(uri);
          Airbitz.ui.title(title);

          $('#spend').click(function() {
            Airbitz.core.requestSpend(selected, address, 10000, { success: function(data) {
                console.log('successful send!!!');
            }, error:function(data) {
                console.log('successful error!!!');
            }});
          });
        }});
    });
}
