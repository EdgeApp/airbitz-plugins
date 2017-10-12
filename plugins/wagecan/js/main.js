const Msg_UnableGetSelectedWallet = 'Unable to get the info of the selected wallet. Please try again later.'
const Msg_UnableCreateSpendRequest = 'Unable to creat the spend request. Please try again later.'
const Title_LoadCard = 'Load WageCan Card'
const Title_Loading = 'Loading...'
// Call Airbitz when user click top-up button
function initizeAirbitz() {
  var lastNumber = $('#card-number1').val() + $('#card-number2').val() || ''
  if(lastNumber.length !== 8) {
    return
  }
  if ($('#total-value').text() === Title_Loading || $('#rate').text() === Title_Loading) {
    return
  }
  if(!parseFloat($('#total-value').text())){
    return
  }
  Airbitz.core.getSelectedWallet({
    success:function (response) {
      if(airbitzWalletId !== response['id']) {  // user has changed wallet
        airbitzWalletId = response['id']
        getAddressInfo()
      }
      else {
        var btcAmount = $('#amount').val()
        var bitsAmount = toSatoshi(btcAmount)
        Airbitz.core.createSpendRequest(response, address, bitsAmount, {
          label: Title_LoadCard,
          notes: airbitzWalletId,
          success: function(data) {
            if (data['back'] === 'true' || data['back'] === true) {
              // user pressed back, don't clean screen
            }
            else {
                hideContentToggle()
                $("#page").append( "<span class='send-result'><img src='https://wagecan.com/Images/airbitz/wagecan-sent-success.png'><p>Sent Successfully!</p></span>" );
            }
            // console.log(data);
          },
          error: function() {
            hideContentToggle()
            $("#page").append( "<span class='send-result'><img src='https://wagecan.com/Images/airbitz/wagecan-sent-error.png'><p>Failed to send! Please try again later.</p></span>" );
          }
        })
        // end of createSpendRequest block
      }
    },
    error:function () {
      airbitzWalletId = ''
      hideContentToggle()
      $("#page").append( "<span class='send-result'><img src='https://wagecan.com/Images/airbitz/wagecan-unableSelectWallet.png'><p class='col-md-8'>Unable get the selected wallet. Please try again later.</p></span>" );
    }
  })
}

// Auto jump to next card input field when entering card numbers
// not available
// $("#card-number1").keyup(function () {
//   if ($("#card-number1").val().length == 4) {
//     $('#card-number2').click(function(e){})
//   }
// });

//Limit the input digits
function limitInput(elem){
    if ( $(elem).hasClass("input-card-numbers") && elem.value.length > 4) {
        elem.value = elem.value.slice(0,4);
    }
}

// Toggle hiding content besides the header in the first screen
function hideContentToggle(){
    if ($("#page p").hasClass("hidden")){
        $("#page").removeClass("text-center");
        $("#page p").removeClass("hidden");
        $("#page form").removeClass("hidden");
    }
    else{
        $("#page p").addClass("hidden");
        $("#page form").addClass("hidden");
        $("#page").addClass("text-center");
    }
}

// Animations
var contentWayPoint = function() {
    var i = 0;
    $('.animate-box').waypoint( function( direction ) {
        if( direction === 'down' && !$(this.element).hasClass('animated') ) {
            i++;
            $(this.element).addClass('item-animate');
            setTimeout(function(){
                $('body .animate-box.item-animate').each(function(k){
                    var el = $(this);
                    setTimeout( function () {
                        el.addClass('fadeInUp animated');
                        el.removeClass('item-animate');
                    },  k * 50, 'easeInOutExpo' );
                });
            }, 100);
        }
    } , { offset: '85%' } );
};


// Document on load.
$(function(){
    contentWayPoint();
    updateRates()
    setInterval(updateRates, 6e4)
    Airbitz.core.getSelectedWallet({
      success:function (response) {
        airbitzWalletId = response['id']
      },
      error:function () {
        airbitzWalletId = ''
        hideContentToggle()
        $("#page").append( "<span class='send-result'><img src='https://wagecan.com/Images/airbitz/wagecan-unableSelectWallet.png'><p class='col-md-8'>Unable get the selected wallet. Please try again later.</p></span>" );
      }
    })
});

var airbitzWalletId = ''
var currency = ''
var address = ''
var prices = null

