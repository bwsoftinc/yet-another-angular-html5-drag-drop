angular.module('demo', ['yaHTML5Sort'])
       .controller('ctrl1', ['$scope', function ($scope) {

           $scope.models = [];
           $scope.models.push({ name: "List A", items: [] });
           $scope.models.push({ name: "List B", items: [] });

           for (var i = 1; i <= 3; i++) {
               $scope.models[0].items.push({ id: Math.random(), name: "Item A " + i });
               $scope.models[1].items.push({ id: Math.random(), name: "Item B " + i });
           }

           $scope.options = {
               dropPlaceholderClass: 'placeholder'
           };

           $scope.$watch('models', function (model) {
               $scope.json = angular.toJson(model, true);
           }, true);

       }])
       .controller('ctrl2', ['$scope', function ($scope) {

           $scope.models = [];
           $scope.models.push({ name: "List A", items: [] });
           $scope.models.push({ name: "List B", items: [] });

           for (var i = 1; i <= 3; i++) {
               $scope.models[0].items.push({ id: Math.random(), name: "Item A " + i });
               $scope.models[1].items.push({ id: Math.random(), name: "Item B " + i });
           }

           $scope.options = {
               dropPlaceholderClass: 'placeholder',
               candrop: function (item, source, target) {
                   return source === target;
               }
           };

           $scope.$watch('models', function (model) {
               $scope.json = angular.toJson(model, true);
           }, true);

       }])
       .controller('ctrl3', ['$scope', function ($scope) {

           $scope.models = [];
           $scope.models.push({ name: "List A", items: [] });
           $scope.models.push({ name: "List B", items: [] });

           for (var i = 1; i <= 3; i++) {
               $scope.models[0].items.push({ id: Math.random(), name: "Item A " + i });
               $scope.models[1].items.push({ id: Math.random(), name: "Item B " + i });
           }

           $scope.options = {
               dropPlaceholderClass: 'placeholder',
               candrop: function (item, source, target) {
                   return source === target || target == $scope.models[1].items;
               }
           };

           $scope.$watch('models', function (model) {
               $scope.json = angular.toJson(model, true);
           }, true);

       }])
        .controller('ctrl4', ['$scope', function ($scope) {

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
       .controller('ctrl5', ['$scope', function ($scope) {

           $scope.models = [];
           $scope.models.push({ name: "List A", items: [] });
           $scope.models.push({ name: "List B", items: [] });

           for (var i = 1; i <= 3; i++) {
               $scope.models[0].items.push({ id: Math.random(), name: "Item A " + i });
               $scope.models[1].items.push({ id: Math.random(), name: "Item B " + i });
           }

           $scope.options = {
               dropPlaceholderClass: 'placeholder'
           };

       }]).controller('ctrl6', ['$scope', function ($scope) {

           $scope.model = { name: "List A", items: [] };

           for (var i = 1; i <= 3; i++)
               $scope.model.items.push({ id: Math.random(), name: "Item A " + i });

           $scope.options = {
               dropPlaceholderClass: 'placeholder'
           };

       }]).controller('ctrl7', ['$scope', function ($scope) {

           $scope.model = { name: "List B", items: [] };

           for (var i = 1; i <= 3; i++)
               $scope.model.items.push({ id: Math.random(), name: "Item B " + i });

           $scope.options = {
               dropPlaceholderClass: 'placeholder'
           };

       }]).controller('ctrl8', ['$scope', function ($scope) {

           $scope.model = { name: "List A", items: [] };

           for (var i = 1; i <= 3; i++)
               $scope.model.items.push({ id: Math.random(), name: "Item A " + i });

           $scope.options = {
               dropPlaceholderClass: 'placeholder'
           };

       }]);

angular.module('demo2', ['yaHTML5Sort'])
    .controller('ctrl9', ['$scope', function ($scope) {

        $scope.model = { name: "List B", items: [] };

        for (var i = 1; i <= 3; i++)
            $scope.model.items.push({ id: Math.random(), name: "Item B " + i });

        $scope.options = {
            dropPlaceholderClass: 'placeholder'
        };

    }]);


angular.element(document).ready(function () { angular.bootstrap(document.getElementById("c8"), ['demo']); });
angular.element(document).ready(function () { angular.bootstrap(document.getElementById("c9"), ['demo2']); });