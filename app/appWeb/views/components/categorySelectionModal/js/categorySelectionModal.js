'use strict';

class CategorySelectionModal {

	/***
	 *
	 * @param array
	 * @param cb predicate callback for finding items in array
	 * @returns {*}
	 * @private
	 */
	_findInArray(array, cb) {
		let returnObj, alreadyFound = false;
		// keep looping until we reach the end or we find the item
		for (let i = 0; i < array.length && !alreadyFound; i++) {
			// check predicate callback
			if (cb(array[i])) {
				returnObj = array[i];
				alreadyFound = true;
			}
		}
		return returnObj;
	}

	/***
	 * checks the currentLevel member variable for being a leaf node
	 * @returns {boolean}
	 * @private
	 */
	_checkLeafNode() {
		// we are a leaf node if we have no children
		return !(this.currentLevel.children && this.currentLevel.children.length > 0);
	}

	/***
	 * traverse the full category tree based a hierarchy array to get the ending level
	 * @param hierarchyArray array representing path to node in tree using catIds [0, 6, 80]
	 * @param setCategoryLevel bool should set member categoryLevel variable
	 * @returns {*} category tree level for the ending category in the hierarchy array
	 * @private
	 */
	_traverseHierarchy(hierarchyArray, setCategoryLevel) {
		let currentLevel = this.categoryTree;
		// for each value in the hierarchy array, we navigate down in the tree
		hierarchyArray.forEach((catId) => {
			// ignore level 0 (all Categories)
			if (catId !== 0) {
				currentLevel = this._findInArray(currentLevel.children, (subCat) => {
					return subCat.id === catId;
				});
			}
		});

		if (setCategoryLevel) {
			this.currentLevel = currentLevel;

		}
		return currentLevel;
	}

	/***
	 * clears input text box ( not in use because commented out for mvp)
	 * @private
	 */
	_clearInput() {
		this.$input.val("");
		this.$input.keyup();
	}

	/***
	 * empties out results dom
	 * @private
	 */
	_emptyResults() {
		// remove events from the list item to prevent dom leakage
		this.$resultsList.find(".list-item").off();
		//remove dom from document
		this.$resultsList.empty();
	}

	/***
	 * renders list values into the modal
	 * @param listValues values to render
	 * @private
	 */
	_renderResults(listValues) {
		let appendString = '';
		if (listValues) {
			this.currentLevelValues = listValues;
			this.displayListValues = this.currentLevelValues;
		}
		// clean list area
		this._emptyResults();
		// loop over this categories display values and create the dom for the selection by concatenating strings
		this.displayListValues.forEach((listValue) => {
			appendString +=`<li class="list-item" data-id="${listValue.id}" tabindex="0">${listValue.localizedName}</li>`;
		});

		// append the list dom to the page in one append call instead
		// of appending each value as we loop so we only interact with the dom once
		this.$resultsList.append(appendString);

		// bind click events to the new list dom
		this._bindEventsToList();
	}

	/***
	 * bind events to the category hierarchy for going "back" in the navigation
	 * @private
	 */
	_bindEventsToAllCatHierLinks() {
		this.$hierarchyContainer.find(".hier-link").click((evt) => {
			this._hierarchyBack($(evt.currentTarget).data("index"));
		});
	}

	/***
	 * generage full breadcrumb text dom
	 * @param passedHierarchy hierachy array to display
	 * @returns {string}
	 */
	getFullBreadCrumbText(passedHierarchy) {
		let hierarchy = passedHierarchy.slice(0); // cloning the array with slice

		if (hierarchy.length > 0) {
			hierarchy.shift(); // remove L0 from hierarchy as a base case
		}

		let breadcrumbText = `<span role="link" data-index="0" class="hier-link">${this.rootLabel}</span>`;

		let currentLevel = this.categoryTree;
		hierarchy.forEach((catId, i) => {
			currentLevel.children.some((subCat) => {
				if (subCat.id === catId) {
					breadcrumbText += ` > <span role="link" data-index="${i + 1}" class="hier-link">${subCat.localizedName}</span>`;
					currentLevel = subCat;

					return true;
				}

				return false;
			});
		});

		return breadcrumbText;
	}

