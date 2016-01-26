"use strict";

var CardsChanged = {
    NO : 0,
    YES : 1,
    VALUE_ONLY : 2
};

var fold_api = "https://api.foldapp.com/v1/";
var brand = Airbitz.config.get("BRAND");
var api_token = Airbitz.config.get("API-TOKEN");
var bizId = Airbitz.config.get("BIZID");
var logo_url = Airbitz.config.get("LOGO_URL");
var category = Airbitz.config.get("CATEGORY");
var statsKey = Airbitz.config.get('AIRBITZ_STATS_KEY');
var server_json_error = false;
var first_load = 1;
var force_refresh = 1;
var min_price_rate = 1;
var refund_enabled = 0;
var new_account = false;

// Purchases over this amount are given a popup warning as 1 confirmation is required
// before card is available
var large_value_threshold = 50;

document.title = brand; // Set page's title to brand of gift card.

function resetAccount() {
    var x;
    if (confirm("Reset Account? This will delete all cards and create a new account with Fold") == true) {
        if (confirm("Reset Account? ARE YOU SURE. All cards from all vendors will be lost?") == true) {
            if (confirm("Reset Account? ARE YOU REALLY SURE?") == true) {
                Account.createWithHandler(function(){
                    Airbitz.ui.debugLevel(1,"New account creation for reset succeeded.");
                    Airbitz.ui.exit();
                }, function(){
                    Airbitz.ui.showAlert("New Account Creation Failed", "New Account Creation Failed. Please check network or try again later");
                    Airbitz.ui.debugLevel(1,"New account creation for reset failed.");
                });
            }
        }
    }
}

function toggleUi() {
    $(".fold-loading").css("display", "none");
    $(".main").css("display", "inline");
    setInterval( function() {
        updateAllCards();
    }, 3000); // Refresh UI every 3 seconds
}

function updateAllCards() {
    user.updateUsersCards(function() {
        user.updateCardsForSale(function() {
            Account.pingCard(Account.current_card_id);
            if (server_json_error) {
                Airbitz.ui.showAlert("Server Response Error", "Error in Server response. Please contact support");
                Airbitz.ui.debugLevel(1,"Error in Server response. Please contact support");
                server_json_error = false;
                first_load = 0;
            }
        }); // Start getting avaliable cards for sale.
    });
}

function supportsTemplate() {
    return 'content' in document.createElement('template');
}

function supportsImports() {
    return 'import' in document.createElement('link');
}
if (supportsTemplate()) {
    Airbitz.ui.debugLevel(1,"Does support templates!");
} else {
    // Use old templating techniques or libraries.
    Airbitz.ui.debugLevel(1,"Does not support templates.");
}
if (supportsImports()) {
    // Good to go!
    Airbitz.ui.debugLevel(1,"Supports imports!");
} else {
    // Use other libraries/require systems to load files.
    Airbitz.ui.debugLevel(1,"Does not support imports.");
}

var createAddress = function(wallet, label, amountSatoshi, amountFiat,
                             category, notes, resolve, reject) {
    Airbitz.core.createReceiveRequest(wallet, {
        label: label,
        category: category,
        notes: notes,
        amountSatoshi: amountSatoshi,
        amountFiat: amountFiat,
        bizId: parseInt(bizId),
        success: function(data) {
            Airbitz.core.finalizeRequest(wallet, data["requestId"]);
            resolve(data);
        },
        error: reject
    });
};

function updateWallet(wallet) {
    Account.abWallet = wallet;
}

function logStats(event, brand, amount) {
    var s = {};
    s['btc'] = 0;
    s['partner'] = 'Fold';
    s['country'] = 'USA';
    s['user'] = Account.username.substr(Account.username.length - 8);
    s['brand'] = brand;
    s['usd'] = amount;
    $.ajax({
        headers: {
            'Content-Type' : 'application/json',
            'Authorization': 'Token ' + statsKey,
        },
        'type' : 'POST',
        'url' : 'https://airbitz.co/api/v1/events',
        'data' : JSON.stringify({
            'event_type': event,
            'event_network' : 'mainnet',
            'event_text': JSON.stringify(s),
        }),
        'dataType': 'json',
        success : function(response) {
            Airbitz.ui.debugLevel(1,"logStats: recorded");
        }
    }).fail(function(xhr, textStatus, error) {
        Airbitz.ui.debugLevel(1,"logStats: There was an error. Status: " + xhr.status);
    });
}

