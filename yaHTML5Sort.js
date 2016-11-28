'use strict';

var yasortinstances = [{}];
angular.module('yaHTML5Sort', [])
.service('yaInstance', function () {
    var yasortroot = yasortinstances[0];    
    return {
        get: function (index) {
            return yasortinstances[index];
        },
        init:  function (scope, attrs) {
            var options = {},
                op = scope[attrs.yaSort] || {},
                match = attrs.ngRepeat.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+\|\s+([\s\S]+?))?(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

            options.entercount = 0;
            options.item = match[1];
            options.items = match[2];
            options.copy = op.oncopy !== undefined;
            options.replace = op.onreplace !== undefined;
            options.candrag = op.candrag || function () { return true; };
            options.onmove = op.onmove || function () { return false; };
            options.oncopy = op.oncopy || function () { return false; };
            options.onreplace = op.onreplace || function () { return false; };
            options.candrop = op.candrop || function () { return true; };
            options.dragHandleClass = op.dragHandleClass || null;
            options.dragSourceItemClass = op.dragSourceItemClass || null;
            options.dropTargetItemClass = op.dropTargetItemClass || null;
            options.dragItemClass = op.dragItemClass || null;
            options.dropPlaceholderClass = op.dropPlaceholderClass || null;
            options.itemArray = scope.$eval(match[2], scope) || scope.$eval(match[2] + '=[]', scope);
            options.disabled = op.disabled || false;
            attrs.yaSort = yasortinstances.push(options) - 1;
            return options;
        },
        placeholderIndex: function (options) {
            return Array.prototype.indexOf.call(yasortroot.placeholder.parentNode.children, yasortroot.placeholder);
        },
        addClass: function (node, name) {
            if (name && (name = name.trim())) {
                var classes = (node.getAttribute('class') || '').replace(/[\n\t]/g, ' ').trim();
                if ((' ' + classes + ' ').indexOf(' ' + name + ' ') === -1)
                    node.setAttribute('class', classes + ' ' + name);
            }
        },
        removeClass: function (node, name) {
            if (name && (name = name.trim())) {
                var classes = ' ' + (node.getAttribute('class') || '').replace(/[\n\t]/g, ' ').trim() + ' ';
                var newclasses = classes.replace(' ' + name + ' ', ' ');
                if (classes.length != newclasses.length)
                    node.setAttribute('class', newclasses.trim());
            }
        },
        hasClass: function (node, name) {
            if (name && (name = name.trim())) {
                var classes = (node.getAttribute('class') || '').replace(/[\n\t]/g, ' ').trim();
                return (' ' + classes + ' ').indexOf(' ' + name + ' ') !== -1;
            }
            return false;
        },
        apply: function (scope) {
            scope.$apply();
            if (scope !== yasortroot.rootscope)
                yasortroot.rootscope.$apply();
        },
        nextElementSibling: function (item) {
            var i = item;
            if (i.nextElementSibling) return i.nextElementSibling;
            while (i = i.nextSibling)
                if (i.nodeType === 1) return i;
            return null;
        },
        previousElementSibling: function (item) {
            var i = item;
            if (i.previousElementSibling) return i.previousElementSibling;
            while (i = i.previousSibling)
                if (i.nodeType === 1) return i;
            return null;
        },
        removePlaceholder: function(preservecount) {
            if (yasortroot.placeholder && yasortroot.placeholder.parentNode) {
                yasortroot.placeholder.parentNode.removeChild(yasortroot.placeholder);
                if (!preservecount) for (var i = 1; i < yasortinstances.length; i++)
                    yasortinstances[i].entercount = 0;
            }
        }
    };
})
//has to run before ng-repeat (priority 1000) so ngRepeat directive can be sniffed and yaSort initialized before ngRepeat has a chance to remove this dom node
//the ya-sort options are initialized for this instance and drag-drop events attached to the node containing (parent Element) the yaSort directive
.directive('yaSort', ['$rootScope', 'yaInstance', function (rootscope, inst) {
    return {
        priority: 1001,
        link: function (scope, element, attrs) {
            var container = element.parent(),
                _container = container[0],
                options = inst.init(scope, attrs),
                yasortroot = yasortinstances[0];

            element.parent().attr('ya-instance', attrs.yaSort);
            if (options.disabled) return;

            _container.addEventListener('dragstart', function (e) { e.preventDefault(); e.stopPropagation(); }, false);
            _container.addEventListener('dragend', function (e) { inst.removePlaceholder(); }, false);
            _container.addEventListener('dragenter', function (e) {
                e.preventDefault(); //e.stopPropagation();
                options.entercount++;
                //console.log(attrs.yaSort + ':enter:' + options.entercount);
                //console.log(e.target)
            }, false);
            _container.addEventListener('dragleave', function (e) {
                //e.preventDefault(); e.stopPropagation();
                options.entercount--;
                //console.log(attrs.yaSort + ':leave:' + options.entercount);
                //console.log(e.target)
                if (options.entercount === 0)
                    inst.removePlaceholder();
            }, false);

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

            _container.addEventListener('dragover', function (e) {
                var item = e.target;
                var iscontainer = item === _container;
                if (!iscontainer)
                    while (item.parentElement !== _container)
                        item = item.parentElement;

                var empty = options.itemArray.length === 0;
                var containerhasitems = iscontainer && !empty;
                var notcompatible = !options.candrop(yasortroot.sourceItem, yasortroot.sourceArray, options.itemArray);

                if (notcompatible || containerhasitems || (options.replace && e.shiftKey && item === yasortroot.sourceNode))
                    e.dataTransfer.dropEffect = 'none';
                else
                    e.dataTransfer.dropEffect = (e.ctrlKey && yasortroot.copy) ? 'copy' : 'move';

                if ((e.shiftKey && options.replace) || notcompatible || containerhasitems)
                    inst.removePlaceholder(true);
                else if (item !== yasortroot.placeholder) {
                    var upperhalf = e.offsetY < item.offsetHeight / 2;
                    if (iscontainer && empty) item = item.firstElementChild;

                    var sortitem = item.hasAttribute('ya-sort');
                    if (!item.hasAttribute || !sortitem)
                        if ((item = findRepeat(item, upperhalf)) != null)
                            upperhalf = false;

                    if (item !== null) {
                        var notprevious = inst.previousElementSibling(item) !== yasortroot.placeholder;
                        var notnext = inst.nextElementSibling(item) !== yasortroot.placeholder;

                        if (sortitem || (notnext && notprevious)) {
                            if (upperhalf) {
                                if (notprevious)
                                    _container.insertBefore(yasortroot.placeholder, item);
                            }
                            else if (notnext)
                                _container.insertBefore(yasortroot.placeholder, item.nextSibling);
                        }
                    }
                }

                e.preventDefault();
                e.stopPropagation();
                return false;
            }, false);

            _container.addEventListener('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (!yasortroot.placeholder.parentNode) return;
                var index = inst.placeholderIndex(options);

                if (e.ctrlKey && yasortroot.copy) {
                    inst.removePlaceholder();
                    var copy = JSON.parse(JSON.stringify(yasortroot.sourceItem));
                    if (!options.oncopy(copy, yasortroot.sourceArray, index, options.itemArray))
                        options.itemArray.splice(index, 0, copy);

                    inst.apply(rootscope);
                } else if (yasortroot.placeholder !== yasortroot.sourceNode.previousElementSibling &&
                    yasortroot.sourceNode.nextElementSibling !== yasortroot.placeholder) {
                    inst.removePlaceholder();
                    if (!options.onmove(yasortroot.sourceItem, yasortroot.sourceArray, index, options.itemArray)) {
                        options.itemArray.splice(index, 0, JSON.parse(JSON.stringify(yasortroot.sourceItem)));
                        yasortroot.sourceArray.splice(yasortroot.sourceArray.indexOf(yasortroot.sourceItem), 1);
                    }
                    inst.apply(rootscope);
                } else
                    inst.removePlaceholder();
            }, false);
        }
    };
}])
//runs after ngrepeat for each repeated item, may not run at all if the ngrepeat array is empty
//attaches drag-drop events to the repeated item(s), ng-include runs at 400 priority so that needs to run first too
.directive('yaSort', ['$timeout', 'yaInstance', '$rootScope', function ($timeout, inst, rootscope) {
    return {
        priority: 399,
        restrict: 'A',
        link: function (scope, element, attrs) {
            var options = inst.get(element.parent().attr('ya-instance')), _element = element[0], yasortroot = yasortinstances[0];
            if (options.disabled) return;

            _element.setAttribute('draggable', 'true');
            _element.addEventListener('mousedown', function (e) { yasortroot.mouseTarget = e.target; }, false);
            _element.addEventListener('dragenter', function (e) { e.preventDefault(); }, false);

            _element.addEventListener('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (e.shiftKey && options.replace) {
                    if (!options.candrop(yasortroot.sourceItem, yasortroot.sourceArray, options.itemArray))
                        return;

                    if (yasortroot.sourceItem != scope[options.item]) {
                        if (e.ctrlKey && yasortroot.copy) {
                            var copy = JSON.parse(JSON.stringify(yasortroot.sourceItem));
                            if (!options.oncopy(copy, yasortroot.sourceArray, scope.$index, options.itemArray) &&
                                !options.onreplace(copy, yasortroot.sourceArray, scope.$index, options.itemArray))
                                options.itemArray[scope.$index] = copy;

                            inst.apply(rootscope);
                        } else {
                            if (!options.onreplace(yasortroot.sourceItem, yasortroot.sourceArray, scope.$index, options.itemArray)) {
                                var sourceitem = yasortroot.sourceItem;
                                options.itemArray[scope.$index] = sourceitem;
                                yasortroot.sourceArray.splice(yasortroot.sourceArray.indexOf(yasortroot.sourceItem), 1);
                            }
                            inst.apply(rootscope);
                        }
                    }
                } else if (yasortroot.placeholder.parentNode) {
                    var item = scope[options.item];
                    var index = inst.placeholderIndex(options);
                    if (e.ctrlKey && yasortroot.copy) {
                        inst.removePlaceholder();
                        var copy = JSON.parse(JSON.stringify(yasortroot.sourceItem));
                        if (!options.oncopy(copy, yasortroot.sourceArray, index, options.itemArray))
                            options.itemArray.splice(index, 0, copy);

                        inst.apply(rootscope);
                    } else if (yasortroot.sourceNode.nextElementSibling === yasortroot.placeholder ||
                        yasortroot.sourceNode.previousElementSibling === yasortroot.placeholder ||
                        yasortroot.item === item) {
                        inst.removePlaceholder();
                    } else {
                        inst.removePlaceholder();
                        if (!options.onmove(yasortroot.sourceItem, yasortroot.sourceArray, index, options.itemArray)) {
                            options.itemArray.splice(index, 0, JSON.parse(JSON.stringify(yasortroot.sourceItem)));
                            yasortroot.sourceArray.splice(yasortroot.sourceArray.indexOf(yasortroot.sourceItem), 1);
                        }
                        inst.apply(rootscope);
                    }
                }
            }, false);

            function findHandle(e) {
                var handle = false;
                while (!(handle = inst.hasClass(yasortroot.mouseTarget, options.dragHandleClass)) && yasortroot.mouseTarget != _element)
                    yasortroot.mouseTarget = yasortroot.mouseTarget.parentElement;

                yasortroot.mouseTarget = null;
                if (!handle)
                    e.preventDefault();
                
                return handle;
            }

            _element.addEventListener('dragstart', function (e) {
                if (options.dragHandleClass && !findHandle(e)) return;

                if (!options.candrag(yasortroot.sourceItem, _element.parentNode))
                    e.preventDefault();
                else {
                    e.dataTransfer.effectAllowed = 'all';
                    yasortroot.sourceNode = _element;
                    yasortroot.copy = options.copy;
                    yasortroot.sourceItem = scope.$eval(options.item, scope);
                    yasortroot.sourceArray = options.itemArray;
                    yasortroot.rootscope = rootscope;
                    yasortroot.placeholder = _element.cloneNode(false);
                    yasortroot.placeholder.removeAttribute('ya-sort');
                    inst.addClass(yasortroot.placeholder, options.dropPlaceholderClass);
                    inst.addClass(yasortroot.placeholder, options.dropTargetItemClass);
                    inst.removeClass(yasortroot.placeholder, options.dragSourceItemClass);

                    inst.addClass(_element, options.dragItemClass);
                    $timeout(function () {
                        inst.removeClass(_element, options.dragItemClass);
                        inst.addClass(_element, options.dragSourceItemClass);
                    }, 0);
                }

                e.stopPropagation();
            }, false);

            _element.addEventListener('dragover', function (e) {
                if (yasortroot.sourceItem && options.dropTargetItemClass && options.candrop(yasortroot.sourceItem, yasortroot.sourceArray, options.itemArray)) {
                    if (options.replace && e.shiftKey && _element !== yasortroot.sourceNode) {
                        inst.addClass(_element, options.dropTargetItemClass);
                        if (!_element.hasAttribute('yahover'))
                            _element.setAttribute('yahover', '');
                    }
                    else if (_element.hasAttribute('yahover'))
                        _element.removeAttribute('yahover');
                }
            }, false);

            _element.addEventListener('dragend', function (e) {
                e.preventDefault();
                inst.removePlaceholder();
                inst.removeClass(_element, options.dragSourceItemClass);
            }, false);

            _element.addEventListener('dragleave', function (e) {
                if (_element.hasAttribute('yahover')) _element.removeAttribute('yahover');
                $timeout(function () {
                    if (!_element.hasAttribute('yahover'))
                        inst.removeClass(_element, options.dropTargetItemClass);
                }, 40);
            }, false);
        }
    };
}]);