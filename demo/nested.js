
angular.module('demo', ['yaHTML5Sort'])
.controller('ctrl1', ['$scope', function ($scope) {

    $scope.models = [];
    $scope.models.push({ name: "List A", items: [] });
    $scope.models.push({ name: "List B", items: [] });

    for (var i = 1; i <= 3; i++) {
        $scope.models[0].items.push({ id: Math.random(), name: "Item A " + i });
        $scope.models[1].items.push({ id: Math.random(), name: "Item B " + i });
    }

    var suba = $scope.models[0].items[0].sub = { name: "Nested List A", items: [] };
    var subb = $scope.models[1].items[2].sub = { name: "Nested List B", items: [] };

    for (var i = 1; i <= 3; i++) {
        suba.items.push({ id: Math.random(), name: "Nested Item A " + i });
        subb.items.push({ id: Math.random(), name: "Nested Item B " + i });
    }

    $scope.options = {
        dropPlaceholderClass: 'placeholder',
        candrop: function (item, source, target) {
            if (!item.sub) return true;

            //cannot drop nested list into itself or a child nested list
            return !searchfor(item.sub.items, target)
        }
    };

    function searchfor(arr, item) {
        if (arr === item)
            return true;

        for (var i = 0; i < arr.length; i++)
            if (arr[i].sub && searchfor(arr[i].sub.items, item))
                return true;

        return false;
    }

    $scope.$watch('models', function (model) {
        $scope.json = angular.toJson(model, true);
    }, true);

}]);