	/**
	 * adjusts the modal size in teh event that text wraps in the category hierarchy breadcrumbs
	 * @private
	 */
	_adjustModalSizeForTextWrap() {
		// determine the new height of the category hierarchy breadcrumb div
		let newCatHierHeight = parseInt(this.$hierarchyContainer.css("height").replace("px", ""));
		// get the starting height to calculate the new height from based on if we are staged or not
		let startingHeight = this.stagedItem ? this.startingModalStagedHeight : this.startingModalUnstagedHeight;
		// 24 pixels is the height of the cat heierachy at one line height
		this.$modalBox.css('height', `${startingHeight + (newCatHierHeight - 24)}px`);
	}

	/***
	 * displays category hierarchy into the modal
	 * @param hierarchy array representing hierarchy to display
	 * @private
	 */
	_displayCategoryHierarchy(hierarchy) {
		// if we haven't set an initial unstaged height, then set it
		if (!this.startingModalUnstagedHeight && !this.stagedItem) {
			this.$modalBox.css('height', ''); // clear any javascript set height so we get the css set height
			this.startingModalUnstagedHeight = parseInt(this.$modalBox.css('height').replace("px", ""));
		}

		// remove all events from the category hierarchy links to prevent dom leakage
		this.$hierarchyContainer.find(".hier-link").off();
		this.$hierarchyContainer.empty();

		// append the breadcrumb text to the document
		this.$hierarchyContainer.append(this.getFullBreadCrumbText(hierarchy));

		// bind click events to the category hierarchy breadcrumb links to go back in tree traversal
		this._bindEventsToAllCatHierLinks();

		// adjust the size as we done know how long the breadcrumbs are now and if they have wrapped
		this._adjustModalSizeForTextWrap();
	}

	/***
	 * full render the category modal based on the current level (both breadcrumb and results rendering)
	 * @private
	 */
	_fullRender() {
		// display results in the results container
		this._renderResults(this._traverseHierarchy(this.currentHierarchy, true).children);
		// display category hierarchy breadcrumbs
		this._displayCategoryHierarchy(this.currentHierarchy);
	}

	/***
	 * navigate back in the hierarchy based on an index in the hierarchy array
	 * @param hierarchyIndex to navigate back to
	 * @private
	 */
	_hierarchyBack(hierarchyIndex) {
		// if they didnt click the last item in the breadcrumbs
		if (hierarchyIndex !== this.currentHierarchy.length - 1) {
			// unstage any item
			this._unstageItem();
			this.currentHierarchy = this.currentHierarchy.splice(0, hierarchyIndex + 1);
			this._fullRender();
		}
	}

	/***
	 * add a single catgegory to the end of the category hierarchy breadcrumbs
	 * @param catObj
	 * @private
	 */
	_addToHierarchy(catObj) {
		// ad the new category id to the category hierarchy arry
		this.currentHierarchy.push(catObj.id);
		// create hierarchy text
		let $newHeirarchyText = $(`<span role="link" data-index="${this.currentHierarchy.length - 1}" class="hier-link">${catObj.localizedName}</span>`);
		// bind click events to new item for hierarchy back
		$newHeirarchyText.click((evt) => {
			this._hierarchyBack($(evt.currentTarget).data("index"));
		});
		// append both the arrow carat and the new span to the breadcrumb container
		this.$hierarchyContainer.append(`> `).append($newHeirarchyText);
		// adjust the size of hte modal in case the breadcrumb text wrapped
		this._adjustModalSizeForTextWrap();
	}

	/***
	 * remove a staged item
	 * @param shouldRender
	 * @private
	 */
	_unstageItem(shouldRender) {
		this._clearInput();
		this.$input.prop("disabled", false);
		this.$modal.removeClass("staged");
		// disable save button since we are no longer staged
		this.$saveButton.prop("disabled", true);
		this.stagedItem = null;

		if (shouldRender) {
			this.currentHierarchy.pop();
			this._fullRender();
		}
	}

	/***
	 * finds the child based at catId in the current levels children
	 * @param id catId to find
	 * @returns {*}
	 * @private
	 */
	_findItemOnLevel(id) {
		let item = this._findInArray(this.currentLevel.children, (cat) => {
			return cat.id === id;
		});

		if (!item) {
			throw Error("This item does not exist on the current tree level.");
		}

		return item;
	}

