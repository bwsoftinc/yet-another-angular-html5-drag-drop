'use strict';

if (typeof yaloadonce_cada367e228644d8b17a7162c125d8e2 !== 'undefined')
    throw "Reference yaHTML5Sort.js only once."

var yaloadonce_cada367e228644d8b17a7162c125d8e2 = true;
(function () {
    var root = {}, instances = [];

    function addClass(node, name) {
        angular.element(node).addClass(name);
    }

    function removeClass(node, name) {
        return angular.element(node).removeClass(name);
    }

    function hasClass(node, name) {
        return angular.element(node).hasClass(name);
    }

    function apply(scope) {
        scope.$apply();
        if (scope !== root.rootscope)
            root.rootscope.$apply();
    }

    function nextElementSibling(item) {
        var i = item;
        if (i.nextElementSibling) return i.nextElementSibling;
        while (i = i.nextSibling)
            if (i.nodeType === 1) return i;
        return null;
    }

    function previousElementSibling(item) {
        var i = item;
        if (i.previousElementSibling) return i.previousElementSibling;
        while (i = i.previousSibling)
            if (i.nodeType === 1) return i;
        return null;
    }

    function removePlaceholder() {
        if (root.placeholder && root.placeholder.parentNode)
            root.placeholder.parentNode.removeChild(root.placeholder);
    }

    function isPlaceholderNeighbor() {
        return root.placeholder === root.sourceNode.previousElementSibling
            || root.placeholder === root.sourceNode.nextElementSibling;
    }

    function placeholderIndex() {
        return Array.prototype.indexOf.call(root.placeholder.parentNode.children, root.placeholder);
    }

    function findRepeat(item, upperhalf) {
        var search = item;

        if (search.nodeType === 8 && search.data.indexOf('ngRepeat:') > 0)
            return search;

        //try up first if in upper half
        if (upperhalf)
            while ((search = search.previousSibling) && (search.nodeType !== 8 || search.data.indexOf('ngRepeat:') === -1));

        //then search down
        if (!upperhalf || search === null) {
            search = item;
            while ((search = search.nextSibling) && (search.nodeType !== 8 || search.data.indexOf('ngRepeat:') === -1));
        }

        //try up again if not already tried
        if (!upperhalf && search === null) {
            search = item;
            while ((search = search.previousSibling) && (search.nodeType !== 8 || search.data.indexOf('ngRepeat:') === -1));
        }

        return search;
    }

    function init(scope, attrs) {
        var instance = {},
            options = scope[attrs.yaSort] || {},
            match = attrs.ngRepeat.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+\|\s+([\s\S]+?))?(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

        instance.entercount = 0;
        instance.item = match[1];
        instance.items = match[2];
        instance.copy = options.oncopy !== undefined;
        instance.replace = options.onreplace !== undefined;
        instance.candrag = options.candrag || function () { return true; };
        instance.onmove = options.onmove || function () { return false; };
        instance.oncopy = options.oncopy || function () { return false; };
        instance.onreplace = options.onreplace || function () { return false; };
        instance.candrop = options.candrop || function () { return true; };
        instance.dragHandleClass = options.dragHandleClass || null;
        instance.dragSourceItemClass = options.dragSourceItemClass || null;
        instance.dropTargetItemClass = options.dropTargetItemClass || null;
        instance.dragItemClass = options.dragItemClass || null;
        instance.dropPlaceholderClass = options.dropPlaceholderClass || null;
        instance.itemArray = scope.$eval(match[2], scope) || scope.$eval(match[2] + '=[]', scope);
        instance.disabled = options.disabled || false;
        attrs.yaSort = instances.push(instance) - 1;
        return instance;
    }

    //has to run before ng-repeat (priority 1000) so ngRepeat directive can be sniffed and yaSort initialized before ngRepeat has a chance to remove this dom node
    //the ya-sort instance is initialized and drag-drop events attached to the node containing (parent element to) the yaSort directive
    angular.module('yaHTML5Sort', [])
        .directive('yaSort', ['$rootScope', function (rootscope) {
        return {
            priority: 1001,
            restrict: 'A',
            link: function (scope, element, attrs) {
                var container = element[0].parentNode, instance = init(scope, attrs);

                container.setAttribute('ya-instance', attrs.yaSort);
                if (instance.disabled) return;

                container.addEventListener('dragenter', function (e) {
                    e.preventDefault();
                    if (!root.sourceItem) return;
                    instance.entercount++;
                }, false);

                container.addEventListener('dragleave', function (e) {
                    if (!root.sourceItem) return;
                    if (--instance.entercount === 0)
                        removePlaceholder();
                }, false);

                container.addEventListener('dragover', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!root.sourceItem) return;

                    var item = e.target,
                        iscontainer = item === container,
                        empty = instance.itemArray.length === 0,
                        containerhasitems = iscontainer && !empty,
                        notcompatible = !instance.candrop(root.sourceItem, root.sourceArray, instance.itemArray);

                    var layer = 0;
                    if (!iscontainer)
                        while (item.parentElement !== container) {
                            item = item.parentElement;
                            layer++;
                        }

                    if (notcompatible || containerhasitems || (instance.replace && e.shiftKey && item === root.sourceNode))
                        e.dataTransfer.dropEffect = 'none';
                    else
                        e.dataTransfer.dropEffect = (e.ctrlKey && root.copy) ? 'copy' : 'move';

                    if ((e.shiftKey && instance.replace) || notcompatible || containerhasitems) {
                        removePlaceholder();
                        instance.entercount = layer + 1;
                    }
                    else if (item !== root.placeholder) {
                        var upperhalf = e.offsetY < item.offsetHeight / 2;
                        if (iscontainer && empty) item = item.firstChild;

                        var sortitem = (!item.hasAttribute) ? false : item.hasAttribute('ya-sort');
                        if (!sortitem && (item = findRepeat(item, upperhalf)) != null)
                            upperhalf = false;

                        if (item !== null) {
                            var notprevious = previousElementSibling(item) !== root.placeholder;
                            var notnext = nextElementSibling(item) !== root.placeholder;

                            if (sortitem || (notnext && notprevious)) {
                                if (upperhalf) {
                                    if (notprevious)
                                        container.insertBefore(root.placeholder, item);
                                }
                                else if (notnext)
                                    container.insertBefore(root.placeholder, item.nextSibling);
                            }
                        }
                    }
                }, false);

                container.addEventListener('drop', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!root.sourceItem) return;
                    instance.entercount = 0;

                    if (!root.placeholder.parentNode) return;
                    var index = placeholderIndex();

                    if (e.ctrlKey && root.copy) {
                        var copy = JSON.parse(JSON.stringify(root.sourceItem));
                        if (!instance.oncopy(copy, root.sourceArray, index, instance.itemArray))
                            instance.itemArray.splice(index, 0, copy);
                        apply(rootscope);
                    } else if (!isPlaceholderNeighbor()) {
                        if (!instance.onmove(root.sourceItem, root.sourceArray, index, instance.itemArray)) {
                            instance.itemArray.splice(index, 0, JSON.parse(JSON.stringify(root.sourceItem)));
                            root.sourceArray.splice(root.sourceArray.indexOf(root.sourceItem), 1);
                        }
                        apply(rootscope);
                    }
                }, false);
            }
        };
    }])
    //runs after ngrepeat for each repeated item, may not run at all if the ngrepeat array is empty
    //attaches drag-drop events to the repeated item(s), ng-include runs at 400 priority so that needs to run first too
    .directive('yaSort', ['$rootScope', '$timeout', function (rootscope, $timeout) {
        return {
            priority: 399,
            restrict: 'A',
            link: function (scope, element, attrs) {
                var _element = element[0], hovercount = 0,
                    instance = instances[_element.parentElement.getAttribute('ya-instance')];

                if (instance.disabled) return;

                _element.setAttribute('draggable', 'true');

                _element.addEventListener('mousedown', function (e) {
                    root.mouseTarget = e.target;
                }, false);

                _element.addEventListener('dragenter', function (e) {
                    e.preventDefault();
                    if (!root.sourceItem) return;
                    hovercount++;
                }, false);

                _element.addEventListener('drop', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!root.sourceItem) return;
                    instance.entercount = hovercount = 0;

                    if (e.shiftKey && instance.replace) {
                        if (!instance.candrop(root.sourceItem, root.sourceArray, instance.itemArray))
                            return;

                        if (root.sourceItem != scope[instance.item]) {
                            if (e.ctrlKey && root.copy) {
                                var copy = JSON.parse(JSON.stringify(root.sourceItem));
                                if (!instance.oncopy(copy, root.sourceArray, scope.$index, instance.itemArray) &&
                                    !instance.onreplace(copy, root.sourceArray, scope.$index, instance.itemArray))
                                    instance.itemArray[scope.$index] = copy;
                            } else {
                                if (!instance.onreplace(root.sourceItem, root.sourceArray, scope.$index, instance.itemArray)) {
                                    instance.itemArray[scope.$index] = root.sourceItem;
                                    root.sourceArray.splice(root.sourceArray.indexOf(root.sourceItem), 1);
                                }
                            }
                            apply(rootscope);
                        }
                    } else if (root.placeholder.parentNode) {
                        var index = placeholderIndex();
                        if (e.ctrlKey && root.copy) {
                            removePlaceholder();
                            var copy = JSON.parse(JSON.stringify(root.sourceItem));
                            if (!instance.oncopy(copy, root.sourceArray, index, instance.itemArray))
                                instance.itemArray.splice(index, 0, copy);

                            apply(rootscope);
                        } else if (root.sourceNode.nextElementSibling === root.placeholder ||
                            root.sourceNode.previousElementSibling === root.placeholder) {
                            removePlaceholder();
                        } else {
                            removePlaceholder();
                            if (!instance.onmove(root.sourceItem, root.sourceArray, index, instance.itemArray)) {
                                instance.itemArray.splice(index, 0, JSON.parse(JSON.stringify(root.sourceItem)));
                                root.sourceArray.splice(root.sourceArray.indexOf(root.sourceItem), 1);
                            }
                            apply(rootscope);
                        }
                    }
                }, false);

                function findHandle(e) {
                    var handle = false;
                    while (!(handle = hasClass(root.mouseTarget, instance.dragHandleClass)) && root.mouseTarget != _element)
                        root.mouseTarget = root.mouseTarget.parentElement;

                    root.mouseTarget = null;
                    if (!handle) e.preventDefault();
                    return handle;
                }

                _element.addEventListener('dragstart', function (e) {
                    if (instance.dragHandleClass && !findHandle(e)) return;

                    if (!instance.candrag(root.sourceItem, _element.parentNode))
                        e.preventDefault();
                    else {
                        e.dataTransfer.effectAllowed = 'all';
                        e.dataTransfer.setData('Text', 'firefox');
                        root.sourceNode = _element;
                        root.copy = instance.copy;
                        root.sourceItem = scope.$eval(instance.item, scope);
                        root.sourceArray = instance.itemArray;
                        root.rootscope = rootscope;
                        root.placeholder = _element.cloneNode(false);
                        root.placeholder.removeAttribute('ya-sort');
                        addClass(root.placeholder, instance.dropPlaceholderClass);
                        addClass(root.placeholder, instance.dropTargetItemClass);
                        removeClass(root.placeholder, instance.dragSourceItemClass);

                        addClass(_element, instance.dragItemClass);
                        $timeout(function () {
                            removeClass(_element, instance.dragItemClass);
                            addClass(_element, instance.dragSourceItemClass);
                        }, 0);
                    }

                    e.stopPropagation();
                }, false);

                _element.addEventListener('dragover', function (e) {
                    if (root.sourceItem && instance.dropTargetItemClass && instance.candrop(root.sourceItem, root.sourceArray, instance.itemArray)) {
                        if (instance.replace && e.shiftKey && _element !== root.sourceNode)
                            addClass(_element, instance.dropTargetItemClass);
                        else 
                            removeClass(_element, instance.dropTargetItemClass);
                    }
                }, false);

                _element.addEventListener('dragend', function (e) {
                    e.preventDefault();
                    removePlaceholder();
                    instance.entercount = hovercount = 0;
                    removeClass(_element, instance.dragSourceItemClass);
                }, false);

                _element.addEventListener('dragleave', function (e) {
                    if (!root.sourceItem) return;
                    if (--hovercount === 0)
                        removeClass(_element, instance.dropTargetItemClass);
                }, false);
            }
        };
    }]);
})();
