var app=angular.module("exchangeGlidera");app.controller("mainCtrl",["$scope","$state","$stateParams",function(e,n,t){Airbitz.ui.title("Glidera"),e.account={firstName:"Ricky",middleName:"Walleye",lastName:"Bobby",email:"jimmy@hendrix",street:"1001 east high st",street2:"apt 2",city:"Pottstown",zip:"19464",state:"PA",country:"US",dob:"01-22-1980"},e.exchange={name:"Glidera",icon:"fa-bitcoin",countryCode:"US",emailVerificationAddress:"verifications@glidera.com",phoneVerificationNumber:"+1 650-331-0021",depositBankName1:"Bank of America",depositBankAccount1:"90001923932",depositBankName2:"METRO BANK",depositBankAccount2:"23002223932",orderTimeout:"60",depositTimeout:"3600",verificationCode:"someCode"},e.getAccount=function(){return e.account?e.account:{}},e.account=e.getAccount(),e.cancelSignup=function(){n.go("home")},e.submitSignUp=function(e){n.go("verifyEmail")},e.changeEmail=function(e){alert("Account Email: "+e)},e.resendEmail=function(e){alert("Account Email: "+e)},e.verifyPhone=function(){n.go("verifyPhone")},e.submitPhone=function(e){alert("Send: "+e+" to Glider for verification code."),n.go("verify2FA")},e.submit2FA=function(e,t){alert("Send: "+e+" to Glider to check if valid."),n.go(t?t:"loadExchange")},e.changeEmail=function(e){alert("Chang phone: "+e)},e.resendSMS=function(e){alert("Resend verfication SMS to: "+e),n.go("")},e.loadExchange=function(){n.go("exchange")},e.exchange.getBtcBalance=function(){return 13.37010101},e.exchange.getFiatBalance=function(){return 1337.01},e.exchange.addBankAccount=function(){n.go("exchangeAddBankAccount")},e.exchange.addCreditCard=function(){n.go("exchangeAddCreditCard")},e.exchange.buy=function(){n.go("exchangeOrder")},e.exchange.sell=function(){n.go("exchangeSell")},e.exchange.reviewOrder=function(){e.exchange.order={},e.exchange.order.type="Buy",n.go("reviewOrder")},e.exchange.editOrder=function(){n.go("exchangeOrder")},e.exchange.executeOrder=function(){alert("SEND ORDER TO GLIDERA VIA API"),n.go("executeOrder")},e.exchange.confirmDeposit=function(){n.go("confirmDeposit")}}]);