function sRequestHandler(url, json, handleReponse, handleError) {
    $.ajax({
        headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json',
            'X-CFC-PartnerToken': api_token,
        },
        'type' : 'POST',
        'url' : url,
        'data' : JSON.stringify(json),
        'dataType': 'json',
        success : function(response) {
            handleReponse(response);
        }
    }).fail(function(xhr, textStatus, error) {
        Airbitz.ui.debugLevel(1,"There was an error. Status: " + xhr.status);
        Airbitz.ui.debugLevel(1,xhr.Message);
        handleError(xhr.status);
    });
}

var Account = {
    exists: $.Deferred(),
    logged_in: $.Deferred(),
    all_cards: [],
    owl: $("#user-cards"),
    owlSet: false, // Owl set
    numUpdates: 0,
    current_card_id: "", // The currently visible card id. used to ping Fold servers for balance update
    create: function() {
        Account.createWithHandler(function(){
            Airbitz.ui.debugLevel(1,"Account created successfully");
        },function(){
            Airbitz.ui.showAlert("Account creation error", "Error creating account. Please try again later");
        });
    },

    createWithHandler: function(handleReponse, handleError) {
        Airbitz.ui.debugLevel(1,"Creating user.");
        var url = fold_api + "users";
        var newAcc = {"users": [{
            "random_username": true,
            "random_password": true
        }]}

        sRequestHandler(url, newAcc, function(r) {
            //Airbitz.ui.debugLevel(1,r);
            Account.username = r['users'][0]['username'];
            Account.pass = r['users'][0]['password'];
            Account.creds = {"users": [{
                "username": Account.username,
                "password": Account.pass
            }]};
            Airbitz.core.writeData("fold-username", Account.username);
            Airbitz.core.writeData("fold-pass", Account.pass);
            Account.exists.resolve();
            handleReponse();
        }, function(error) {
            handleError();
        });
    },

    login: function() {
        var url = fold_api + "my/session";
        Airbitz.ui.debugLevel(1,Account.creds);
        sRequestHandler(url, Account.creds, function(r) {
            //Airbitz.ui.debugLevel(1,"Logging in" + JSON.stringify(r));
            Account.logged_in.resolve(r);
        }, function(error) {
            Airbitz.ui.showAlert("Login error", "Error logging into account. Please try again later");
        });
    },
    updateBalance: function() {
        this.getInfo("balances?currency=USD", function(balances) {
            Airbitz.ui.debugLevel(1,"Balance: " + JSON.stringify(balances["balances"][0]["amount"]));
            $(".balance-amt").text("$" + balances["balances"][0]["amount"]);
        });
    },

    pingCard: function(cardid) {
        if (!cardid) {
          return;
        }
        var url = fold_api + "my/cards/" + cardid + "/ping";
        Airbitz.ui.debugLevel(1,"Pinging card " + cardid);
        sRequestHandler(url, "", function(r){
            Airbitz.ui.debugLevel(1,"Pinging card success");
        },
        function(e) {
            Airbitz.ui.debugLevel(1,"Pinging card failed");
        });
    },

    updateWAddr: function(addr, handleResponse, handleError) { // Set the default BTC address
        var withdraw_url = fold_api + "my/default_withdraw_addresses";
        Airbitz.ui.debugLevel(1,"Setting default address to: " + addr.toString());
        var newAddr = {"default_withdraw_addresses": [{
            "currency": "BTC",
            "default_address": [{
                "address": addr.toString(),
                "address_type": "crypto"
            }]
        }]};
        Airbitz.ui.debugLevel(1,withdraw_url);
        Airbitz.ui.debugLevel(1,newAddr);
        sRequestHandler(withdraw_url, newAddr, function(response) {
            Airbitz.ui.debugLevel(1,"Updated default_withdraw_address");
            handleResponse();
        }, function(error) {
            handleError();
        });
    },
    // Updates list of user's cards
    updateUsersCards: function(doneUpdating) {
        Airbitz.ui.debugLevel(1,"Resetting cards.");
        Account.getCards(function(cards) {
            Account.updateUsersCardsUI(cards, doneUpdating);
        });
    },
    clearOwl: function() {
        if(Account.owlSet) {
            Airbitz.ui.debugLevel(1,"Clearing Owl");
            Airbitz.ui.debugLevel(1,"Owl size before:" + Account.owl.data("owlCarousel").owl.owlItems.length);

            var owlSize = Account.owl.data("owlCarousel").owl.owlItems.length;

            if (!owlSize) {
                return;
            }

            for(var i = 0; i < owlSize; i++) {
                Airbitz.ui.debugLevel(1,"Clearing Owl Item " + i);
                Account.owl.data('owlCarousel').removeItem();
            }
            Airbitz.ui.debugLevel(1,"Owl size after:" + Account.owl.data("owlCarousel").owl.owlItems.length);
        } else { Account.owlSet = true; }
    },
    getCards: function(callback) {
        user.getInfo("cards?brand_id=" + brand, function(all_card_info) {
            Airbitz.ui.debugLevel(1,"User's cards: " + JSON.stringify(all_card_info));

            /////////////////////////
            // Fake updating balances
//                for (var ic in all_card_info["cards"]) {
//                    var amt = 0;
//                    var num = "";
//                    if (typeof Account.all_cards[ic] === 'undefined') {
//                        amt = all_card_info["cards"][ic]["balance"][0]["amount"];
//                        num = all_card_info["cards"][ic]["code"];
//                    } else {
//                        amt = Account.all_cards[ic].bal;
//                        num = Account.all_cards[ic].num;
//                    }
//                    all_card_info["cards"][ic]["balance"][0]["amount"] = amt - 0.10;
//                    all_card_info["cards"][ic]["code"][0] = num + "h";
//                }
//
//                Account.numUpdates++;
//                if (Account.numUpdates == 5){
//                    all_card_info["cards"][0]["balance"][0]["amount"] = 1234.0;
//                    all_card_info["cards"][0]["code"][0] = "updated #1";
//                } else if (Account.numUpdates == 10) {
//                    all_card_info["cards"][1]["balance"][0]["amount"] = 2234.0;
//                    all_card_info["cards"][1]["code"][0] = "updated #2";
//                } else if (Account.numUpdates == 15) {
//                    all_card_info["cards"][2]["balance"][0]["amount"] = 3234.0;
//                    all_card_info["cards"][2]["code"][0] = "updated #3";
//                } else if (Account.numUpdates == 20) {
//                    all_card_info["cards"][3]["balance"][0]["amount"] = 4234.0;
//                    all_card_info["cards"][3]["code"][0] = "updated #4";
//                }
            /////////////////////////




            callback(all_card_info["cards"]);
        });
    },

    updateUsersCardsUI: function(cards, doneUpdating) { // Updates the UI with cards the user has purchased
        Airbitz.ui.debugLevel(1,"updateUsersCardsUI: " + cards.length + " cards from all brands.");

        for (var c = 0; c < cards.length; c++) {
            // Check arrays values are defined
            if(typeof cards[c] === 'undefined') server_json_error = true;
            else if(typeof cards[c].id === 'undefined') server_json_error = true;
            else if(typeof cards[c].refundable === 'undefined') server_json_error = true;
            else if(typeof cards[c].code === 'undefined') server_json_error = true;
            else if(typeof cards[c].code[0] === 'undefined') server_json_error = true;
            else if(typeof cards[c].brand_id === 'undefined') server_json_error = true;
            else if(typeof cards[c].balance === 'undefined') server_json_error = true;
            else if(typeof cards[c].balance[0] === 'undefined') server_json_error = true;
            else if(typeof cards[c].balance[0]["amount"] === 'undefined') server_json_error = true;

            if (server_json_error == true) {
                doneUpdating();
                return;
            }
        }

        Airbitz.ui.debugLevel(1,"updateUsersCardsUI: brand: "+ brand + ": " + cards.length);
        if(!cards.length > 0) {
            var changed = Account.haveCardsChanged(cards);
            if(changed || (!Account.owlSet)) {
                Account.all_cards = [];
                Airbitz.ui.debugLevel(1,"No cards. New acc!");
                if(typeof Account.owl.data("owlCarousel").owl === 'undefined') {
                    Account.setDummyCard();
                } else if(Account.owl.data("owlCarousel").owl.owlItems.length > 0) {
                    Account.setDummyCard();
                }
            }
        } else { // There's at least one card
            var changed = Account.haveCardsChanged(cards);

            if(changed == CardsChanged.YES) {
                Airbitz.ui.debugLevel(1,"updateUsersCardsUI: brand: "+ brand + ": " + cards.length + " CARDS CHANGED");
                Account.all_cards = [];
                var needToClearOwl = true;

                var c = 0;
                for (c in cards) {

                    var card = new Card(
                            cards[c]["id"],
                            cards[c]["code"][0],
                            cards[c]["balance"][0]["amount"],// e.g. $5
                            cards[c]["refundable"]
                    );
                    Account.pingCard(card["id"]);
                    if (0 == c) {
                        Account.current_card_id = card["id"]; // Assign the current card to the first on the list
                    }
                    Account.all_cards[c] = card;
                    var tSource = $("#card-template").html();
                    var cardTemplate = Handlebars.compile(tSource);
                    if (!card.bal == 0) {
                        var floatBalance = parseFloat(card.bal);
                        //card_html.querySelector(".card-number").setAttribute("card", card.id);
                        var rText = "";
                        if (card.isRefundable /* && refund_enabled */) {
                            rText = "Refund Card"; // Make sure the info button shows up.
                        }
                        var thisCard = {
                            cardNumber: "<div class=\"card-number\" card=\"" + card.id + "\">" + card.num + "</div>",
                            cardAmount: "<div class=\"card-balance-amt\" card=\"" + card.id + "\">" + "$" + floatBalance.toFixed(2) + "</div>",
                            cardBarcode: "<img class=\"barcode \" src=\"" + fold_api + "my/cards/" + card.id + "/barcode/png" + "\"/>",
                            refundText: rText
                        }
                        var thisCardHTML = cardTemplate(thisCard);
                        Airbitz.ui.debugLevel(1, "Adding card: " + c + " card info: " + cards[c]);
                        if (needToClearOwl) {
                            Account.clearOwl();
                            needToClearOwl = false;
                        }

                        Account.owl.data('owlCarousel').addItem(thisCardHTML);
                        //document.querySelector("#user-cards").appendChild( document.importNode(card_html, true) );
                    }
                }
            } else if (changed == CardsChanged.VALUE_ONLY) {
                Account.all_cards = [];

                for (var c in cards) {
                    var card = new Card(
                            cards[c].id,
                            cards[c].code[0],
                            cards[c].balance[0].amount,// e.g. $5
                            cards[c].refundable
                    );
                    Account.all_cards[c] = card;

                    var amt = parseFloat(card.bal);
                    var amtString = "$" + amt.toFixed(2);

                    $("div.card-balance-amt[card=" + card.id + "]").text(amtString);
                    $("div.card-number[card=" + card.id + "]").text(card.num);
                }
            }
        }
        $('.materialboxed').materialbox();
        $(".card-refund").off().on('click', function() {
            Airbitz.ui.debugLevel(1,"Refunding button");
            var thisCardId = $(this).parent().parent().children(".card-info-main").children(".card-balance-amt").attr("card");
            Airbitz.ui.debugLevel(1,"This card: " + thisCardId);
            var thisCard = Account.getCardById(thisCardId);
            thisCard.refund();
        });
        doneUpdating();
    },
    haveCardsChanged: function(cards) { // Has different cards?
        var match = 0;
        if (force_refresh) {
            force_refresh = 0;
            return CardsChanged.YES;
        }
        Airbitz.ui.debugLevel(1,"haveCardsChanged: oldcards:" + Account.all_cards.length + " newcards:" + cards.length);

        if(cards.length != Account.all_cards.length) {
            Airbitz.ui.debugLevel(1,"haveCardsChanged: return YES");
            return CardsChanged.YES;
        }
        var balance_changed = false;
        for(var ic in cards) {
            for(var iac in Account.all_cards) {
                if(cards[ic]["id"] == Account.all_cards[iac].id) {
                    match++;
                    Airbitz.ui.debugLevel(1,"haveCardsChanged: found id match:" + cards[ic]["id"]);
                    Airbitz.ui.debugLevel(1,"haveCardsChanged: oldbal:" + Account.all_cards[iac].bal);
                    Airbitz.ui.debugLevel(1,"haveCardsChanged: newbal:" + cards[ic]["balance"][0]["amount"]);
                    if(cards[ic]["balance"][0]["amount"] != Account.all_cards[ic].bal) {
                        Airbitz.ui.debugLevel(1,"haveCardsChanged: Balance changed card");
                        balance_changed = true;
                    }
                }
            }
        }

        Airbitz.ui.debugLevel(1,"haveCardsChanged: matched:" + match + " newlength:" + cards.length);
        if(match != cards.length) {
            Airbitz.ui.debugLevel(1,"haveCardsChanged: return YES");
            return CardsChanged.YES;
        }

        if (balance_changed) {
            Airbitz.ui.debugLevel(1,"haveCardsChanged: return VALUE_ONLY");
            return CardsChanged.VALUE_ONLY;
        } else {
            Airbitz.ui.debugLevel(1,"haveCardsChanged: return YES");
            return CardsChanged.NO;
        }
    },
    setLoadingCard: function() {
        var tSource = $("#card-template").html();
        var cardTemplate = Handlebars.compile(tSource);

        var thisCard = {
            cardNumber: "<div class=\"card-number\">" + "Loading..." + "</div>",
            cardAmount: "<div class=\"card-balance-amt\">" + "$0.00" + "</div>",
            cardBarcode: "",
            refundText: ""
        }
        var thisCardHTML = cardTemplate(thisCard);
        Account.clearOwl(); // Make sure there's only ever ONE grey card and no other cards at the same time.
        Account.owl.data('owlCarousel').addItem(thisCardHTML);
    },
    setDummyCard: function() {
        var tSource = $("#card-template").html();
        var cardTemplate = Handlebars.compile(tSource);

        var thisCard = {
            cardNumber: "<div class=\"card-number\">" + "6666 8888 4444 0000" + "</div>",
            cardAmount: "<div class=\"card-balance-amt\">" + "$0.00" + "</div>",
            cardBarcode: "<img class=\"barcode barcode-inactive\" src=\"https://airbitz.co/go/wp-content/uploads/2015/12/download.png\"/>",
            refundText: ""
        }
        var thisCardHTML = cardTemplate(thisCard);
        Account.clearOwl(); // Make sure there's only ever ONE grey card and no other cards at the same time.
        Account.owl.data('owlCarousel').addItem(thisCardHTML);
    },
    getCardById: function(cardId) {
        var cardFromId = Account.all_cards.filter(function( obj ) {
            return obj.id == cardId;
        });
        return cardFromId[0];
    },

    updateCardsForSale: function(doneListing) { // Updates the UI with cards avaliable to purchase from Fold.
        var numCardsToBuy = 0;
        this.getInfo("brands", function(cards_avil) {
            Airbitz.ui.debugLevel(1,JSON.stringify(cards_avil) );
            var all_brands = cards_avil["brands"];
            var brands_cards = "";
            min_price_rate = 1.0;

            for(var ic in all_brands) {
                if(typeof all_brands[ic] === 'undefined') server_json_error = true;
                else if(typeof all_brands[ic]["id"] === 'undefined') server_json_error = true;
                else if(typeof all_brands[ic]["price_rate"] === 'undefined') server_json_error = true;
                else if(typeof all_brands[ic]["refund_enabled"] === 'undefined') server_json_error = true;

                if (server_json_error) break;

                if(all_brands[ic]["id"] == brand) {
                    if(parseFloat(all_brands[ic]["price_rate"]) < min_price_rate) {
                        min_price_rate = parseFloat(all_brands[ic]["price_rate"]);
                    }
                    refund_enabled = all_brands[ic]["refund_enabled"];

                    brands_cards = all_brands[ic];
                    break;
                }
            }
            Airbitz.ui.debugLevel(1,"min_price_rate:" + min_price_rate);

            var maxDiscount = 100 * (1.0 - min_price_rate);
            maxDiscount = maxDiscount.toFixed(0);
            $(".brand-discount").text(maxDiscount + "%");

            Airbitz.ui.debugLevel(1,JSON.stringify(brands_cards["card_values"]));
            user.getBal(function(total_bal) {
                user.total_bal = total_bal;
                if (brands_cards["soft_max_total"] && brands_cards["soft_max_total"].length > 0) {
                    var maxBal = parseInt(brands_cards["soft_max_total"][0]["amount"]);
                } else {
                    var maxBal = 0;
                }
                Airbitz.ui.debugLevel(1,"User bal: " + user.total_bal);
                Airbitz.ui.debugLevel(1,"Max: " + maxBal);
                if(maxBal >= user.total_bal) {
                    var card_vals = brands_cards["card_values"];
                    $(".add-buttons").html(""); // Wipe out any cards that are currently there.
                    var addTemplateHtml = "";

                    if (card_vals) {
                      // Sort cards from lowest to highest
                      card_vals.sort(function(a, b){
                          return a["amount"] - b["amount"];
                      });

                      for(ic in card_vals) {
                          numCardsToBuy++;
                          var price_rate = parseFloat(card_vals[ic]["price_rate"]);

                          Airbitz.ui.debugLevel(1,"Listing card " + ic);
                          var source = $("#add-funds").html();
                          var addTemplate = Handlebars.compile(source);

                          var thisCard = {
                              cardValue: "<span class=\"card-value\" value=\"" + card_vals[ic]["amount"] + "\">" + card_vals[ic]["formatted"]["all_decimal_places"] + "</span>"
                          }
                          var addTemplateHtml = addTemplateHtml + addTemplate(thisCard);
                      }
                    }
                    $(".add-buttons").html(addTemplateHtml);
                    $(".buy-card").off().on('click', function() {
                        user.purchaseCard($(this).parent().parent().find(".card-value").attr("value"));
                    });
                }
                if (numCardsToBuy) {
                    $(".add-funds-header").text("Buy Gift Card");
                } else {
                    $(".add-funds-header").text("Sorry, no cards available");
                }

                doneListing();
            });
        }, "");
    },
    logRefunds: function() {
        Account.getInfo("refunds", function(refunds) {
            console.log(JSON.stringify(refunds));
            Airbitz.ui.debugLevel(1,JSON.stringify(refunds));
        });
    },
    getInfo: function(info, handleResponse, root) {
        root = typeof root !== 'undefined' ? root : "my/";
        $.get(fold_api + root + info).done(function(response) {
            handleResponse(response);
        });
    },
    getBal: function(handleResponse) { // Get total balance of user. Return 0 if user doesn't have bal.
        this.getInfo("balances?currency=USD", function(balances) {
            try {
                handleResponse(balances["balances"][0]["amount"]);
            }
            catch(err) {
                handleResponse(0);
            }
        });
    },
    purchaseCard: function(denomination, brand_id) {
        brand_id = typeof a !== 'undefined' ? a : brand;
        var newOrder = { "orders": [{
            "brand_id": String(brand_id),
            "value": { "amount": String(denomination), "currency": "USD" },
            "price": { "currency": "BTC" },
            "approved": true
        }],
            "cancel_all_others": true
        }
        var url = fold_api + "my/orders";
        Airbitz.ui.debugLevel(1,"Getting new order");
        Airbitz.ui.showAlert('', 'Creating Order', {'showSpinner': true});
        sRequestHandler(url, newOrder, function(r) {
            Airbitz.ui.debugLevel(1,"Order: " + JSON.stringify(r));
            var amt = (r["orders"][0]["price"]["amount"] * 100000000);
            var toAddr = r["orders"][0]["payment"][0]["address"];
            Airbitz.ui.debugLevel(1,"Spending " + amt + " from wallet: " + user.abWallet + " to: " + toAddr);
            Airbitz.ui.debugLevel(1,"Fiat amt: " + denomination)
            Airbitz.ui.hideAlert();
            if (large_value_threshold < denomination) {
                Airbitz.ui.showAlert("High Value Card", "You are purchasing a card over $50 in value. This requires one bitcoin network confirmation before your card will be available and may take over 10 minutes.");
            }
            Airbitz.core.requestSpend(Account.abWallet,
                    toAddr, amt, 0, {
                        label: brand,
                        category: category,
                        notes: brand + " $" + String(denomination) + " gift card.",
                        bizId: parseInt(bizId),
                        success: function(res) {
                            if (res && res.back) {
                                // User pressed backed button
                            } else {
                                Airbitz.ui.showAlert("Card Purchased", "Card purchased. Your " + brand + " card should appear shortly.");
                                force_refresh = 1;
                                Account.clearOwl();
                                Airbitz.ui.debugLevel(1,"Funds were sent.");
                                logStats("purchase",brand,denomination);
                            }
                        },
                        error: function() {
                            Airbitz.ui.showAlert("Unable to send funds.", "Funds weren't sent");
                            Airbitz.ui.debugLevel(1,"Funds were not sent.");
                        }
                    });
        }, function(error) {
            Airbitz.ui.showAlert("Server error", "Error making purchase. Please contact support");
        });
    }
}

