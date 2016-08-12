'use strict';

let _highlightNextItem = () => {
	let $active = this.$resultsList.find(".active");
	if ($active.length === 0) {
		this.$resultsList.find(".list-item").first().addClass("active");
	} else {
		let $newActive = $active.removeClass("active").next(".list-item");
		$newActive.addClass("active");
	}
};

let _traverseHierarchy = (hiearchyArray) => {
	let currentLevel = this.categoryTree;
	hiearchyArray.forEach((catId) => {
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

let _displayCategoryHierarchy = (passedHierarchy) => {
	let hierarchy = passedHierarchy.slice(0); // cloning the array with slice
	this.$hierarchyContainer.find(".hier-link").off();
	this.$hierarchyContainer.empty();

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

	this.$hierarchyContainer.append(breadcrumbText);

	_bindEventsToAllCatHierLinks();
};

let _fullRender = () => {
	_renderResults(_traverseHierarchy(this.currentHierarchy).children);
	_displayCategoryHierarchy(this.currentHierarchy);
};


this._hierarchyBack = (hierarchyIndex) => {
	this.currentHierarchy = this.currentHierarchy.splice(0, hierarchyIndex + 1);

	_fullRender();
};


let _addToHierarchy = (catObj) => {
	this.currentHierarchy.push(catObj.id);
	this.$hierarchyContainer.append(`> <span role="link" data-index="${this.currentHierarchy.length - 1}" class="hier-link">${catObj.localizedName}</span>`);

	if (catObj.children && catObj.children.length > 0) {
		_renderResults(catObj.children);
	}
};

let _selectItem = (id) => {
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

	_addToHierarchy(item);
	_renderResults(item.children);
	this.currentLevel = item;
};

this._bindEventsToList = () => {
	let $items  = this.$resultsList.find(".list-item");
	$items.click((evt) => {
		_selectItem($(evt.currentTarget).data("id"));
	});

	$items.hover((evt) => {
		$items.removeClass("active");
		$(evt.currentTarget).addClass("active");
	});
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
};

let openModal = () => {
	this.$modal.removeClass("hidden");
};

let initialize = () => {
	this.$modal = $("#category-selection-modal");
	this.$resultsList = this.$modal.find(".results ul");
	this.$closeButton = this.$modal.find(".close-button");
	this.$input = this.$modal.find('input[type="text"]');
	this.$hierarchyContainer = this.$modal.find(".current-hierarchy");

	this.$closeButton.click(() => {
		_closeModal();
	});

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
				_selectItem(this.$resultsList.find(".active").data("id"));
				evt.preventDefault();
				break;
			default:
				_filterResults($(evt.currentTarget).val());
				break;
		}
	});


	this.categoryTree = JSON.parse($("#category-tree").text());
	this.currentHierarchy = JSON.parse($("#selected-cat-hierarchy").text());

	_fullRender();
};

module.exports = {
	initialize,
	openModal
};



