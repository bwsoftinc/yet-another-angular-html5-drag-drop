console.clear()
angular.module('yaHTML5Sort', [])
.service('yaInstance', function() {
  var instance = {};
  return {
    get: function() { 
      return instance; 
    },
    clearDrop: function() {      
      instance.sourceNode = null;
      instance.sourceItem = null;
      instance.sourceArray = null;
    },
    removePlaceholder: function(options) {
      if(options.placeholder && options.placeholder.parentNode) {
        options.placeholder.parentNode.removeChild(options.placeholder);
        options.placeholder = null;
      }      
    },
    placeholderIndex: function(options) {
      return Array.prototype.indexOf.call(options.placeholder.parentNode.children, options.placeholder);
    }
  };  
})
.directive('yaSort', ['$timeout', 'yaInstance', function($timeout, yaInstance) {
  return {
    priority: 1001,
    compile: function() {
      var root = yaInstance.get();
      return {
    post: function(scope, element, attrs) {
      var match = attrs.ngRepeat.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);
      var filter = match[2].indexOf('|');
      if(filter > 0) match[2] = match[2].substring(0, filter).trim();
      
      var container = element.parent();
      var cont = container[0];
      var op = scope[attrs.yaSort];
      var options = scope.$yaSort = { 
        item: match[1], 
        items: match[2], 
        placeholder: null,
        candrag: op.candrag || function() { return true; },
        onmove: op.onmove || function() { return false; },
        oncopy: op.oncopy || function() { return false; },
        onreplace: op.onreplace || function() { return false; },
        candrop: op.candrop || function() { return true; },
        dragHandleClass: op.dragHandleClass || null,
        dragSourceItemClass: op.dragSourceItemClass || null,
        dropHoverItemClass:  op.dropHoverItemClass || null,
        dragItemClass: op.dragItemClass || null,
        dropPlaceholderClass: op.dropPlaceholderClass || null,
        itemArray: scope.$eval(match[2], scope) || scope.$eval(match[2]+'=[]', scope)
      };
      
      container.on('dragleave', function(e) {
        e = e.originalEvent || e;
        container.removeClass('yadragtarget')
        $timeout(function() { 
          if(!container.hasClass('yadragtarget')) 
            yaInstance.removePlaceholder(options);
        }, 60);
      });
      
      container.on('dragstart dragenter', function(e) {
        e = e.originalEvent || e;
        e.preventDefault();
      });
      
      container.on('dragover', function(e) {
        if(!root.sourceItem) return;
        e = e.originalEvent || e;
        container.addClass('yadragtarget');
        
        var item = event.target;
        if(item !== cont)
          while(item.parentElement !== cont)
            item = item.parentElement;
              
        var notcompatible = !options.candrop(root.sourceItem, root.sourceNode.parentElement, cont);
        if(notcompatible || item === cont || (e.shiftKey && item === root.sourceNode))
          e.dataTransfer.dropEffect = 'none';
        else
          e.dataTransfer.dropEffect = e.ctrlKey? 'copy' : 'move';
        
        if(e.shiftKey || notcompatible) {
          yaInstance.removePlaceholder(options);
        } else if(item !== options.placeholder && item !== cont) {
          if(!options.placeholder) {
            options.placeholder = root.sourceNode.cloneNode(false);
            options.placeholder.removeAttribute('ng-repeat');
            options.placeholder.classList.add(options.dropPlaceholderClass);
            options.placeholder.classList.add(options.dropHoverItemClass);
          }
                    
          if(!item.hasAttribute('ng-repeat')) {
            var doprev = false;
            while((item = item.previousSibling))
              if((doprev = (item.nodeType === 8 && item.data.indexOf('ngRepeat') > 0)))
                break;

            if(doprev)
              cont.insertBefore(options.placeholder, item.nextSibling);
            else
              cont.appendChild(options.placeholder);
          } 
          else if(e.offsetY < item.offsetHeight / 2)
            item.parentNode.insertBefore(options.placeholder, item);
          else 
            item.parentNode.insertBefore(options.placeholder, item.nextSibling);
        }
        
        e.preventDefault();  
        e.stopPropagation();
        return false;
      });
      
      container.on('drop', function(e) {
        e = e.originalEvent || e;
        e.preventDefault();
        e.stopPropagation();

        var index = yaInstance.placeholderIndex(options);
        var copy = JSON.parse(JSON.stringify(root.sourceItem));
        
        if(e.ctrlKey) {
          yaInstance.removePlaceholder(options);          
          scope.$apply(function() { 
            if(!options.oncopy(copy, root.sourceArray, index, options.itemArray))
              options.itemArray.splice(index, 0, copy); 
          });
        } else if(options.placeholder !== root.sourceNode.previousElementSibling &&
           root.sourceNode.nextElementSibling !== options.placeholder) {
          yaInstance.removePlaceholder(options);          
          scope.$apply(function() { 
            if(!options.onmove(copy, root.items, index, options.itemArray)) {
              options.itemArray.splice(index, 0, copy);              
              root.sourceArray.splice(root.sourceArray.indexOf(root.sourceItem), 1);
            }
          });
        } else {
          yaInstance.removePlaceholder(options);
        }
      });
    }
  };}
};}])
.directive('yaSort', ['$timeout', 'yaInstance', function($timeout, yaInstance) {
  return {
    priority: 999,
    restrict: 'A',
    compile: function(element, attrs) { 
      var root = yaInstance.get(0);
      return {
    post: function(scope, element, attrs) {
      var options = scope.$parent.$yaSort, el = element[0];
      element.attr('draggable', 'true');
    
      element.on('mousedown', function(e) {
        root.mouseTarget = (e.originalEvent || e).target;
      });
    
      element.on('drop', function(e) {
        element.removeClass(options.dropHoverItemClass);
        e = e.originalEvent || e;
        e.preventDefault();
        e.stopPropagation();
        var copy = JSON.parse(JSON.stringify(root.sourceItem));
        
        if(e.shiftKey) {
          if(root.sourceItem != scope[options.item]) {
            if(e.ctrlKey) {
              scope.$apply(function() { 
               if(!options.oncopy(copy, root.sourceArray, scope.$index, options.itemArray) &&
                  !options.onreplace(copy, root.sourceArray, scope.$index, options.itemArray))
                 options.itemArray[scope.$index] = copy; 
              });
              yaInstance.clearDrop();
            } else {
              scope.$apply(function() { 
                if(!options.onreplace(copy, root.sourceArray, scope.$index, options.itemArray)) {
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
          if(e.ctrlKey) {
            yaInstance.removePlaceholder(options);    
            scope.$apply(function() { 
              if(!options.oncopy(copy, root.sourceArray, index, options.itemArray) &&
                 !options.onmove(copy, root.sourceArray, index, options.itemArray))
                options.itemArray.splice(index, 0, copy); 
            });
            yaInstance.clearDrop();
          } else if(root.sourceNode.nextElementSibling === options.placeholder || 
             root.sourceNode.previousElementSibling === options.placeholder ||
             root.item === item) {
            yaInstance.removePlaceholder(options);
            yaInstance.clearDrop();
          } else {
            yaInstance.removePlaceholder(options);
            scope.$apply(function() { 
              if(!options.onmove(copy, root.sourceArray, index, options.itemArray))
                options.itemArray.splice(index, 0, copy); 
                root.sourceArray.splice(root.sourceArray.indexOf(root.sourceItem), 1);
            });
            yaInstance.clearDrop();
          }
        }
      });
      
      element.on('dragstart', function(e) {
        e = e.originalEvent || e;
        
        if(options.dragHandleClass) {
          var handle = false;          
          while(!(handle = root.mouseTarget.classList.contains(options.dragHandleClass)) && root.mouseTarget != el)
            root.mouseTarget = root.mouseTarget.parentElement;
          
          root.mouseTarget = null;
          if(!handle) {
            e.preventDefault();
            return;                
          }
        }
        
        if(!options.candrag(root.sourceItem, el.parentNode))
          e.preventDefault();
        else {
          e.dataTransfer.effectAllowed = 'all';
          root.sourceNode = el;
          root.sourceItem = scope.$eval(options.item, scope);
          root.sourceArray = options.itemArray;
        
          element.addClass(options.dragItemClass);
          $timeout(function() {
            element.removeClass(options.dragItemClass);
            element.addClass(options.dragSourceItemClass);
          }, 0);
        }
        
        e.stopPropagation();
      });
      
      element.on('dragover', function(e) {
        if(!root.sourctItem) return;
        e = e.originalEvent || e;
        var item = e.target;
        
        if(options.dropHoverItemClass && options.candrop(root.sourceItem, root.sourceNode.parentElement, el.parentElement)) {
          if(e.shiftKey && el !== root.sourceNode)
            element.addClass(options.dropHoverItemClass);
          else
            element.removeClass(options.dropHoverItemClass);
        }
      });
      
      element.on('dragend', function(e) {
        e = e.originalEvent || e;
        e.preventDefault();  
        element.removeClass(options.dragSourceItemClass);
      });
      
      element.on('dragenter', function(e) {
        e = e.originalEvent || e;
        e.preventDefault();
      });
      
      element.on('dragleave', function(e) {
        e = e.originalEvent || e;
        element.removeClass(options.dropHoverItemClass);
      });
     
    }};
  }};  
}]);

angular.module('demo', ['yaHTML5Sort'])
.filter('notfirst', function(){
  return function(arr) {
    var newarr = [];
    arr = arr || [];
    for(var i = 1; i < arr.length; i++)
      newarr.push(arr[i]);
    return newarr;
  };
})
.controller('DemoCtrl', ['$scope', function($scope) {
  
    $scope.sortoptions = {
      dragHandleClass: 'handle',
      dragSourceItemClass: 'drag',
      dropHoverItemClass: 'hover',
      dragItemClass: 'dragitem',
      dropPlaceholderClass: 'placeholder',
      candrag: function(sourceItem, sourceContainer) {
        return true;
      },
      candrop: function(sourceItem, sourceContainer, targetContainer) {
        if(sourceContainer === targetContainer)
          return true;
        
        var nodes = targetContainer.childNodes, comboDrop = false;         
        //according to our html, a combo sub item comes before ngrepeat in a combo container
        //vs other ngrepeat containers where the ngrepeat comes first
        for(var i=0;i<nodes.length;i++) {
          var type = nodes[i].nodeType;
          if((comboDrop = (type === 1)) || type === 8)
            break;
        }
        
        var subDrag = false;
        nodes = sourceContainer.childNodes
        for(var i=0;i<nodes.length;i++) {
          var type = nodes[i].nodeType;
          if((subDrag = (type === 1)) || type === 8)
            break;
        }
        
        return ((comboDrop && sourceItem.sub === undefined && !subDrag) ||
           (!comboDrop && !subDrag));        
      },
      oncopy: function(sourceItem, sourceArray, targetIndex, targetArray) {
        sourceItem.id = Math.random();
      },
      onmove: function(sourceItem, sourceArray, targetIndex, targetArray) {
        sourceItem.id = Math.random();
      },
      onreplace: function(sourceItem, sourceArray, targetIndex, targetArray) {
        sourceItem.id = Math.random();
      }
    };
  
    $scope.mealperiods =[];
    for(var m = 0; m < 3; m++) {      
      var stations = [];
      for(var s = 0; s < 3; s++) {      
        var days = [];
        for(var day = 1; day < 7; day++) {
          days[day] = [];
          for(var i = 0; i < 30; i++) {
            var rand = Math.trunc(Math.random() * 10);
            if(rand <= 2) {          
              var sub = [];
              for(var j = 0; j <= rand * 2; j++)
                sub[j] = {"id": Math.random(), "name": " sub "+j};
              days[day][i] = {"id": Math.random(), "name": " Combo "+day+"."+i, "sub": sub };
            }
            else
              days[day][i] = {"id": Math.random(), "name": " Item "+day+"."+i };  
          }
        }
        stations[s] = {"id": Math.random(), "name": "Station: " + s, "days": days };
      }  
      $scope.mealperiods[m] = {"id": Math.random(), "name": "Mealperiod: " + m, "stations": stations };
    }
  
  
  
    $scope.addItem = function(arr, idx) {
      arr.push({"id": Math.random(), "name": " Item " + idx+"."+arr.length});
    };
  
    $scope.makeCombo = function(item) {
      item.sub = [{'id': Math.random(), 'name': 'Sub 0'}]
      item.name = ' Combo' + item.name.substring(5);
    };
  
    $scope.removeItem = function(item, arr) {
      arr.splice(arr.indexOf(item), 1);
    };
  
}]);