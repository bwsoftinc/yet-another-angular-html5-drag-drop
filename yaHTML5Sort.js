angular.module('yaHTML5Sort', [])
.service('yaInstance', function () {
    var instances = [{}];
    var root = instances[0];
    return {
        get: function (index) {
            return instances[index];
        },
        init: function (scope, attrs) {
            var options = {},
                op = scope[attrs.yaSort] || {},
                match = attrs.ngRepeat.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+\|\s+([\s\S]+?))?(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

            options.item =  match[1];
            options.items =  match[2];
            options.copy = op.oncopy !== undefined;
            options.replace = op.onreplace !== undefined;
            options.candrag =  op.candrag || function () { return true; };
            options.onmove =  op.onmove || function () { return false; };
            options.oncopy =  op.oncopy || function () { return false; };
            options.onreplace =  op.onreplace || function () { return false; };
            options.candrop =  op.candrop || function () { return true; };
            options.dragHandleClass =  op.dragHandleClass || null;
            options.dragSourceItemClass =  op.dragSourceItemClass || null;
            options.dropTargetItemClass =  op.dropTargetItemClass || null;
            options.dragItemClass =  op.dragItemClass || null;
            options.dropPlaceholderClass =  op.dropPlaceholderClass || null;
            options.itemArray =  scope.$eval(match[2], scope) || scope.$eval(match[2] + '=[]', scope);
            options.disabled = op.disabled || false;
            attrs.yaSort = instances.push(options) - 1;
            return options;
        },
        clearDrop: function () {
            root.sourceNode = null;
            root.sourceItem = null;
            root.sourceArray = null;
            root.copy = null;
        },
        removePlaceholder: function (container) {
            if (root.placeholder && root.placeholder.parentNode &&
               (!container || root.placeholder.parentElement === container)) {            
                root.placeholder.parentNode.removeChild(root.placeholder);
                root.placeholder = null;
            }
        },
        placeholderIndex: function (options) {
            return Array.prototype.indexOf.call(root.placeholder.parentNode.children, root.placeholder);
        }
    };
})
//has to run before ng-repeat (priority 1000) so ngRepeat directive can be sniffed and yaSort initialized before ngRepeat has a chance to remove this dom node
//the ya-sort options are initialized for this instance and drag-drop events attached to the node containing (parent Element) the yaSort directive
.directive('yaSort', ['$timeout', 'yaInstance', function ($timeout, yaInstance) {
    return {
        priority: 1001,
        compile: function (element, attrs) {
            var root = yaInstance.get(0);
            return {
                post: function (scope, element, attrs) {
                    var container = element.parent(),
                        _container = container[0],
                        options = yaInstance.init(scope, attrs);

                    element.parent().attr('ya-instance', attrs.yaSort);
                    if (options.disabled) return;

                    container.on('dragleave', function (e) {
                        e = e.originalEvent || e;
                        container.removeClass('yadragtarget');

                        $timeout(function () {
                            if (!container.hasClass('yadragtarget')) {
                                yaInstance.removePlaceholder(_container);
                            }
                        }, 100);
                    });

                    container.on('dragstart dragenter', function (e) {
                        e = e.originalEvent || e;
                        e.preventDefault();
                    });

                    function ensurePlaceholder() {
                        if (!root.placeholder) {
                            root.placeholder = root.sourceNode.cloneNode(false);
                            root.placeholder.removeAttribute('ya-sort');
                            root.placeholder.classList.add(options.dropPlaceholderClass);
                            root.placeholder.classList.add(options.dropTargetItemClass);
                            root.placeholder.classList.remove(options.dragSourceItemClass);
                        }
                    }

                    function findRepeat(item, upperhalf) {
                        var search = item;

                        if (search.nodeType === 8 && search.data.indexOf('ngRepeat:') > 0)
                            return search;

                        //try up first if in upper half
                        if (upperhalf) {
                            while (search = search.previousSibling)
                                if (search.nodeType === 8 && search.data.indexOf('ngRepeat:') > 0)
                                    break;
                        }

                        //else search down
                        if (!upperhalf || search === null) {
                            search = item;
                            while (search = search.nextSibling)
                                if (search.nodeType === 8 && search.data.indexOf('ngRepeat:') > 0)
                                    break;
                        }

                        //try up again if not already tried
                        if (search === null && !upperhalf) {
                            search = item;
                            while (search = search.previousSibling)
                                if (search.nodeType === 8 && search.data.indexOf('ngRepeat:') > 0)
                                    break;
                        }

                        return search;
                    }

                    container.on('dragover', function (e) {
                        if (!root.sourceItem) return;
                        e = e.originalEvent || e;
                        _container.classList.add('yadragtarget');

                        var item = event.target;
                        var iscontainer = item === _container;
                        if (!iscontainer)
                            while (item.parentElement !== _container)
                                item = item.parentElement;

                        var empty = options.itemArray.length === 0;
                        var containerhasitems = iscontainer && !empty;
                        var notcompatible = !options.candrop(root.sourceItem, root.sourceArray, options.itemArray);
                        if (notcompatible || containerhasitems || (options.replace && e.shiftKey && item === root.sourceNode))
                            e.dataTransfer.dropEffect = 'none';
                        else
                            e.dataTransfer.dropEffect = (e.ctrlKey && root.copy) ? 'copy' : 'move';

                        if ((e.shiftKey && options.replace) || notcompatible || containerhasitems)
                            yaInstance.removePlaceholder(_container);
                        else if (item !== root.placeholder) {
                            var upperhalf = e.offsetY < item.offsetHeight / 2;
                            ensurePlaceholder();

                            //over static node or container
                            if ( iscontainer && empty)
                                item = item.firstChild;

                            if (!item.hasAttribute || !item.hasAttribute('ya-sort')) {
                                var search = findRepeat(item, upperhalf);

                                if (search != null)
                                    search.parentNode.insertBefore(root.placeholder, search.nextSibling);
                            }
                            else if (upperhalf)
                                item.parentNode.insertBefore(root.placeholder, item);
                            else
                                item.parentNode.insertBefore(root.placeholder, item.nextSibling);
                        }

                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    });

                    container.on('drop', function (e) {
                        e = e.originalEvent || e;
                        e.preventDefault();
                        e.stopPropagation();

                        var index = yaInstance.placeholderIndex(options);
                        var copy = JSON.parse(JSON.stringify(root.sourceItem));

                        if (e.ctrlKey && root.copy) {
                            yaInstance.removePlaceholder();
                            scope.$apply(function () {
                                if (!options.oncopy(copy, root.sourceArray, index, options.itemArray))
                                    options.itemArray.splice(index, 0, copy);
                            });
                        } else if (root.placeholder !== root.sourceNode.previousElementSibling &&
                           root.sourceNode.nextElementSibling !== root.placeholder) {
                            yaInstance.removePlaceholder();
                            scope.$apply(function () {
                                if (!options.onmove(copy, root.sourceArray, index, options.itemArray)) {
                                    options.itemArray.splice(index, 0, copy);
                                    root.sourceArray.splice(root.sourceArray.indexOf(root.sourceItem), 1);
                                }
                            });
                        } else {
                            yaInstance.removePlaceholder();
                        }
                    });
                }
            };
        }
    };
}])
//runs after ngrepeat for each repeated item, may not run at all if the ngrepeat array is empty
//attaches drag-drop events to the repeated item(s), ng-include runs at 400 priority so that needs to run first too
.directive('yaSort', ['$timeout', 'yaInstance', function ($timeout, yaInstance) {
    return {
        priority: 399,
        restrict: 'A',
        compile: function (element, attrs) {
            var root = yaInstance.get(0);
            return {
                post: function (scope, element, attrs) {
                    var options = yaInstance.get(element.parent().attr('ya-instance')), el = element[0];
                    if (options.disabled) return;

                    element.attr('draggable', 'true');

                    element.on('mousedown', function (e) {
                        root.mouseTarget = (e.originalEvent || e).target;
                    });

                    element.on('drop', function (e) {
                        element.removeClass(options.dropTargetItemClass);
                        e = e.originalEvent || e;
                        e.preventDefault();
                        e.stopPropagation();
                        var copy = JSON.parse(JSON.stringify(root.sourceItem));
                        if (e.shiftKey && options.replace) {
                            if (root.sourceItem != scope[options.item]) {
                                if (e.ctrlKey && root.copy) {
                                    scope.$apply(function () {
                                        if (!options.oncopy(copy, root.sourceArray, scope.$index, options.itemArray) &&
                                           !options.onreplace(copy, root.sourceArray, scope.$index, options.itemArray))
                                            options.itemArray[scope.$index] = copy;
                                    });
                                    yaInstance.clearDrop();
                                } else {
                                    scope.$apply(function () {
                                        if (!options.onreplace(copy, root.sourceArray, scope.$index, options.itemArray)) {
                                            options.itemArray[scope.$index] = copy;
                                            root.sourceArray.splice(root.sourceArray.indexOf(root.sourceItem), 1);
                                        }
                                    });
                                    yaInstance.clearDrop();
                                }
                            }
                        } else {
                            var item = scope[options.item];
                            var index = yaInstance.placeholderIndex(options);
                            if (e.ctrlKey && root.copy) {
                                yaInstance.removePlaceholder();
                                scope.$apply(function () {
                                    if (!options.oncopy(copy, root.sourceArray, index, options.itemArray))
                                        options.itemArray.splice(index, 0, copy);
                                });
                                yaInstance.clearDrop();
                            } else if (root.sourceNode.nextElementSibling === root.placeholder ||
                               root.sourceNode.previousElementSibling === root.placeholder ||
                               root.item === item) {
                                yaInstance.removePlaceholder();
                                yaInstance.clearDrop();
                            } else {
                                yaInstance.removePlaceholder();
                                scope.$apply(function () {
                                    if (!options.onmove(copy, root.sourceArray, index, options.itemArray))
                                        options.itemArray.splice(index, 0, copy);
                                    root.sourceArray.splice(root.sourceArray.indexOf(root.sourceItem), 1);
                                });
                                yaInstance.clearDrop();
                            }
                        }
                    });

                    element.on('dragstart', function (e) {
                        e = e.originalEvent || e;

                        if (options.dragHandleClass) {
                            var handle = false;
                            while (!(handle = root.mouseTarget.classList.contains(options.dragHandleClass)) && root.mouseTarget != el)
                                root.mouseTarget = root.mouseTarget.parentElement;

                            root.mouseTarget = null;
                            if (!handle) {
                                e.preventDefault();
                                return;
                            }
                        }

                        if (!options.candrag(root.sourceItem, el.parentNode))
                            e.preventDefault();
                        else {
                            e.dataTransfer.effectAllowed = 'all';
                            root.sourceNode = el;
                            root.copy = options.copy;
                            root.sourceItem = scope.$eval(options.item, scope);
                            root.sourceArray = options.itemArray;

                            element.addClass(options.dragItemClass);
                            $timeout(function () {
                                element.removeClass(options.dragItemClass);
                                element.addClass(options.dragSourceItemClass);
                            }, 0);
                        }

                        e.stopPropagation();
                    });

                    element.on('dragover', function (e) {
                        if (!root.sourceItem) return;
                        e = e.originalEvent || e;

                        if (options.dropTargetItemClass && options.candrop(root.sourceItem, root.sourceArray, options.itemArray)) {
                            if (options.replace && e.shiftKey && el !== root.sourceNode) {
                                el.classList.add(options.dropTargetItemClass);
                                el.classList.add('yahover');
                            }
                            else
                                el.classList.remove('yahover');
                        }
                    });

                    element.on('dragend', function (e) {
                        e = e.originalEvent || e;
                        e.preventDefault();
                        element.removeClass(options.dragSourceItemClass);
                    });

                    element.on('dragenter', function (e) {
                        e = e.originalEvent || e;
                        e.preventDefault();
                    });

                    element.on('dragleave', function (e) {
                        e = e.originalEvent || e;

                        el.classList.remove('yahover');
                        $timeout(function () {
                            if (!el.classList.contains('yahover'))
                                el.classList.remove(options.dropTargetItemClass);
                        }, 100);
                    });
                }
            };
        }
    };
}]);