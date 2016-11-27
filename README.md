# yet-another-angular-html5-drag-drop

Angular directive to enable drag and drop features on ng-repeat collections.
Implemented using the HTML5 draggable api, angularJS and javascript, without dependency on jQuery.

## Features

* Move, Copy and Replace drag and drop actions.
* Simple to use and set up with a single directive.
* Mulitple collections based in shared or isolated scopes
* Default callbacks that update the dom and underlying angular model.
* User definable callbacks that work in tandem with or override default callbacks.
* Supports 
	* Various collections of html elements
	* Static sibling html elements
	* Drag handles
	* Nested lists
* Styling
	* Placeholder
	* Drop target
	* Drag source
	* Dragging element

## Live Demo

* [Simple List](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/simplelist.html)
* [Styled List](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/stylelist.html)
* [Mulitple Lists](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/multilist.html)
* [Nested Lists](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/nestedlist.html)
* [Advanced Demo](https://bwsoftinc.github.io/yet-another-angular-html5-drag-drop/demo/index.html)

## Using yaHTML5Sort module and ya-sort directive

To use drag drop features, download yaHTML5Sort.js and add yaHTML5Sort module as a dependency to your angular project.
On the element containing the ng-repeat directive, add the ya-sort directive with optional options parameter.

## The options parameter

(coming soon)


## License

Copyright (c) 2016 Brian Waplington

Copyright (c) 2016 BW Soft, Inc.

[MIT License](https://raw.githubusercontent.com/bwsoftinc/yet-another-angular-html5-drag-drop/master/LICENSE)