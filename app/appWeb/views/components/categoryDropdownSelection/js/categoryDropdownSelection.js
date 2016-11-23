'use strict';

let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');

const DEFAULT_CATEGORY_ID = 0;

/**
 * A group of dropdown list to select category.
 *
 * - Server-side properties used by template
 *   - categoryAll All categories information, the children property of each node is the
 *       sub-categories
 *   - initialCategory An object whose suggestion.categoryId is the initial category
 *
 * - Events:
 *   - propertyChanged, triggered with propertyName and newValue
 *
 * - Properties:
 *   - categoryId
 */
class CategoryDropdownSelection {
	constructor() {
		this.propertyChanged = new SimpleEventEmitter();

		this._categoryId = DEFAULT_CATEGORY_ID;
		this._isFixMode = false;
		this._isLeaf = false;
		this._isMustLeaf = false;
		this._isValid = true;

		this.$leafCategorySelect = null;
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMound(domElement) {
		this._emptyCategoryOptional = domElement.data('category-optional');
		this._emptyCategoryRequired = domElement.data('category-required');
		this.$categorySelection = domElement.find('.category-selection');

		// Initialize property from DOM
		let allCategoryValue = domElement.find('.all-categories').text();
		this._categoryTree = allCategoryValue ? JSON.parse(allCategoryValue) : {};
		let initialCategoryValue = domElement.find('.initial-category').text();
		let initialCategory = initialCategoryValue ? JSON.parse(initialCategoryValue) : {};
		if (initialCategory.suggestion && initialCategory.suggestion.categoryId) {
			let initialCategoryId = Number(initialCategory.suggestion.categoryId);
			if (!isNaN(initialCategoryId)) {
				this._categoryId = initialCategoryId;
			}
		}
		this.propertyChanged.addHandler((propName, newValue) => {
			if (propName === 'categoryId') {
				this._updateCategory(newValue);
			} else if (propName === 'isMustLeaf') {
				this._updateEmptyOptionText(newValue);
			}
		});
		this.propertyChanged.addHandler((propName/*, newValue*/) => {
			if (propName === 'isMustLeaf' || propName === 'isLeaf') {
				this.isValid = !this._isMustLeaf || this._isLeaf;
			} else if (propName === 'isValid' || propName === 'isFixMode') {
				if (!this.$leafCategorySelect) {
					return;
				}
				this.$leafCategorySelect.toggleClass('validation-error', this._isFixMode && !this._isValid);
			}
		});

		this._updateCategory(this._categoryId);
	}

	get categoryId() {
		return this._categoryId;
	}

	set categoryId(newValue) {
		if (isNaN(newValue)) {
			newValue = DEFAULT_CATEGORY_ID;
		}
		if (this._categoryId === newValue) {
			return;
		}
		this._categoryId = newValue;
		this.propertyChanged.trigger('categoryId', newValue);
	}

	get isFixMode() {
		return this._isFixMode;
	}

	set isFixMode(newValue) {
		newValue = !!newValue;
		if (this._isFixMode === newValue) {
			return;
		}
		this._isFixMode = newValue;
		this.propertyChanged.trigger('isFixMode', newValue);
	}

	get isMustLeaf() {
		return this._isMustLeaf;
	}

	set isMustLeaf(newValue) {
		newValue = !!newValue;
		if (this._isMustLeaf === newValue) {
			return;
		}
		this._isMustLeaf = newValue;
		this.propertyChanged.trigger('isMustLeaf', newValue);
	}

	get isLeaf() {
		return this._isLeaf;
	}

	set isLeaf(newValue) {
		newValue = !!newValue;
		if (this._isLeaf === newValue) {
			return;
		}
		this._isLeaf = newValue;
		this.propertyChanged.trigger('isLeaf', newValue);
	}

	get isValid() {
		return this._isValid;
	}

	set isValid(newValue) {
		newValue = !!newValue;
		if (this._isValid === newValue) {
			return;
		}
		this._isValid = newValue;
		this.propertyChanged.trigger('isValid', newValue);
	}

	_getCategoryHierarchy(node, leafId, stack) {
		if (node.id === leafId) {
			stack.unshift(node.id);
			return node.parentId;
		} else {
			if (node.children) {
				for (let i = 0; i < node.children.length; i++) {
					if (node.id === this._getCategoryHierarchy(node.children[i], leafId, stack)) {
						stack.unshift(node.id);
						return node.parentId;
					}
				}
			}
			return null;
		}
	}

	_traverseHierarchy(hierarchyArray) {
		let currentCategory = this._categoryTree;
		// for each value in the hierarchy array, we navigate down in the tree
		hierarchyArray.forEach((catId, index) => {
			// ignore level 0 (all Categories)
			if (catId !== 0) {
				let nextLvCategory = {};
				let id = "L" + index + "Category";
				let select = $(document.createElement('select')).attr("id", id).addClass("edit-ad-select-box");
				currentCategory.children.forEach((node) => {
					let option = $(document.createElement('option')).attr("value", node.id).html(node.localizedName);
					if (node.id === catId) {
						option.attr("selected", "selected");
						nextLvCategory = node;
					}
					select.append(option);
				});
				if (index >= 2) {
					// Explicitly add category icons, as we can't use presudo element in select.
					// We only add icons for level 2 and more
					$(document.createElement('div')).addClass('category-arrow').addClass('icon-category-arrow')
						.appendTo(this.$categorySelection);
				}
				this.$categorySelection.append(select);
				currentCategory = nextLvCategory;
			}
		});

		let isLeaf = !currentCategory.children || !currentCategory.children.length;

		// Display next level for selection
		if (!isLeaf) {
			let id = "L" + hierarchyArray.length + "Category";
			let select = $(document.createElement('select')).attr("id", id).addClass("edit-ad-select-box");
			select.append($(document.createElement('option')).attr("value", "").attr("selected", "selected").text(
				(this._isMustLeaf ? this._emptyCategoryRequired : this._emptyCategoryOptional) || "---"));
			currentCategory.children.forEach((node) => {
				let option = $(document.createElement('option')).attr("value", node.id).html(node.localizedName);
				select.append(option);
			});
			if (hierarchyArray.length >= 2) {
				// Explicitly add category icons, as we can't use presudo element in select.
				// We only add icons for level 2 and more
				$(document.createElement('div')).addClass('category-arrow').addClass('icon-category-arrow')
					.appendTo(this.$categorySelection);
			}
			this.$categorySelection.append(select);
			select.change((evt) => {
				window.BOLT.trackEvents({"event": "PostAdCategory" + hierarchyArray.length});
				let newLastSelectedCatId = Number($(evt.currentTarget).val());
				this._updateCatHierarchyArray(newLastSelectedCatId);
			});
			this.$leafCategorySelect = select;
			this.$leafCategorySelect.toggleClass('validation-error', this._isFixMode && !this._isValid);
		}

		// This should only be set after this.$leafCategorySelect has been updated
		this.isLeaf = isLeaf;
	}

	_updateCatHierarchyArray(newLastSelectedCatId) {
		this._hierarchyArray.push(newLastSelectedCatId);
		this.$categorySelection.empty();
		this.$leafCategorySelect = null;
		this._traverseHierarchy(this._hierarchyArray);
		//Bind change event
		this._bindEventForSelectedCat();
		this.categoryId = newLastSelectedCatId;
	}

	_bindEventForSelectedCat() {
		this._hierarchyArray.forEach((catId, index) => {
			// ignore level 0 (all Categories)
			if (catId !== 0) {
				let id = "#L" + index + "Category";
				$(id).change((evt) => {
					//Update category hierarchy Array length
					this._hierarchyArray.length = index;
					let newLastSelectedCatId = Number($(evt.currentTarget).val());
					window.BOLT.trackEvents({"event": "PostAdCategory" + index});
					this._updateCatHierarchyArray(newLastSelectedCatId);
				});
			}
		});
	}

	_updateCategory(newValue) {
		this._hierarchyArray=[];
		this.$categorySelection.empty();
		this.$leafCategorySelect = null;
		this._getCategoryHierarchy(this._categoryTree, newValue, this._hierarchyArray);
		this._traverseHierarchy(this._hierarchyArray);
		this._bindEventForSelectedCat();
	}

	_updateEmptyOptionText() {
		if (this.$leafCategorySelect) {
			let options = this.$leafCategorySelect.find('option');
			if (options.length) {
				$(options[0]).text(
					(this._isMustLeaf ? this._emptyCategoryRequired : this._emptyCategoryOptional) || '---');
			}
		}
	}
}

module.exports = CategoryDropdownSelection;