	/***
	 * stage an item from saving (should only stage leaf nodes)
	 * @param item category tree item to stage
	 * @private
	 */
	_stageItem(item) {
		// if its a catId go get the actual category level object
		if (!isNaN(item)) {
			item = this._findItemOnLevel(item);
		}

		// add the text to the input field to display
		this.$input.val(item.localizedName);
		// disable the input from being modified
		this.$input.prop("disabled", true);
		// switch the modal the staging view
		this.$modal.addClass("staged");
		// enable the save button
		this.$saveButton.prop("disabled", false);

		// if we haven't set an initial staged height, then set it becase this the first time we are staged
		if (!this.startingModalStagedHeight) {
			this.$modalBox.css('height', ''); // clear any javascript set height so we can get the natural height from css
			this.startingModalStagedHeight = parseInt(this.$modalBox.css('height').replace("px", ""));
		}

		// save the staged item
		this.stagedItem = item;
		// ad the staged ite to the hierarchy array
		this._addToHierarchy(item);
	}

	/***
	 * select an item on the current level
	 * @param item either a catId or the actual item
	 * @private
	 */
	_selectItem(item) {
		// if were passed a catId find the item
		if (!isNaN(item)) {
			item = this._findItemOnLevel(item);
		}
		this._renderResults(item.children);
		this.currentLevel = item;
		// if were a leaf node, we stage the item so the user has a chance to confirm
		if (this._checkLeafNode()) {
			this._stageItem(item);
		} else {
			// else add to hierarchy and make sure we are not staged for the next level
			this._addToHierarchy(item);
			this._unstageItem();
		}
	}

	/***
	 * select a staged item
	 * @private
	 */
	_selectStagedItem() {
		this._renderResults(this.stagedItem.children);
		this.currentLevel = this.stagedItem;
		// make sure were a leaf node and then save the changes
		if (this._checkLeafNode()) {
			this._saveChanges();
		}
	}

	/***
	 * bind click and hover events to the list items in the results
	 * @private
	 */
	_bindEventsToList() {
		let $items = this.$resultsList.find(".list-item");
		// clicking an item selects it
		$items.click((evt) => {
			this._selectItem($(evt.currentTarget).data("id"));
		});

		// manage active state for hover with javascript so you can switch to
		// arrow keys after hovering if you choose
		$items.hover((evt) => {
			$items.removeClass("active");
			$(evt.currentTarget).addClass("active");
		});
	}

	// /***
	//  * scroll the container for when arrow keys go below the modal view
	//  * @private
	//  */
	// _scrollContainer() {
	// 	let $active = this.$resultsList.find(".active");
	// 	if ($active.length !== 0) {
	// 		$active.closest('.results').scrollTop($active.index() * $active.outerHeight());
	// 	}
	// }

	// /***
	//  * highlight the next item in the list (used for down arrow key interaction)
	//  * @private
	//  */
	// _highlightNextItem() {
	// 	let $active = this.$resultsList.find(".active");
	// 	if ($active.length === 0) {
	// 		// if none is selected then select the first
	// 		this.$resultsList.find(".list-item").first().addClass("active");
	// 	} else {
	// 		// else select the next item in the dom from the currently selected item
	// 		let $newActive = $active.removeClass("active").next(".list-item");
	// 		$newActive.addClass("active");
	// 	}
	// }

	// /***
	//  * highlight the previous item in the list (used for up arrow key interaction)
	//  * @private
	//  */
	// _highlightPrevItem() {
	// 	let $active = this.$resultsList.find(".active");
	// 	if ($active.length === 0) {
	// 		// if nothing is selected then select the last item in the list
	// 		this.$resultsList.find(".list-item").last().addClass("active");
	// 	} else {
	// 		// else select the previous item in the dom from the currently selected item
	// 		$active.removeClass("active").prev(".list-item").addClass("active");
	// 	}
	// }

	// /***
	//  * filter the results based on passed in string value (not in use, commented out for mvp)
	//  * @param value string, the value to filter on
	//  * @private
	//  */
	// _filterResults(value) {
	// 	let tempDisplayList = [];
	// 	this.currentLevelValues.forEach((current) => {
	// 		// filter contents based on if search string is contained anywhere in the string
	// 		if (current.localizedName.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
	// 			tempDisplayList.push(current);
	// 		}
	// 	});
	//
	// 	// only refilter if we have to.
	// 	if (tempDisplayList.length !== this.displayListValues.length) {
	// 		this.displayListValues = tempDisplayList;
	// 		this._renderResults();
	// 	}
	// }

