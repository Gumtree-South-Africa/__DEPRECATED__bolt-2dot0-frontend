'use strict';
let postAdFormMainDetails = require("app/appWeb/views/components/postAdFormMainDetails/js/postAdFormMainDetails.js");

class CategoryUpdateModal {
	initialize() {
		this.categoryTree = JSON.parse($("#category-tree").text() || "{}");
		this.$categorySelection = $("#category-selection");
		this.initialCategory = JSON.parse($("#initialCategory").text() || "{}");
		this.initialImage = $('#postForm').find('input[name="initialImage"]');
		this.hierarchyArray = [];
		postAdFormMainDetails.initialize();
		$(document).ready(() => {
			this.onReady();
		});
	}

	// If Post with initialImage and categoryId, update post Ad form main detail with category and image
	onReady() {
		let catId = this.initialCategory.suggestion.categoryId !== '' ? this.initialCategory.suggestion.categoryId : "0";
		this.updateCategory(Number(catId), this.initialImage.val());
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
		let currentCategory = this.categoryTree;
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
		// Display next level for selection

		if (currentCategory.children && currentCategory.children.length > 0) {
			let id = "L" + hierarchyArray.length + "Category";
			let select = $(document.createElement('select')).attr("id", id).addClass("edit-ad-select-box");
			select.append($(document.createElement('option')).attr("value", "").attr("selected", "selected").html("---"));
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
				let newLastSelectedCatId = Number($(evt.currentTarget).val());
				this._updateCatHierarchyArray(newLastSelectedCatId);
			});
		}
	}

	_updateCatHierarchyArray(newLastSelectedCatId) {
		this.hierarchyArray.push(newLastSelectedCatId);
		this.$categorySelection.empty();
		this._traverseHierarchy(this.hierarchyArray);
		//Bind change event
		this._bindEventForSelectedCat();
		postAdFormMainDetails.setCategoryId(newLastSelectedCatId);
	}

	_bindEventForSelectedCat() {
		this.hierarchyArray.forEach((catId, index) => {
			// ignore level 0 (all Categories)
			if (catId !== 0) {
				let id = "#L" + index + "Category";
				$(id).change((evt) => {
					//Update category hierarchy Array length
					this.hierarchyArray.length = index;
					let newLastSelectedCatId = Number($(evt.currentTarget).val());
					this._updateCatHierarchyArray(newLastSelectedCatId);
				});
			}
		});
	}

	/**
	 * After image upload, update categoryId and imgUrl for post form
	 * @param categoryId
	 * @param imgUrl
	 */
	updateCategory(categoryId, imgUrl) {
		if (isNaN(categoryId)) {
			return;
		}
		this.hierarchyArray=[];
		this.$categorySelection.empty();
		this._getCategoryHierarchy(this.categoryTree, categoryId, this.hierarchyArray);
		this._traverseHierarchy(this.hierarchyArray);
		this._bindEventForSelectedCat();
		if (imgUrl !== "") {
			postAdFormMainDetails.addImgUrl(imgUrl);
		}
		if (categoryId !== 0) {
			postAdFormMainDetails.setCategoryId(categoryId);
			postAdFormMainDetails.showModal(); // Display only when category is settled
		}
	}
}

module.exports = new CategoryUpdateModal();



