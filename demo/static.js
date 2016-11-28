angular.module('demo', ['yaHTML5Sort'])
       .controller('ctrl1', ['$scope', function ($scope) {

           $scope.models = [];
           $scope.models.push({ name: "List A", items: [] });
           $scope.models.push({ name: "List B", items: [] });

           for (var i = 1; i <= 3; i++)
               $scope.models[0].items.push({ id: Math.random(), name: "Item A " + i });
           $scope.models[1].items.push({ id: Math.random(), name: "Item B 1" });

           $scope.options = {
               dropPlaceholderClass: 'placeholder',
               onmove: function (item, source, index, target) {
                   item.id = Math.random();
                   target.splice(index - 1, 0, JSON.parse(JSON.stringify(item)));
                   source.splice(source.indexOf(item), 1);
                   return true;
               }
           };

           $scope.options2 = {
               dropPlaceholderClass: 'placeholder',
               onmove: function (item, source, index, target) {
                   item.id = Math.random();
                   target.splice(index - 2, 0, JSON.parse(JSON.stringify(item)));
                   source.splice(source.indexOf(item), 1);
                   return true;
               }
           };

           $scope.$watch('models', function (model) {
               $scope.json = angular.toJson(model, true);
           }, true);

       }])
        .controller('ctrl2', ['$scope', function ($scope) {

            $scope.models = [];
            $scope.models.push({ name: "List A", items: [] });
            $scope.models.push({ name: "List A.2", items: [] });
            $scope.models.push({ name: "List B", items: [] });
            $scope.models.push({ name: "List B.2", items: [] });

            for (var i = 1; i <= 3; i++) {
                $scope.models[0].items.push({ id: Math.random(), name: "Item A.1 " + i });
                $scope.models[1].items.push({ id: Math.random(), name: "Item A.2 " + i });
                $scope.models[2].items.push({ id: Math.random(), name: "Item B.1 " + i });
            }

            $scope.options = {
                dropPlaceholderClass: 'placeholder'
            };

            $scope.$watch('models', function (model) {
                $scope.json = angular.toJson(model, true);
            }, true);

        }]);