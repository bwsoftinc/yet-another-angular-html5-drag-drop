angular.module('demo', ['yaHTML5Sort'])
.controller('ctrl2', ['$scope', function ($scope) {

    $scope.model = [];

    for (var i = 1; i <= 3; i++) {
        $scope.model.push({ id: Math.random(), name: "Item A " + i });
    }

    $scope.options = {
        dropPlaceholderClass: 'placeholder1',
    };

    $scope.$watch('model', function (model) {
        $scope.json = angular.toJson(model, true);
    }, true);

}])
.controller('ctrl3', ['$scope', function ($scope) {

    $scope.model = [];

    for (var i = 1; i <= 3; i++) {
        $scope.model.push({ id: Math.random(), name: "Item A " + i });
    }

    $scope.options = {
        dropPlaceholderClass: 'placeholder',
        dragHandleClass: 'handle'
    };

    $scope.$watch('model', function (model) {
        $scope.json = angular.toJson(model, true);
    }, true);

}])
.controller('ctrl4', ['$scope', function ($scope) {

    $scope.model = [];

    for (var i = 1; i <= 3; i++) {
        $scope.model.push({ id: Math.random(), name: "Item A " + i });
    }

    $scope.options = {
        dropPlaceholderClass: 'placeholder',
        dragSourceItemClass: 'source'
    };

    $scope.$watch('model', function (model) {
        $scope.json = angular.toJson(model, true);
    }, true);

}])
 .controller('ctrl5', ['$scope', function ($scope) {

     $scope.model = [];

     for (var i = 1; i <= 3; i++) {
         $scope.model.push({ id: Math.random(), name: "Item A " + i });
     }

     $scope.options = {
         dropPlaceholderClass: 'placeholder',
         dragItemClass: 'dragitem'
     };

     $scope.$watch('model', function (model) {
         $scope.json = angular.toJson(model, true);
     }, true);

 }])
.controller('ctrl6', ['$scope', function ($scope) {

    $scope.model = [];

    for (var i = 1; i <= 3; i++) {
        $scope.model.push({ id: Math.random(), name: "Item A " + i });
    }

    $scope.options = {
        dropPlaceholderClass: 'placeholder',
        onreplace: function () { },
        dropTargetItemClass: 'drophover'
    };

    $scope.$watch('model', function (model) {
        $scope.json = angular.toJson(model, true);
    }, true);

}]);