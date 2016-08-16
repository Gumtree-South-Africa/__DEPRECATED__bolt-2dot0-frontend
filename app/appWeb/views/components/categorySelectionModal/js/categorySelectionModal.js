'use strict';

class CategorySelectionModal {
	_checkLeafNode() {
		return !(this.currentLevel.children && this.currentLevel.children.length > 0);
	}

	_traverseHierarchy(hierarchyArray) {
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

		this.currentLevel = currentLevel;
		return this.currentLevel;
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
			this.$resultsList.append(`<li class="list-item" data-id="${listValue.id}">${listValue.localizedName}</li>`);
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

	_displayCategoryHierarchy(hierarchy) {
		this.$hierarchyContainer.find(".hier-link").off();
		this.$hierarchyContainer.empty();

		this.$hierarchyContainer.append(this.getFullBreadCrumbText(hierarchy));

		this._bindEventsToAllCatHierLinks();
	}

	_fullRender() {
		this._renderResults(this._traverseHierarchy(this.currentHierarchy).children);
		this._displayCategoryHierarchy(this.currentHierarchy);
	}

	_hierarchyBack(hierarchyIndex) {
		if (hierarchyIndex !== this.currentHierarchy.length - 1) {
			this.$modal.removeClass("complete");
			this.currentHierarchy = this.currentHierarchy.splice(0, hierarchyIndex + 1);
			this._fullRender();
			this._clearInput();
		}
	}

	_addToHierarchy(catObj) {
		this.currentHierarchy.push(catObj.id);
		this.$hierarchyContainer.append(`> <span role="link" data-index="${this.currentHierarchy.length - 1}" class="hier-link">${catObj.localizedName}</span>`);

		if (catObj.children && catObj.children.length > 0) {
			this._renderResults(catObj.children);
		} else {
			this.$modal.addClass("complete");
		}
	}

	_unstageItem() {
		this._clearInput();
		this.$input.prop("disabled", false);
		this.$modal.removeClass("complete");
		this.$saveButton.prop("disabled", true);

		if (this._checkLeafNode()) {
			this.currentHierarchy.pop(); // we are entering in a leaf node state so make it seem like its staged.
			this._fullRender();
		}
	}

	_stageItem(id) {
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
	}

	_selectItem(item) {
		this._addToHierarchy(item);
		this._renderResults(item.children);
		this.currentLevel = item;
		if (this._checkLeafNode()) {
			this._saveChanges();
		} else {
			this._unstageItem();
		}
	}

	_bindEventsToList() {
		let $items = this.$resultsList.find(".list-item");
		$items.click((evt) => {
			this._stageItem($(evt.currentTarget).data("id"));
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

		this.displayListValues = tempDisplayList;
		this._renderResults();
	}

	_closeModal() {
		this.$modal.addClass("hidden");
		this.currentHierarchy = null;
		this.onSaveCb = null;
	}

	openModal(options)  {
		if (!options) {
			throw Error("Options are required for categorySelectionModal.  Please pass in options with at least a currentHierarchy");
		}

		this.$modal.removeClass("hidden");
		this.currentHierarchy = options.currentHierarchy;
		this.onSaveCb = options.onSaveCb;

		this.$saveButton.prop('disabled', true);
		this.$input.prop('disabled', false);

		this._fullRender();
	}

	_saveChanges() {
		if (this.onSaveCb) {
			this.onSaveCb(this.currentHierarchy, this.getFullBreadCrumbText(this.currentHierarchy));
		}

		this._closeModal();
	}

	initialize() {
		this.$modal = $("#category-selection-modal");
		this.$resultsList = this.$modal.find(".results ul");
		this.$closeButton = this.$modal.find(".close-button");
		this.$input = this.$modal.find('input[type="text"]');
		this.$hierarchyContainer = this.$modal.find(".current-hierarchy");
		this.$saveButton = this.$modal.find(".save-button");
		this.$clearTextButton = $("#clear-text-btn");

		this.$saveButton.click(() => {
			this._selectItem(this.stagedItem);
		});

		this.$closeButton.click(() => {
			this._closeModal();
		});

		this.$clearTextButton.click(() => {
			this._unstageItem();
		});

		this.$input.on('keyup', (evt) => {
			switch (evt.keyCode) {
				case 38:
					//up
					this._highlightPrevItem();
					this._scrollContainer();
					evt.preventDefault();
					break;
				case 40:
					//down
					this._highlightNextItem();
					this._scrollContainer();
					evt.preventDefault();
					break;
				case 13:
					//enter
					this._stageItem(this.$resultsList.find(".active").data("id"));
					evt.preventDefault();
					break;
				default:
					this._filterResults($(evt.currentTarget).val());
					break;
			}
		});

		this.categoryTree = JSON.parse($("#category-tree").text() || "{}");
	}
}

module.exports = new CategorySelectionModal();



