angular.module('yaHTML5Sort', [])
.service('yaInstance', function () {
    var instances = [{}];
    return {
        get: function (index) {
            return instances[index];
        },
        init: function (scope, attrs) {
            var options = {},
                op = scope[attrs.yaSort]
                match = attrs.ngRepeat.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+\|\s+([\s\S]+?))?(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

            options.item =  match[1];
            options.items =  match[2];
            options.placeholder = null;
            options.copy = op.oncopy !== undefined;
            options.replace = op.onreplace !== undefined;
            options.candrag =  op.candrag || function () { return true; };
            options.onmove =  op.onmove || function () { return false; };
            options.oncopy =  op.oncopy || function () { return false; };
            options.onreplace =  op.onreplace || function () { return false; };
            options.candrop =  op.candrop || function () { return true; };
            options.dragHandleClass =  op.dragHandleClass || null;
            options.dragSourceItemClass =  op.dragSourceItemClass || null;
            options.dropHoverItemClass =  op.dropHoverItemClass || null;
            options.dragItemClass =  op.dragItemClass || null;
            options.dropPlaceholderClass =  op.dropPlaceholderClass || null;
            options.itemArray =  scope.$eval(match[2], scope) || scope.$eval(match[2] + '=[]', scope);
            options.disabled = op.disabled || false;
            attrs.yaSort = instances.push(options) - 1;
            return options;
        },
        clearDrop: function () {
            var instance = instances[0];
            instance.sourceNode = null;
            instance.sourceItem = null;
            instance.sourceArray = null;
            instance.copy = null;
        },
        removePlaceholder: function (options) {
            if (options.placeholder && options.placeholder.parentNode) {
                options.placeholder.parentNode.removeChild(options.placeholder);
                options.placeholder = null;
            }
        },
        placeholderIndex: function (options) {
            return Array.prototype.indexOf.call(options.placeholder.parentNode.children, options.placeholder);
        }
    };
})
//has to run before ng-repeat, so things can be sniffed and initialized before ngrepeat possibly removes them.
//the ya-sort options are initialized for this instance and drag-drop events attached to the node containing
//the ngrepeat declaration
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
                            if (!container.hasClass('yadragtarget'))
                                yaInstance.removePlaceholder(options);
                        }, 60);
                    });

                    container.on('dragstart dragenter', function (e) {
                        e = e.originalEvent || e;
                        e.preventDefault();
                    });

                    container.on('dragover', function (e) {
                        if (!root.sourceItem) return;
                        e = e.originalEvent || e;
                        container.addClass('yadragtarget');

                        var item = event.target;
                        if (item !== _container)
                            while (item.parentElement !== _container)
                                item = item.parentElement;

                        var notcompatible = !options.candrop(root.sourceItem, root.sourceArray, options.itemArray);
                        if (notcompatible || (item === _container && options.itemArray.length) || (options.replace && e.shiftKey && item === root.sourceNode))
                            e.dataTransfer.dropEffect = 'none';
                        else
                            e.dataTransfer.dropEffect = (e.ctrlKey && root.copy) ? 'copy' : 'move';

                        if ((e.shiftKey && options.replace) || notcompatible) {
                            yaInstance.removePlaceholder(options);
                        } else if (item !== options.placeholder && (item !== _container || !options.itemArray.length)) {
                            if (!options.placeholder) {
                                options.placeholder = root.sourceNode.cloneNode(false);
                                options.placeholder.removeAttribute('ng-repeat');
                                options.placeholder.classList.add(options.dropPlaceholderClass);
                                options.placeholder.classList.add(options.dropHoverItemClass);
                                options.placeholder.classList.remove(options.dragSourceItemClass);

                            }

                            if (!item.hasAttribute('ng-repeat')) {
                                var doprev = false;
                                while ((item = item.previousSibling))
                                    if ((doprev = (item.nodeType === 8 && item.data.indexOf('ngRepeat') > 0)))
                                        break;

                                if (doprev)
                                    _container.insertBefore(options.placeholder, item.nextSibling);
                                else
                                    _container.appendChild(options.placeholder);
                            }
                            else if (e.offsetY < item.offsetHeight / 2)
                                item.parentNode.insertBefore(options.placeholder, item);
                            else
                                item.parentNode.insertBefore(options.placeholder, item.nextSibling);
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
                            yaInstance.removePlaceholder(options);
                            scope.$apply(function () {
                                if (!options.oncopy(copy, root.sourceArray, index, options.itemArray))
                                    options.itemArray.splice(index, 0, copy);
                            });
                        } else if (options.placeholder !== root.sourceNode.previousElementSibling &&
                           root.sourceNode.nextElementSibling !== options.placeholder) {
                            yaInstance.removePlaceholder(options);
                            scope.$apply(function () {
                                if (!options.onmove(copy, root.sourceArray, index, options.itemArray)) {
                                    options.itemArray.splice(index, 0, copy);
                                    root.sourceArray.splice(root.sourceArray.indexOf(root.sourceItem), 1);
                                }
                            });
                        } else {
                            yaInstance.removePlaceholder(options);
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
                        element.removeClass(options.dropHoverItemClass);
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
                                yaInstance.removePlaceholder(options);
                                scope.$apply(function () {
                                    if (!options.oncopy(copy, root.sourceArray, index, options.itemArray) &&
                                       !options.onmove(copy, root.sourceArray, index, options.itemArray))
                                        options.itemArray.splice(index, 0, copy);
                                });
                                yaInstance.clearDrop();
                            } else if (root.sourceNode.nextElementSibling === options.placeholder ||
                               root.sourceNode.previousElementSibling === options.placeholder ||
                               root.item === item) {
                                yaInstance.removePlaceholder(options);
                                yaInstance.clearDrop();
                            } else {
                                yaInstance.removePlaceholder(options);
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

                        if (options.dropHoverItemClass && options.candrop(root.sourceItem, root.sourceArray, options.itemArray)) {
                            if (options.replace && e.shiftKey && el !== root.sourceNode)
                                element.addClass(options.dropHoverItemClass);
                            else
                                element.removeClass(options.dropHoverItemClass);
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
                        if(e.target === el)
                            element.removeClass(options.dropHoverItemClass);
                    });
                }
            };
        }
    };
}]);