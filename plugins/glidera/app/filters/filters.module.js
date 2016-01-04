(function() {
  angular.module('app.filters', [])
    .filter('statusFilter', statusFilter)
    .filter('progressFilter', progressFilter)
    .filter('stateFilter', stateFilter)
    .filter('titlecase', titleCase)
    .filter('roundFiat', roundFiat)
    .filter('formatBtc', ['$filter', formatBtc])
    .filter('roundBtc', roundBtc)
    .filter('valToBtc', valToBtc)
    .filter('satoshiToDenom', satoshiToDenom);

  function statusFilter() {
    return function(status) {
      return (status) ? 'Verified' : 'Unverified';
    };
  }

  function progressFilter() {
    return function(userStatus) {
      if (userStatus.tier2SetupComplete) {
        return 'Verified';
      } else if (userStatus.tier2TransactionVolumeRequirementComplete 
          || userStatus.tier2AccountAgeRequirementComplete
          || userStatus.userOowIsSetup
          || userStatus.userSsnIsSetup) {
        return 'In Progress';
      } else {
        return 'Unverified';
      }
    };
  }

  function stateFilter() {
    return function(state) {
      if (state == 'UNSUBMITTED') {
        return 'Unsubmitted';
      } else if (state == 'SUBMITTED') {
        return 'Submitted';
      } else if (state == 'VERIFIED') {
        return 'Verified';
      } else if (state == 'FAILED') {
        return 'Failed';
      } else {
        return state;
      }
    };
  }

  function personalInfoFilter() {
    return function(status) {
      if ('SUBMITTED' == status) {
        return 'Submitted'
      } else if ('PENDING' === status) {
        return 'Pending';
      } else if ('VERIFICATIONSUBMITTED' === status) {
        return 'Submitted';
      } else if ('VERIFIED' === status) {
        return 'Verified';
      } else if ('FAILED' === status) {
        return 'Failed';
      }
      return 'Unverified';
    };
  }

  function titleCase() {
    return function (input) {
      var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

      return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title){
        if (index > 0 && index + match.length !== title.length &&
          match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
          (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
          title.charAt(index - 1).search(/[^\s-]/) < 0) {
          return match.toLowerCase();
        }

        if (match.substr(1).search(/[A-Z]|\../) > -1) {
          return match;
        }

        return match.charAt(0).toUpperCase() + match.substr(1);
      });
    }
  }

  function roundFiat(){
    return function(val, to){
        return (val || 0).toFixed(to || 2);
    }
  }

  function formatBtc($filter) {
    return function(val, denom) {
      var d = Airbitz.cryptoDenom;
      return $filter('roundBtc')(val) + ' ' + d;
    }
  }

  function roundBtc(){
    return function(val, to){
      if (!val) {
        return 0;
      }
      val = parseFloat(val);
      var d = Airbitz.cryptoDenom;
      if (d == "mBTC") {
        return (val * 1000).toFixed(to || 3);
      } else if (d == "bits") {
        return (val * 1000000).toFixed(to || 2);
      }
      return val.toFixed(to || 5);
    }
  }

  function valToBtc() {
    return function(val){
      var d = Airbitz.cryptoDenom;
      if (d == "mBTC") {
        return val / 1000;
      } else if (d == "bits") {
        return val / 1000000;
      }
      return val;
    }
  }

  function satoshiToDenom() {
    return function(val) {
      if ("bits" == Airbitz.cryptoDenom) {
        return val / 100;
      } else if ("mBTC" == Airbitz.cryptoDenom) {
        return val / 100000;
      } else {
        return val / 100000000;
      }
    }
  }

})();
