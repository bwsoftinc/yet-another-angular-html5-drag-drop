console.clear()
angular.module('demo', ['yaHTML5Sort'])
.filter('notfirst', function () {
    return function (arr) {
        var newarr = [];
        arr = arr || [];
        for (var i = 1; i < arr.length; i++)
            newarr.push(arr[i]);
        return newarr;
    };
})
.controller('DemoCtrl', ['$scope', '$document', '$timeout', function ($scope, $document, $timeout) {

    $scope.sortoptions = {
        dragHandleClass: 'handle',
        dragSourceItemClass: 'drag',
        dropHoverItemClass: 'hover',
        dragItemClass: 'dragitem',
        dropPlaceholderClass: 'placeholder',
        candrag: function (sourceItem, sourceContainer) {
            return true;
        },
        candrop: function (item, source, target) {
            //any item can drop to it's own list
            if (source === target) 
                return true;

            //subitems cannot exit own list, combo cannot be dragged into combo
            else if(item.subi || (item.sub && target[0] && target[0].subi))
                return false;

            return true;
        },
        oncopy: function (item, source, targetIndex, target) {
            item.id = Math.random();
            if (target[0] && target[0].subi)
                item.subi = true;
        },
        onmove: function (item, souorce, targetIndex, target) {
            item.id = Math.random();
            if (target[0] && target[0].subi)
                item.subi = true;
        },
        onreplace: function (item, source, targetIndex, target) {
            item.id = Math.random();
            if (target[0] && target[0].subi)
                item.subi = true;
        }
    };

    $scope.itemsper = 18;
    $scope.reload = function () {
        $scope.mealperiods = [];
        for (var m = 0; m < 2; m++) {
            var stations = [];
            for (var s = 0; s < 3; s++) {
                var days = [];
                for (var day = 1; day < 6; day++) {
                    days[day] = [];
                    for (var i = 0; i < $scope.itemsper; i++) {
                        var rand = Math.round(Math.random() * 10);
                        if (rand <= 2) {
                            var sub = [];
                            for (var j = 0; j <= rand * 2; j++)
                                sub[j] = { id: Math.random(), name: " sub " + j, subi: true };
                            days[day][i] = { id: Math.random(), name: " Combo " + day + "." + i, sub: sub };
                        }
                        else
                            days[day][i] = { id: Math.random(), name: " Item " + day + "." + i };
                    }
                }
                days[6] = [];
                stations[s] = { id: Math.random(), name: "Station " + s, days: days };
            }
            $scope.mealperiods[m] = { id: Math.random(), name: "Mealperiod " + m, stations: stations };
        }
    }
    $scope.reload();

    $document.on('click', function (e) {
        if ($scope.context && lock) {
            $scope.context.$apply(function () {
                $scope.itemContext.context = false;
            });

            $scope.context = $scope.itemContext = null;
            lock = false;
        }
        return false;
    });

    var lock = false;
    $scope.showContext = function ($event, item, scope) {
        var closeold = ($scope.itemContext != null);
        if (closeold) $scope.itemContext.context = false;

        item.context = true;
        $scope.context = scope;
        $scope.itemContext = item;
        $timeout(function () { lock = true }, 0);

        if (closeold)
            $event.stopPropagation();
    };

    $scope.makeCopy = function (item, arr) {
        var copy = JSON.parse(JSON.stringify(item));
        copy.id = Math.random();
        copy.context = false;
        if(copy.sub) copy.exp = false;
        arr.push(copy)
    };

    $scope.addItem = function (arr, idx) {
        arr.push({ "id": Math.random(), "name": " Item " + idx + "." + arr.length });
    };

    $scope.makeCombo = function (item) {
        item.sub = [{ 'id': Math.random(), 'name': 'Sub 0' }]
        item.name = ' Combo' + item.name.substring(5);
    };

    $scope.removeItem = function (item, arr) {
        arr.splice(arr.indexOf(item), 1);
    };

}]);