function Card(id, num, bal, isRefundable) {
    isRefundable = typeof isRefundable !== 'undefined' ? isRefundable : false;
    this.id = id;
    this.num = num;
    this.bal = bal;
    this.isRefundable = isRefundable;
}

Card.prototype.refund = function() {
    if(this.isRefundable) {
        Airbitz.ui.showAlert('', 'Refunding card...', {'showSpinner': true});
        var url = fold_api + "my/refunds";
        var thisCard = this;
        var balance = this.bal;
        Airbitz.ui.debugLevel(1,"Refunding card " + this.id + " amount: " + this.bal);
        var refund = {"refunds": [{
            "card_id": this.id
        }]};
        createAddress(Account.abWallet, brand, 0, 0, category, "Refunded " + brand + " gift card.",
                function(data) {
                    Account.updateWAddr(data["address"], function() {
                        sRequestHandler(url, refund, function(response) {
                            Account.clearOwl();
                            Airbitz.ui.showAlert("Card Refunded", "Card Refunded. Please allow 8-15 minutes for refund.");
                            Airbitz.ui.debugLevel(1,response);
                            Airbitz.ui.debugLevel(1,"Done refunding!");
                            logStats("refund",brand,balance);
                            force_refresh = 1;
                        }, function(error) {
                            Airbitz.ui.showAlert("Card Not Refunded", "Error refunding card. Please try again later. Error:sRequestHandler:refund");
                        });
                    }, function() {
                        Airbitz.ui.showAlert("Card Not Refunded", "Error refunding card. Please try again later. Error:updateWAddr");
                    });
                }, function(data) {
                    Airbitz.ui.showAlert("Card Not Refunded", "Error refunding card. Please try again later. Error:createAddress");
                    Airbitz.ui.debugLevel(1,data);
                });

    } else {
        Airbitz.ui.showAlert('', 'Card is not refundable');
    }
}

