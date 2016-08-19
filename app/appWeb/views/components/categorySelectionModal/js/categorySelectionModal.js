'use strict';

class CategorySelectionModal {
	_checkLeafNode() {
		return !(this.currentLevel.children && this.currentLevel.children.length > 0);
	}

	_traverseHierarchy(hierarchyArray, setCategoryLevel) {
		let currentLevel = this.categoryTree;
		hierarchyArray.forEach((catId) => {
			if (catId !== 0) {
				currentLevel.children.some((subCat) => {
					if (subCat.id === catId) {
						currentLevel = subCat;

						return true;
					}

					return false;
				});
			}
		});

		if (setCategoryLevel) {
			this.currentLevel = currentLevel;

		}
		return currentLevel;
	}

	_clearInput() {
		this.$input.val("");
		this.$input.keyup();
	}

	_emptyResults() {
		this.$resultsList.find(".list-item").off();
		this.$resultsList.empty();
	}

	_renderResults(listValues) {
		if (listValues) {
			this.currentLevelValues = listValues;
			this.displayListValues = this.currentLevelValues;
		}
		this._emptyResults();
		this.displayListValues.forEach((listValue) => {
			this.$resultsList.append(`<li class="list-item" data-id="${listValue.id}" tabindex="0">${listValue.localizedName}</li>`);
		});

		this._bindEventsToList();
	}

	_bindEventsToAllCatHierLinks() {
		this.$hierarchyContainer.find(".hier-link").click((evt) => {
			this._hierarchyBack($(evt.currentTarget).data("index"));
		});
	}

