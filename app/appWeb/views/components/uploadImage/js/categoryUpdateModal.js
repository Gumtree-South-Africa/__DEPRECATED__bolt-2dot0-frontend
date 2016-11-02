'use strict';
let postAdFormMainDetails = require("app/appWeb/views/components/postAdFormMainDetails/js/postAdFormMainDetails.js");

class CategoryUpdateModal {
	initialize() {
		this.categoryTree = JSON.parse($("#category-tree").text() || "{}");
		this.$categorySelection = $("#category-selection");
		this.hierarchyArray = [];
		postAdFormMainDetails.initialize();
	}

	_getCategoryHierarchy(node, leafId, stack) {
		if (node.id === leafId) {
			stack.unshift(node.id);
			return node.parentId;
		} else {
			for (let i = 0; i < node.children.length; i++) {
				if (node.id === this._getCategoryHierarchy(node.children[i], leafId, stack)) {
					stack.unshift(node.id);
					return node.parentId;
				}
			}
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
				this.$categorySelection.append(select);
				currentCategory = nextLvCategory;
			}
		});
		// Display next level for selection
		if (currentCategory.children !== 'undefined' && currentCategory.children.length > 0) {
			let id = "L" + hierarchyArray.length + "Category";
			let select = $(document.createElement('select')).attr("id", id).addClass("edit-ad-select-box");
			select.append($(document.createElement('option')).attr("value", "").attr("selected", "selected").html("---"));
			currentCategory.children.forEach((node) => {
				let option = $(document.createElement('option')).attr("value", node.id).html(node.localizedName);
				select.append(option);
			});
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

	updateCategory(categoryId, imgUrl) {
		this._getCategoryHierarchy(this.categoryTree, categoryId, this.hierarchyArray);
		this._traverseHierarchy(this.hierarchyArray);
		this._bindEventForSelectedCat();
		postAdFormMainDetails.setImgUrl(imgUrl);
		postAdFormMainDetails.setCategoryId(categoryId);
		postAdFormMainDetails.showModal();
	}
}

module.exports = new CategoryUpdateModal();