Card.prototype.remove = function() { // Remove card from UI
    if(this.bal == 0) {

    }
}

Card.prototype.mockBal = function(bal) {
    var url = fold_api + "my/mock/cards";
    var thisCard = this;
    $.post(url,
            {"cards": [{
                "id": thisCard.id.toString(),
                "balance_amount": bal.toString()
            }]}
    ).done(function() {
        Airbitz.ui.debugLevel(1,"Done mocking " + thisCard.id + " balance to: " + bal);
    });
}

// Main
var user = Object.create(Account);

Airbitz.core.setWalletChangeListener(updateWallet);
//Airbitz.core.clearData(); fold-2015-11-18-JszcOVECE0iHn5
Account.username = Airbitz.core.readData("fold-username");
Account.pass = Airbitz.core.readData("fold-pass");
Airbitz.ui.showAlert('', 'Loading account...', {
    'showSpinner': true
});

if(!(typeof Account.username === 'undefined' || Account.username == null)) {
    Account.creds = {"users": [{
        "username": Account.username,
        "password": Account.pass
    }]};
    Airbitz.ui.debugLevel(1,"User pulled from memory.");
    user.exists.resolve();
} else {
    user.create();
    new_account = true;
}
$.when(user.exists).done(function(data) {
    user.login();
});
$(function() {
    $.when(user.logged_in).done(function(data) {
        Airbitz.ui.debugLevel(1,"Logged in");
        Account.owl.owlCarousel({ // Activate owl Carousel for cards.
            //navigation : true, // Show next and prev buttons
            slideSpeed : 300,
            paginationSpeed : 400,
            singleItem:true,
            afterMove: function(elem) {
                var current = this.currentItem;
                var card = elem.find(".owl-item").eq(current).find(".card-balance-amt").attr('card');
                Airbitz.ui.debugLevel(1,"Current card is " + card);
                Account.current_card_id = card;
                Account.pingCard(card);
            }

            // "singleItem:true" is a shortcut for:
            // items : 1,
            // itemsDesktop : false,
            // itemsDesktopSmall : false,
            // itemsTablet: false,
            // itemsMobile : false
        });
        Account.setLoadingCard();

//      Account.logRefunds();
        Airbitz.core.selectedWallet({
            success: updateWallet,
            error: function() {
                Airbitz.ui.debugLevel(1,"Could not get selected wallet");
                Airbitz.ui.showAlert("Wallet Error", "Error could not select wallet.");
            }
        });

        // If this is a new account. Set an initial refund address in case any purchases get botched
        if (new_account) {
            createAddress(Account.abWallet, brand, 0, 0, category, "Refunded " + brand + " gift card.",
                function(data) {
                    Account.updateWAddr(data["address"], function() {
                    }, function() {
                    });
                }, function(data) {
                    Airbitz.ui.debugLevel(1,data);
                });
        }


        Airbitz.ui.debugLevel(1,"Updating UI");
        Airbitz.ui.hideAlert();

        updateAllCards();
        toggleUi();

        user.getInfo("profile", function(response) {
            //Airbitz.ui.debugLevel(1,response);
            //Airbitz.ui.debugLevel(1,response["logged_in"]);
            user.getInfo("orders", function(response) {
                //Airbitz.ui.debugLevel(1,response);
            });
            // Done loading.
        });
    });
    // UI stuff
    Airbitz.ui.debugLevel(1,"logo: " + logo_url);
    $(".brand-name").text(brand);

    if (server_json_error) {
        Airbitz.ui.showAlert("Server Response Error", "Error in Server response. Please contact support");
        Airbitz.ui.debugLevel(1,"Error in Server response. Please contact support");
    }

    $(".brand-logo").attr("src", logo_url);
    $(".user-creds").html("Username: " + Account.username  + "<br>Password: " + Account.pass);
    $(".support-mail-link").html("<a href=\"mailto:support@foldapp.com?subject=Support%20Requested&body=" + "Username:" + Account.username + "\">support@foldapp.com.</a>");
});
