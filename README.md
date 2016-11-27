#yet-another-angular-html5-drag-drop

[*See live demos*](#live-demos)  
Angular directive to enable drag and drop features on ng-repeat collections.  
Implemented using the HTML5 draggable api, javascript and angularJS.  
No dependency on jQuery.

##Features

* Move, Copy and Replace drag and drop actions.
* Simple to use and set up with a single directive.
* Default callbacks that update the dom and underlying angular model.
* User definable callbacks that work in tandem with or override default callbacks.
* Supports 
	* Various html elements
	* Static sibling html elements
	* Drag handles
	* Multiple collections
	* Shared or isolated scopes per collection
	* Nested collections
* Styling
	* Placeholder
	* Drop target
	* Drag source
	* Dragging element

##Live Demos

* [Simple List](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/simplelist.html)
* [Styled List](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/stylelist.html)
* [Mulitple Lists](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/multilist.html)
* [Nested Lists](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/nestedlist.html)
* [Advanced Demo](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/index.html)

##Using yaHTML5Sort module and ya-sort directive

To use drag drop features, download yaHTML5Sort.js and add `yaHTML5Sort` module as a dependency in your angular module.
```Javascript
 var module = angular.module('myModule', ['yaHTML5Sort']);
```

On the element containing the ng-repeat directive, add the `ya-sort` directive
```html
<div ng-repeat="item in items" ya-sort>
```

Supply options by adding a value to the `ya-sort` directive
```html
<div ng-repeat="item in items" ya-sort="myOptions">
```

##The options parameter

Declare one or more objects on the angular controller's scope.  
These options obects can be passed as the `ya-sort` directive's value.
```Javascript
module.controller('myController', function($scope){
	$scope.myOptions = {
		dragHandleClass = 'handle',
		//more options...
	};
});
```

###Define one or more of these property values, if not defined the default will be used

| Option Values        | Type	 | Default | Description
| ---------------------|---------|---------|--------------------------------------------------------|
| disabled             | boolean | false   | Whether `ya-sort` directive features are disabled      |
| dragHandleClass      | string  | null    | A class used to denote the items' drag handles         |
| dragSourceItemClass  | string  | null    | A class applied to the original item while dragging    |
| dragItemClass        | string  | null    | A class applied to the dragging item while dragging    |
| dropPlaceholderClass | string  | null    | A class applied to the drop placeholder while dragging |
| dropTargetItemClass  | string  | null    | A class appleid to the drop target while dragging      |

###Define one or more of these callback function prototypes

####candrag(item) triggered on ondragstart event

| Parameter    | Type    | Description                                            |
|--------------|---------|--------------------------------------------------------|
| item         | object  | The object model of the item attempting to be dragged  |
| return       | boolean | Whether dragging should commence for this item         |

Notes
* if not defined dragging will be allowed on any `ya-sort` item

####candrop(item, sourceArray, targetArray) triggered ondragover event

| Parameter    | Type    | Description                                            |
|--------------|---------|--------------------------------------------------------|
| item         | object  | The object model of the item attempting to be dragged  |
| sourceArray  | array   | The array model that contains `item`                   |
| targetArray  | array   | The array model where `item` would be dropped          |
| return       | boolean | Whether the drop should be allowed here                |

Notes
* If not defined dropping will be allowed in any `ya-sort` instance 
	
####onmove(item, sourceArray, targetIndex, targetArray) triggered ondrop event

| Parameter    | Type    | Description                                            |
|--------------|---------|--------------------------------------------------------|
| item         | object  | A copy of the object model of the item being dropped   |
| sourceArray  | array   | The array model that contains the original `item`      |
| targetIndex  | int     | The index in `targetArray` where move is being made    |
| targetArray  | array   | The array model where `item` is being dropped          |
| return       | boolean | Whether default action was handled                     |

Notes
* `item` is a copy so changes can be made, webapi's called, id's updated, or item completely replaced with another without affecting the object model
* Default action is removing the orginal `item` from `sourceArray` and inserting to `targetArray` at `targetIndex`. If some other action is necessary or default action undesirable then return true signaling the default action was handled in user code.

####oncopy(item, sourceArray, targetIndex, targetArray) triggered ondrop event

| Parameter    | Type    | Description                                            |
|--------------|---------|--------------------------------------------------------|
| item         | object  | A copy of the object model of the item being dropped   |
| sourceArray  | array   | The array model that contains the original `item`      |
| targetIndex  | int     | The index in `targetArray` where copy is being made    |
| targetArray  | array   | The array model where `item` is being dropped          |
| return       | boolean | Whether default action was handled                     |

Notes
* `item` is a copy so changes can be made, webapi's called, id's updated, or item completely replaced with another without affecting the object model
* Defining the `oncopy` function enables the copy (control+drag) feature
* Default action is inserting `item` into `targetArray` at `targetIndex`. If some other action is necessary or default action undesirable then return true signaling the default action was handled in user code.
* When both `oncopy` and `onreplace` functions are defined and the user action (control+shift+drag) makes use of both features, then `oncopy` and `onreplace` callbacks will be triggered with `oncopy` being first.

####onreplace(item, sourceArray, targetIndex, targetArray) triggered ondrop event

| Parameter    | Type    | Description                                            |
|--------------|---------|--------------------------------------------------------|
| item         | object  | A copy of the object model of the item being dropped   |
| sourceArray  | array   | The array model that contains the original `item`      |
| targetIndex  | int     | The index in `targetArray` where replace is being made |
| targetArray  | array   | The array model where `item` is being dropped          |
| return       | boolean | Whether default action was handled                     |

Notes
* `item` is a copy so changes can be made, webapi's called, id's updated, or item completely replaced with another without affecting the object model
* Defining the `onreplace` function enables the replace (shift+drag) feature
* Default action is removing the original `item` from `sourceArray`, removing the target item at `targetIndex` from `targetArray` and inserting `item` into `targetArray` at `targetIndex`. If some other action is necessary or default action undesirable then return true signaling the default action was handled in user code.
* When both `oncopy` and `onreplace` functions are defined and the user action (control+shift+drag) makes use of both features, then `oncopy` and `onreplace` callbacks will be triggered with `oncopy` being first.

##License

Copyright (c) 2016 Brian Waplington

Copyright (c) 2016 BW Soft, Inc.

[MIT License](https://raw.githubusercontent.com/bwsoftinc/yet-another-angular-html5-drag-drop/master/LICENSE)