	getFullBreadCrumbText(passedHierarchy) {
		let hierarchy = passedHierarchy.slice(0); // cloning the array with slice

		if (hierarchy.length > 0) {
			hierarchy.shift(); // remove L0 from hierarchy as a base case
		}

		let breadcrumbText = `<span role="link" data-index="0" class="hier-link">${this.categoryTree.localizedName}</span>`;

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

	_adjustModalSizeForTextWrap() {
		let newCatHierHeight = parseInt(this.$hierarchyContainer.css("height").replace("px", ""));
		let startingHeight = this.stagedItem ? this.startingModalStagedHeight : this.startingModalUnstagedHeight;
		// 24 pixels is the height of the cat heierachy at one line height
		this.$modalBox.css('height', `${startingHeight + (newCatHierHeight - 24)}px`);
	}

	_displayCategoryHierarchy(hierarchy) {
		if (!this.startingModalUnstagedHeight && !this.stagedItem) {
			this.$modalBox.css('height', '');
			this.startingModalUnstagedHeight = parseInt(this.$modalBox.css('height').replace("px", ""));
		}

		this.$hierarchyContainer.find(".hier-link").off();
		this.$hierarchyContainer.empty();

		this.$hierarchyContainer.append(this.getFullBreadCrumbText(hierarchy));

		this._bindEventsToAllCatHierLinks();

		this._adjustModalSizeForTextWrap();
	}

	_fullRender() {
		this._renderResults(this._traverseHierarchy(this.currentHierarchy, true).children);
		this._displayCategoryHierarchy(this.currentHierarchy);
	}

	_hierarchyBack(hierarchyIndex) {
		if (hierarchyIndex !== this.currentHierarchy.length - 1) {
			this.$modal.removeClass("staged");
			this.currentHierarchy = this.currentHierarchy.splice(0, hierarchyIndex + 1);
			this.stagedItem = null;
			this._fullRender();
			this._clearInput();
		}
	}

	_addToHierarchy(catObj) {
		this.currentHierarchy.push(catObj.id);
		this.$hierarchyContainer.append(`> <span role="link" data-index="${this.currentHierarchy.length - 1}" class="hier-link">${catObj.localizedName}</span>`);
		this._adjustModalSizeForTextWrap();
	}

	_unstageItem(shouldRender) {
		this._clearInput();
		this.$input.prop("disabled", false);
		this.$modal.removeClass("staged");
		this.$saveButton.prop("disabled", true);
		this.stagedItem = null;

		if (shouldRender) {
			this.currentHierarchy.pop();
			this._fullRender();
		}
	}

	_findItemOnLevel(id) {
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

		return item;
	}

	_stageItem(item) {
		if (Number.isInteger(item)) {
			item = this._findItemOnLevel(item);
		}

		this.$input.val(item.localizedName);
		this.$input.prop("disabled", true);
		this.$modal.addClass("staged");
		this.$saveButton.prop("disabled", false);

		if (!this.startingModalStagedHeight) {
			this.$modalBox.css('height', '');
			this.startingModalStagedHeight = parseInt(this.$modalBox.css('height').replace("px", ""));
		}

		this.stagedItem = item;
		this._addToHierarchy(item);
	}


	_selectItem(item) {
		if (Number.isInteger(item)) {
			item = this._findItemOnLevel(item);
		}
		this._renderResults(item.children);
		this.currentLevel = item;
		if (this._checkLeafNode()) {
			this._stageItem(item);
		} else {
			this._addToHierarchy(item);
			this._unstageItem();
		}
	}

	_selectStagedItem() {
		this._renderResults(this.stagedItem.children);
		this.currentLevel = this.stagedItem;
		if (this._checkLeafNode()) {
			this._saveChanges();
		} else {
			this._unstageItem();
		}
	}

	_bindEventsToList() {
		let $items = this.$resultsList.find(".list-item");
		$items.click((evt) => {
			this._selectItem($(evt.currentTarget).data("id"));
		});

		$items.hover((evt) => {
			$items.removeClass("active");
			$(evt.currentTarget).addClass("active");
		});
	}

	_highlightNextItem() {
		let $active = this.$resultsList.find(".active");
		if ($active.length === 0) {
			this.$resultsList.find(".list-item").first().addClass("active");
		} else {
			let $newActive = $active.removeClass("active").next(".list-item");
			$newActive.addClass("active");
		}
	}

	_scrollContainer() {
		let $active = this.$resultsList.find(".active");
		if ($active.length !== 0) {
			$active.closest('.results').scrollTop($active.index() * $active.outerHeight());
		}
	}

	_highlightPrevItem() {
		let $active = this.$resultsList.find(".active");
		if ($active.length === 0) {
			this.$resultsList.find(".list-item").last().addClass("active");
		} else {
			$active.removeClass("active").prev(".list-item").addClass("active");
		}
	}

	_filterResults(value) {
		let tempDisplayList = [];
		this.currentLevelValues.forEach((current) => {
			if (current.localizedName.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
				tempDisplayList.push(current);
			}
		});

		// only re refilter if we have to.
		if (tempDisplayList.length !== this.displayListValues.length) {
			this.displayListValues = tempDisplayList;
			this._renderResults();
		}
	}

	_closeModal() {
		this.$modal.addClass("hidden");
		this.currentHierarchy = null;
		this.onSaveCb = null;
	}

	isLeafCategory(hierarchy) {
		let level = this._traverseHierarchy(hierarchy, false);
		return !level.children || level.children.length === 0;
	}

	openModal(options)  {
		let stagedItem;
		if (!options) {
			throw Error("Options are required for categorySelectionModal.  Please pass in options with at least a currentHierarchy");
		}

		this.$modal.removeClass("hidden");
		this.currentHierarchy = options.currentHierarchy;
		this.onSaveCb = options.onSaveCb;

		if (this.currentHierarchy.length <= 0) {
			this.currentHierarchy.push(0);
		} else if (this.currentHierarchy.length > 1) {
			stagedItem = this.currentHierarchy.pop();
		}

		this.$saveButton.prop('disabled', true);
		this.$input.prop('disabled', false);

		this._fullRender();

		if (stagedItem) {
			this._stageItem(stagedItem);
		}
	}

	_saveChanges() {
		if (this.onSaveCb) {
			this.onSaveCb(this.currentHierarchy, this.getFullBreadCrumbText(this.currentHierarchy));
		}

		this._closeModal();
	}

	initialize() {
		this.$modal = $("#category-selection-modal");
		this.$modalBox = this.$modal.find('.modal');
		this.$resultsList = this.$modal.find(".results ul");
		this.$closeButton = this.$modal.find(".close-button");
		this.$input = this.$modal.find('input[type="text"]');
		this.$results = this.$modal.find(".results");
		this.$hierarchyContainer = this.$modal.find(".current-hierarchy");
		this.$saveButton = this.$modal.find(".save-button");
		this.$clearTextButton = $("#clear-text-btn");

		window.temp = this.$hierarchyContainer;
		this.$saveButton.click(() => {
			this._selectStagedItem();
		});

		this.$closeButton.click(() => {
			this._closeModal();
		});

		this.$clearTextButton.click(() => {
			this._unstageItem(true);
		});

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