function getAddressInfo(){
    var lastNumber = $('#card-number1').val() + $('#card-number2').val() || ''
    if(lastNumber.length !== 8) {
      $('#result-non-exist').addClass('hidden')
    }
    else {
        $('#rate').text(Title_Loading)
        currency = ''
        address = ''
        $.ajax({
            url: 'https://wagecan.com/airbitz/topup/address',
            dataType: 'json',
            type: 'post',
            data: {
                "source": "Airbitz",
                "sourceId": airbitzWalletId,
                "lastNumber": lastNumber
            }
        })
        .done(function(data){
            if(data.currency && data.address){
                currency = data.currency
                address = data.address
                if(prices && currency){
                    var rate = prices[currency]
                    updateRateLabel(rate[0].dollar)
                }
                $('#result-non-exist').addClass('hidden')
                getTopupVal()
            }else{
                address = ''
                currency = ''
                updateRateLabel()
                updateTopupVal()
                $('#result-non-exist').removeClass('hidden')
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            address = ''
            currency = ''
            updateRateLabel()
            updateTopupVal()
            $('#result-non-exist').removeClass('hidden')
        })
    }
}

function updateRates(){
    var lastNumber = $('#card-number1').val() + $('#card-number2').val() || ''
    if (lastNumber.length === 8) {
      $('#rate').text(Title_Loading)
    }
    else {
      $('#rate').text('N/A')
    }
    $.ajax({
        url: 'https://wagecan.com/airbitz/topup/rate',
        type: 'get',
        dataType: 'JSON',
        cache: false,
        timeout: 3e4
    })
    .done(function(data){
        prices = data.prices
        if(currency){
            updateRateLabel(prices[currency][0].dollar)
        }
        getTopupVal()
    })
}

function getTopupVal(){

    // test part, to be deleted
    var btcAmountString = $('#amount').val()
    var bitsAmount = toSatoshi(btcAmountString)
    if (!bitsAmount) {
      updateTopupVal()
      if (btcAmountString.length > 0) {
        $('#top-up-error').removeClass('hidden')
      }
      else {
        $('#top-up-error').addClass('hidden')
      }
      return
    }
    var amount = parseFloat(btcAmountString)

    //console.log("btcAmount: " + btcAmountString + ",bitsAmount: " + bitsAmount);

    if(address && currency && prices && amount){
        var price = prices[currency]
        var rate = null
        var eq_lower = true
        for(var p of price){
            if(eq_lower && amount >= p.bound[0] && amount <= p.bound[1]){
                rate = p.dollar
                break
            }else if(amount > p.bound[0] && amount <= p.bound[1]){
                rate = p.dollar
                break
            }
            eq_lower = true
        }
        if(rate){
            updateRateLabel(rate)
            var value = Math.floor(amount*rate)
            updateTopupVal(value)
            $('#top-up-error').addClass('hidden')
        }else{
            updateTopupVal()
            $('#top-up-error').removeClass('hidden')
        }
    }
}

function updateRateLabel(rate){
    if(rate && currency){
        $('#rate').text('1 BTC = ' + rate + ' ' + currency)
    }else{
        $('#rate').text('N/A')
    }
}

function updateTopupVal(val){
    if(val){
        $('#total-value').text(val + ' ' + currency)
        $('#topup-button').prop('disabled', false)
        $('#topup-button').css("background","#083b74")
        $('#topup-button').css("opacity","1")
    }else{
        $('#total-value').text('N/A')
        $('#topup-button').prop('disabled', true)
        $('#topup-button').css("background","#03a6ff")
        $('#topup-button').css("opacity",".2")
    }
}

function toSatoshi(val){
    var str = val.toString()
    var dotIndex = str.indexOf('.')
    var paddingNum = 8
    if(dotIndex !== -1){
        paddingNum = 8 - (str.length - dotIndex - 1)
    }
    for(var i = 0; i < paddingNum; i+= 1){
        str += '0'
    }
    str = str.replace(/\./g,'').replace(/^0+/,'')
    //dotIndex = str.length - 2
    //str = str.slice(0, dotIndex - 1) + '.' + str.slice(dotIndex)
    //console.log(parseFloat(str))
    //return parseFloat(str)
    return parseInt(str)
}

function displayURL() {
  hideContentToggle()
  $("#page").append( "<span class='send-result'><img src='https://wagecan.com/Images/airbitz/wagecan-sent-success.png'><p>Please copy and open it in your browser:<br><a href='https://wagecan.com/s/AIRBITZ' onclick='return false;'>https://wagecan.com/s/AIRBITZ</p></span>" );
}

function openRefCodeURL() {
  if (Airbitz.ui.launchExternal) {
    Airbitz.ui.launchExternal('https://wagecan.com/s/AIRBITZ')
  }
  else {
    displayURL();
  }
}
