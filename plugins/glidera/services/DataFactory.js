var app = angular.module('exchangeGlidera');


var DataFactory = function() {
  // simple service to share between two controllers
  var factory = {};
  var storage_array = [];
  var idCounter = 0;

  factory.addData = function(data) {
    data.id = idCounter;
    data.created = new Date();

    storage_array.push(data)
    idCounter++;
  };

  factory.getStorageArray = function() {
    return storage_array;
  };


  factory.removeData = function(id) {
    var index, text;
    for(var i=0; i<storage_array.length; i++) {
      if(id === storage_array[i].id){
        index = i;
        text = storage_array[i].text
      }
    }
    storage_array.splice(index, 1);
  };

  factory.clearData = function() {
    storage_array.splice(0, storage_array.length);
  };


  return factory;
}

// create factory
app.factory('DataFactory', DataFactory);
