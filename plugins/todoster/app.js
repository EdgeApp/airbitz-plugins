// started from http://jsbin.com/usaruce/2703/edit

Airbitz.ui.title('Todobitz');

var app = angular.module('todoicus', ['ngAnimate']);
app.controller('todoCtrl', function($scope, DataFactory) {
  $scope.DF = DataFactory
  // initial example data
  $scope.DF.addData({text: "Check this and it will cross it out.", complete: false});  

  $scope.addTodo = function() {
    var data = {text: $scope.newTodo, complete: false};
    $scope.DF.addData(data);
    $scope.newTodo = "";
  };
  
  $scope.clearAll = function() {
    $scope.DF.clearData()
  };
});


app.controller('doneCtrl', function($scope, DataFactory) {
  $scope.DF = DataFactory;
  // initial example data
  $scope.DF.addData({text: "complete item from last week", complete: true});
});


app.controller('dataCtrl', function($scope, DataFactory) {
  $scope.storage_array = DataFactory.getStorageArray();
});
















