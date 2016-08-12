'use strict';

let _traverseHierarchy = (hierarchyArray) => {
	let currentLevel = this.categoryTree;
	hierarchyArray.forEach((catId) => {
		currentLevel.children.some((subCat) => {
			if (subCat.id === catId) {
				currentLevel = subCat;

				return true;
			}

			return false;
		});
	});

	this.currentLevel = currentLevel;
	return this.currentLevel;
};

let _checkLeafNode = () => {
	this.leafNodeSelected = !(this.currentLevel.children && this.currentLevel.children.length > 0);

	return this.leafNodeSelected;
};

let _clearInput = () => {
	this.$input.val("");
	this.$input.keyup();
};

let _emptyResults = () => {
	this.$resultsList.find(".list-item").off();
	this.$resultsList.empty();
};

let _renderResults = (listValues) => {
	if (listValues) {
		this.currentLevelValues = listValues;
		this.displayListValues = this.currentLevelValues;
	}
	_emptyResults();
	this.displayListValues.forEach((listValue) => {
		this.$resultsList.append(`<li class="list-item" data-id="${listValue.id}">${listValue.localizedName}</li>`);
	});
	this._bindEventsToList();
};


let _bindEventsToAllCatHierLinks = () => {
	this.$hierarchyContainer.find(".hier-link").click((evt) => {
		this._hierarchyBack($(evt.currentTarget).data("index"));
	});
};

let getFullBreadCrumbText = (passedHierarchy) => {
	let hierarchy = passedHierarchy.slice(0); // cloning the array with slice

	if (hierarchy.length > 0) {
		hierarchy.shift(); // remove L0 from hierarchy as a base case
	}

	let breadcrumbText = `<span role="link" data-index="0" class="hier-link">${this.categoryTree.localizedName}</span>`;

	let currentLevel = this.categoryTree;
	hierarchy.forEach((catId, i) => {
		currentLevel.children.some((subCat) => {
			if (subCat.id === catId) {
				breadcrumbText += ` > <span role="link" data-index="${i+1}" class="hier-link">${subCat.localizedName}</span>`;
				currentLevel = subCat;

				return true;
			}

			return false;
		});
	});

	return breadcrumbText;
};

let _displayCategoryHierarchy = (hierarchy) => {
	this.$hierarchyContainer.find(".hier-link").off();
	this.$hierarchyContainer.empty();

	this.$hierarchyContainer.append(getFullBreadCrumbText(hierarchy));

	_bindEventsToAllCatHierLinks();
};

let _fullRender = () => {
	_renderResults(_traverseHierarchy(this.currentHierarchy).children);
	_displayCategoryHierarchy(this.currentHierarchy);
};


this._hierarchyBack = (hierarchyIndex) => {
	if (hierarchyIndex !== this.currentHierarchy.length -1) {
		this.$modal.removeClass("complete");
		this.currentHierarchy = this.currentHierarchy.splice(0, hierarchyIndex + 1);
		_fullRender();
		_clearInput();
	}
};


let _addToHierarchy = (catObj) => {
	this.currentHierarchy.push(catObj.id);
	this.$hierarchyContainer.append(`> <span role="link" data-index="${this.currentHierarchy.length - 1}" class="hier-link">${catObj.localizedName}</span>`);

	if (catObj.children && catObj.children.length > 0) {
		_renderResults(catObj.children);
	} else {
		this.$modal.addClass("complete");
	}
};

let _unstageItem = () => {
	_clearInput();
	this.$input.prop("disabled", false);
	this.$modal.removeClass("complete");
	this.$saveButton.prop("disabled", true);
};

let _stageItem = (id) => {
	let item;
	this.currentLevel.children.some((cat) => {
		if (cat.id === id) {
			item = cat;
			return true;
		}
		return false;
	});

	if (!item) {
		throw Error("This item does not exist on the current tree level.");
	}

	this.$input.val(item.localizedName);
	this.$input.prop("disabled", true);
	this.$modal.addClass("complete");
	this.$saveButton.prop("disabled", false);
	this.stagedItem = item;
};

let _selectItem = (item) => {
	_addToHierarchy(item);
	_renderResults(item.children);
	this.currentLevel = item;
	if (!_checkLeafNode()) {
		_unstageItem();
	}
};

this._bindEventsToList = () => {
	let $items  = this.$resultsList.find(".list-item");
	$items.click((evt) => {
		_stageItem($(evt.currentTarget).data("id"));
	});

	$items.hover((evt) => {
		$items.removeClass("active");
		$(evt.currentTarget).addClass("active");
	});
};

let _highlightNextItem = () => {
	let $active = this.$resultsList.find(".active");
	if ($active.length === 0) {
		this.$resultsList.find(".list-item").first().addClass("active");
	} else {
		let $newActive = $active.removeClass("active").next(".list-item");
		$newActive.addClass("active");
	}
};

let _highlightPrevItem = () => {
	let $active = this.$resultsList.find(".active");
	if ($active.length === 0) {
		this.$resultsList.find(".list-item").last().addClass("active");
	} else {
		$active.removeClass("active").prev(".list-item").addClass("active");
	}
};

let _filterResults = (value) => {
	let tempDisplayList = [];
	this.currentLevelValues.forEach((current) => {
		if (current.localizedName.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
			tempDisplayList.push(current);
		}
	});

	this.displayListValues = tempDisplayList;
	_renderResults();
};

let _closeModal = () => {
	this.$modal.addClass("hidden");
	this.currentHierarchy = null;
	this.onSaveCb = null;
};

let openModal = (options) => {
	if (!options) {
		throw Error("Options are required for categorySelectionModal.  Please pass in options with at least a currentHierarchy");
	}

	this.$modal.removeClass("hidden");
	this.currentHierarchy = options.currentHierarchy;
	this.onSaveCb = options.onSaveCb;

	this.$saveButton.prop('disabled', true);
	this.$input.prop('disabled', false);
	_fullRender();
	_checkLeafNode();
};

let _saveChanges = () => {
	if (this.onSaveCb) {
		this.onSaveCb(this.currentHierarchy, getFullBreadCrumbText(this.currentHierarchy));
	}

	_closeModal();
};

let initialize = () => {
	this.$modal = $("#category-selection-modal");
	this.$resultsList = this.$modal.find(".results ul");
	this.$closeButton = this.$modal.find(".close-button");
	this.$input = this.$modal.find('input[type="text"]');
	this.$hierarchyContainer = this.$modal.find(".current-hierarchy");
	this.$saveButton = this.$modal.find(".save-button");
	this.$clearTextButton = $("#clear-text-btn");

	this.$saveButton.click(() => {
		if (!this.leafNodeSelected) {
			_selectItem(this.stagedItem);
		} else {
			_saveChanges();
		}
	});

	this.$closeButton.click(() => {
		_closeModal();
	});

	this.$clearTextButton.click(_clearInput);

	this.$input.on('keyup', (evt) => {
		switch (evt.keyCode) {
			case 38:
				//up
				_highlightPrevItem();
				evt.preventDefault();
				break;
			case 40:
				//down
				_highlightNextItem();
				evt.preventDefault();
				break;
			case 13:
				//enter
				_stageItem(this.$resultsList.find(".active").data("id"));
				evt.preventDefault();
				break;
			default:
				_filterResults($(evt.currentTarget).val());
				break;
		}
	});

	this.categoryTree = JSON.parse($("#category-tree").text() || "{}");
};

module.exports = {
	initialize,
	openModal,
	getFullBreadCrumbText
};



