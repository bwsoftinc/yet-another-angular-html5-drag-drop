# **yet-another-angular-html5-drag-drop**

[**See live demos**](#live-demos)  
Angular directive to enable drag and drop features on ng-repeat collections.  
Implemented using the HTML5 draggable api, javascript and angularJS.  
No dependency on jQuery.

## Features

* Move, Copy and Replace drag and drop actions.
* Simple to use and set up with a single directive.
* Powerful options offer advanced control.
* Default callbacks that automatically update the dom and underlying model(s).
* User definable callbacks that work in tandem with or override default callbacks.
* Supports 
	* Various html elements
	* Static sibling html elements
	* Drag handles
	* Multiple collections
	* Nested collections
	* Shared or isolated scopes, across different controllers even modules
* Styling
	* Placeholder
	* Drop target
	* Drag source
	* Dragging element

## Live Demos

* [Simple List](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/simplelist.html)
* [Styled List](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/stylelist.html)
* [Static Items in List](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/staticlist.html)
* [Mulitple Lists](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/multilist.html)
* [Nested Lists](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/nestedlist.html)
* [Advanced Demo](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/demo.html)

## Using the `yaHTML5Sort` module and `ya-sort` directive

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

## The options parameter (optional)

Declare one or more options objects on the angular controller's scope.  
These options objects can be passed as the `ya-sort` directive value to one or more instances of `ya-sort`
```Javascript
module.controller('myController', function($scope) {
	$scope.myOptions = {
		dragHandleClass = 'handle',
		//more options...
	};
});
```

### Define one or more of these property values, if not defined the default will be used

| Option Values        | Type	 | Default | Description
| ---------------------|---------|---------|--------------------------------------------------------|
| disabled             | boolean | false   | Whether `ya-sort` directive features are disabled      |
| dragHandleClass      | string  | null    | A class used to denote the items' drag handles         |
| dragSourceItemClass  | string  | null    | A class applied to the original item while dragging    |
| dragItemClass        | string  | null    | A class applied to the dragging item while dragging    |
| dropPlaceholderClass | string  | null    | A class applied to the drop placeholder while dragging |
| dropTargetItemClass  | string  | null    | A class applied to the drop target while dragging      |

### Define one or more of these callback function prototypes

#### `candrag(item)` triggered ondragstart event

| Parameter    | Type    | Description                                            |
|--------------|---------|--------------------------------------------------------|
| item         | object  | The object model of the item attempting to be dragged  |
| return       | boolean | Whether dragging should commence for this item         |

Remarks
* If not defined dragging will be allowed on any `ya-sort` item.

#### `candrop(item, sourceArray, targetArray)` triggered ondragover event

| Parameter    | Type    | Description                                            |
|--------------|---------|--------------------------------------------------------|
| item         | object  | The object model of the item being dragged             |
| sourceArray  | array   | The array model that contains `item`                   |
| targetArray  | array   | The array model where `item` would be dropped          |
| return       | boolean | Whether the drop should be allowed here                |

Remarks
* If not defined dropping will be allowed in any `ya-sort` instance.
	
#### `onmove(item, sourceArray, targetIndex, targetArray)` triggered ondrop event

| Parameter    | Type    | Description                                            |
|--------------|---------|--------------------------------------------------------|
| item         | object  | The object model of the item being dropped             |
| sourceArray  | array   | The array model that contains `item`                   |
| targetIndex  | int     | The index in `targetArray` where move is being placed  |
| targetArray  | array   | The array model where `item` is being dropped          |
| return       | boolean | Whether default action was handled                     |

Remarks
* Default action is removing `item` from `sourceArray` and inserting to `targetArray` at `targetIndex`.
* Define `onmove` to perform additional actions such as calling a webapi and updating `item` properties or other item properties in the arrays.
* Javascript function parameters are not by reference so update `item`'s properties freely, assigning `item` to another object in `onmove` will not work.
* Return false to then proceed with the default action.
* If the default action is undesirable then return true signaling the default action was handled in user code.

#### `oncopy(item, sourceArray, targetIndex, targetArray)` triggered ondrop event

| Parameter    | Type    | Description                                            |
|--------------|---------|--------------------------------------------------------|
| item         | object  | A copy of the object model of the item being dropped   |
| sourceArray  | array   | The array model that contains the original `item`      |
| targetIndex  | int     | The index in `targetArray` where copy is being placed  |
| targetArray  | array   | The array model where `item` is being dropped          |
| return       | boolean | Whether default action was handled                     |

Remarks
* Defining the `oncopy` function enables the copy (_control+drag_) feature.
* Here, `item` is already a copy so properties can be updated and will only affect the target and not the original.
* Default action is inserting the copy of `item` into `targetArray` at `targetIndex`.
* When both `oncopy` and `onreplace` functions are defined and the user action (_control+shift+drag_) makes use of both features, then both `oncopy` and `onreplace` callbacks will be triggered with `oncopy` being first.

#### `onreplace(item, sourceArray, targetIndex, targetArray)` triggered ondrop event

| Parameter    | Type    | Description                                            |
|--------------|---------|--------------------------------------------------------|
| item         | object  | The object model of the item being dropped             |
| sourceArray  | array   | The array model that contains `item`                   |
| targetIndex  | int     | The index in `targetArray` where replace is being made |
| targetArray  | array   | The array model where `item` is being dropped          |
| return       | boolean | Whether default action was handled                     |

Remarks
* Defining the `onreplace` function enables the replace (_shift+drag_) feature.
* Default action is removing `item` from `sourceArray`, removing the target item at `targetIndex` from `targetArray` and inserting `item` into `targetArray` at `targetIndex`.
* When both `oncopy` and `onreplace` functions are defined and the user action (_control+shift+drag_) makes use of both features, then the default action will not remove `item` from `sourceArray`.

## License

Copyright (c) 2016 Brian Waplington

Copyright (c) 2016 BW Soft, Inc.

[MIT License](https://raw.githubusercontent.com/bwsoftinc/yet-another-angular-html5-drag-drop/master/LICENSE)
