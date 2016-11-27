'use strict';

var yasortinstances = [{}];
angular.module('yaHTML5Sort', [])
.service('yaInstance', function () {
    var yasortroot = yasortinstances[0];
    return {
        get: function (index) {
            return yasortinstances[index];
        },
        init: function (scope, attrs) {
            var options = {},
                op = scope[attrs.yaSort] || {},
                match = attrs.ngRepeat.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+\|\s+([\s\S]+?))?(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

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
        removePlaceholder: function (container) {
            if (yasortroot.placeholder && yasortroot.placeholder.parentNode &&
               (!container || yasortroot.placeholder.parentElement === container))
                yasortroot.placeholder.parentNode.removeChild(yasortroot.placeholder);
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
                if(classes.length != newclasses.length)
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
        }
    };
})
//has to run before ng-repeat (priority 1000) so ngRepeat directive can be sniffed and yaSort initialized before ngRepeat has a chance to remove this dom node
//the ya-sort options are initialized for this instance and drag-drop events attached to the node containing (parent Element) the yaSort directive
.directive('yaSort', ['$timeout', 'yaInstance', '$rootScope', function ($timeout, inst, rootscope) {
    return {
        priority: 1001,
        link: function (scope, element, attrs) {
            var container = element.parent(),
                _container = container[0],
                options = inst.init(scope, attrs),
                yasortroot = yasortinstances[0];

            element.parent().attr('ya-instance', attrs.yaSort);
            if (options.disabled) return;

            _container.ondragenter = function (e) { e.preventDefault(); };
            _container.ondragstart = function (e) { e.preventDefault(); };
            _container.ondragleave = function (e) {
                if(_container.hasAttribute('yadragtarget'))
                    _container.removeAttribute('yadragtarget');

                $timeout(function () {
                    if (!_container.hasAttribute('yadragtarget'))
                        inst.removePlaceholder(_container);
                }, 40);
            };

            function findRepeat(item, upperhalf) {
                var search = item;

                if (search.nodeType === 8 && search.data.indexOf('ngRepeat:') > 0)
                    return search;

                //try up first if in upper half
                if (upperhalf)
                    while ((search = search.previousSibling) && (search.nodeType !==8 || search.data.indexOf('ngRepeat:') === -1));

                //then search down
                if (!upperhalf || search === null) {
                    search = item;
                    while ((search = search.nextSibling) && (search.nodeType !==8 || search.data.indexOf('ngRepeat:') === -1));
                }

                //try up again if not already tried
                if (!upperhalf && search === null) {
                    search = item;
                    while ((search = search.previousSibling) && (search.nodeType !==8 || search.data.indexOf('ngRepeat:') === -1));
                }

                return search;
            }

            _container.ondragover = function (e) {
                if (!yasortroot.sourceItem) return;

                if (!_container.hasAttribute('yadragtarget'))
                    _container.setAttribute('yadragtarget','');

                var item = event.target;
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
                    inst.removePlaceholder(_container);
                else if (item !== yasortroot.placeholder) {
                    var upperhalf = e.offsetY < item.offsetHeight / 2;
                    if (iscontainer && empty)
                        item = item.firstChild;

                    if (!item.hasAttribute || !item.hasAttribute('ya-sort'))
                        if ((item = findRepeat(item, upperhalf)) != null)
                            upperhalf = false;

                    if (item != null)
                        _container.insertBefore(yasortroot.placeholder, upperhalf ? item : item.nextSibling);
                }

                e.preventDefault();
                e.stopPropagation();
                return false;
            };

            _container.ondrop = function (e) {
                e = e.originalEvent || e;
                e.preventDefault();
                e.stopPropagation();

                var index = inst.placeholderIndex(options);
                var copy = JSON.parse(JSON.stringify(yasortroot.sourceItem));

                if (e.ctrlKey && yasortroot.copy) {
                    inst.removePlaceholder();
                    if (!options.oncopy(copy, yasortroot.sourceArray, index, options.itemArray))
                        options.itemArray.splice(index, 0, copy);
                   
                    inst.apply(rootscope);
                } else if (yasortroot.placeholder !== yasortroot.sourceNode.previousElementSibling &&
                    yasortroot.sourceNode.nextElementSibling !== yasortroot.placeholder) {
                    inst.removePlaceholder();
                    if (!options.onmove(copy, yasortroot.sourceArray, index, options.itemArray)) {
                        options.itemArray.splice(index, 0, copy);
                        yasortroot.sourceArray.splice(yasortroot.sourceArray.indexOf(yasortroot.sourceItem), 1);
                    }
                    inst.apply(rootscope);
                } else
                    inst.removePlaceholder();
            };
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
            _element.onmousedown = function (e) { yasortroot.mouseTarget = e.target; };
            _element.dragenter = function (e) { e.preventDefault(); };

            _element.ondrop = function (e) {
                inst.removeClass(_element, options.dropTargetItemClass);
                e.preventDefault();
                e.stopPropagation();

                var copy = JSON.parse(JSON.stringify(yasortroot.sourceItem));
                if (e.shiftKey && options.replace) {
                    if (yasortroot.sourceItem != scope[options.item]) {
                        if (e.ctrlKey && yasortroot.copy) {
                            if (!options.oncopy(copy, yasortroot.sourceArray, scope.$index, options.itemArray) &&
                                !options.onreplace(copy, yasortroot.sourceArray, scope.$index, options.itemArray))
                                options.itemArray[scope.$index] = copy;
                            
                            inst.apply(rootscope);
                        } else {
                            if (!options.onreplace(copy, yasortroot.sourceArray, scope.$index, options.itemArray)) {
                                options.itemArray[scope.$index] = copy;
                                yasortroot.sourceArray.splice(yasortroot.sourceArray.indexOf(yasortroot.sourceItem), 1);
                            }
                            
                            inst.apply(rootscope);
                        }
                    }
                } else {
                    var item = scope[options.item];
                    var index = inst.placeholderIndex(options);
                    if (e.ctrlKey && yasortroot.copy) {
                        inst.removePlaceholder();
                        if (!options.oncopy(copy, yasortroot.sourceArray, index, options.itemArray))
                            options.itemArray.splice(index, 0, copy);

                        inst.apply(rootscope);
                    } else if (yasortroot.sourceNode.nextElementSibling === yasortroot.placeholder ||
                        yasortroot.sourceNode.previousElementSibling === yasortroot.placeholder ||
                        yasortroot.item === item) {
                        inst.removePlaceholder();
                    } else {
                        inst.removePlaceholder();
                        if (!options.onmove(copy, yasortroot.sourceArray, index, options.itemArray))
                            options.itemArray.splice(index, 0, copy);
                        yasortroot.sourceArray.splice(yasortroot.sourceArray.indexOf(yasortroot.sourceItem), 1);
                        inst.apply(rootscope);
                    }
                }
            };

            _element.ondragstart = function (e) {
                if (options.dragHandleClass) {
                    var handle = false;
                    while (!(handle = inst.hasClass(yasortroot.mouseTarget, options.dragHandleClass)) && yasortroot.mouseTarget != _element)
                        yasortroot.mouseTarget = yasortroot.mouseTarget.parentElement;

                    yasortroot.mouseTarget = null;
                    if (!handle) {
                        e.preventDefault();
                        return;
                    }
                }

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
            };

            _element.ondragover = function (e) {
                if (yasortroot.sourceItem && options.dropTargetItemClass && options.candrop(yasortroot.sourceItem, yasortroot.sourceArray, options.itemArray)) {
                    if (options.replace && e.shiftKey && _element !== yasortroot.sourceNode) {
                        inst.addClass(_element, options.dropTargetItemClass);
                        if (!_element.hasAttribute('yahover'))
                            _element.addAttribute('yahover', '');
                    }
                    else if (_element.hasAttribute('yahover'))
                        _element.removeAttribute('yahover');
                }
            };

            _element.ondragend = function (e) {
                e.preventDefault();
                inst.removeClass(_element, options.dragSourceItemClass);
            };

            _element.ondragleave = function (e) {
                if (_element.hasAttribute('yahover')) _element.removeAttribute('yahover');
                $timeout(function () {
                    if (!_element.hasAttribute('yahover'))
                        inst.removeClass(_element, options.dropTargetItemClass);
                }, 40);
            };
        }
    };
}]);