	/***
	 * close the modal and clean up instance variables
	 * @private
	 */
	_closeModal() {
		this.$body.removeClass('hide-overflow');
		this.$modal.addClass("hidden");
		this.currentHierarchy = null;
		this.onSaveCb = null;
	}

	/***
	 * check if hierarchy array ends in a leaf node
	 * @param hierarchy array to see if last variable is a leaf node
	 * @returns {boolean}
	 */
	isLeafCategory(hierarchy) {
		let level = this._traverseHierarchy(hierarchy, false);
		return !level.children || level.children.length === 0;
	}

	/***
	 * opens the modal
	 * @param options to handle per opening instance variables
	 */
	openModal(options)  {
		let stagedItem;
		if (!options) {
			throw Error("Options are required for categorySelectionModal.  Please pass in options with at least a currentHierarchy");
		}

		// display the modal
		this.$modal.removeClass("hidden");

		// grab the current hierarchy to determine where to the open the menu to
		// current hierarchy is owned by the form that is opening the modal
		this.currentHierarchy = options.currentHierarchy;

		// store the on save callback
		this.onSaveCb = options.onSaveCb;

		if (this.currentHierarchy.length <= 0) {
			// if the current hierarchy is empty,
			// push on the "All Categories" catId to render the modal correctly
			this.currentHierarchy.push(0);
		} else if (this.isLeafCategory(this.currentHierarchy)) {
			// if we are a leave node, bringing them up in the staging view,
			// and pop the leaf node value from the current hierarchy
			stagedItem = this.currentHierarchy.pop();
		}

		// disable the save button
		this.$saveButton.prop('disabled', true);
		// this.$input.prop('disabled', false);

		// full render the current level
		this._fullRender();

		// if we have a staged item from opening, stage it now that weve rendered
		if (stagedItem) {
			this._stageItem(stagedItem);
		}

		this.$body.addClass('hide-overflow');
	}

	/***
	 * save the changes by firing the onSave callback and closing the modal
	 * @private
	 */
	_saveChanges() {
		if (this.onSaveCb) {
			this.onSaveCb(this.currentHierarchy, this.getFullBreadCrumbText(this.currentHierarchy));
		}

		this._closeModal();
	}

	initialize() {
		this.$body = $('body');
		this.$modal = $("#category-selection-modal");
		this.$modalBox = this.$modal.find('.modal');
		this.$resultsList = this.$modal.find(".results ul");
		this.$closeButton = this.$modal.find(".close-button");
		this.$input = this.$modal.find('input[type="text"]');
		this.$results = this.$modal.find(".results");
		this.$hierarchyContainer = this.$modal.find(".current-hierarchy");
		this.$saveButton = this.$modal.find(".save-button");
		this.$clearTextButton = $("#clear-text-btn");
		this.rootLabel = this.$modal.data("root-label");

		this.$saveButton.click(() => {
			this._selectStagedItem();
		});

		this.$closeButton.click(() => {
			this._closeModal();
		});

		this.$clearTextButton.click(() => {
			this._unstageItem(true);
		});

		// TODO this is the implemented search functionality to filter the lists,
		// TODO this is not part of MVP so commenting out
		// this.$input.on('keyup', (evt) => {
		// 	switch (evt.keyCode) {
		// 		case 38:
		// 			//up
		// 			this._highlightPrevItem();
		// 			this._scrollContainer();
		// 			evt.preventDefault();
		// 			break;
		// 		case 40:
		// 			//down
		// 			this._highlightNextItem();
		// 			this._scrollContainer();
		// 			evt.preventDefault();
		// 			break;
		// 		case 13:
		// 			//enter
		// 			this._stageItem(this.$resultsList.find(".active").data("id"));
		// 			evt.preventDefault();
		// 			break;
		// 		default:
		// 			// this._filterResults($(evt.currentTarget).val());
		// 			break;
		// 	}
		// });

		this.categoryTree = JSON.parse($("#category-tree").text() || "{}");
	}
}

module.exports = new CategorySelectionModal();



