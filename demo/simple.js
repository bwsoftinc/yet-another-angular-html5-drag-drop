
angular.module('demo', ['yaHTML5Sort'])
 .controller('ctrl3', ['$scope', function ($scope) {

     $scope.model = [];

     for (var i = 1; i <= 3; i++) {
         $scope.model.push({ id: Math.random(), name: "Item A " + i });
     }

     $scope.options = {
         dropPlaceholderClass: 'placeholder'
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
        oncopy: function (item) {
            item.id = Math.random();
        }
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
        onreplace: function (item) {
        }
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
          oncopy: function (item) {
              item.id = Math.random();
          },
          onreplace: function (item) {
          }
      };

      $scope.$watch('model', function (model) {
          $scope.json = angular.toJson(model, true);
      }, true);

  }]);