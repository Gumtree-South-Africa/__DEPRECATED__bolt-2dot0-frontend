'use strict';
let postFormCustomAttributes = require("app/appWeb/views/components/postFormCustomAttributes/js/postFormCustomAttributes.js");

class CategoryUpdateModal {
	initialize() {
		this.categoryTree = JSON.parse($("#category-tree").text() || "{}");
		this.$categorySelection = $("#category-selection");
		this.hierarchyArray = [];
		postFormCustomAttributes.initialize();
	}

	getCategoryHierarchy(node, leafId, stack) {
		if (node.id === leafId) {
			stack.unshift(node.id);
			return node.parentId;
		} else {
			for (let i = 0; i < node.children.length; i++) {
				if (node.id === this.getCategoryHierarchy(node.children[i], leafId, stack)) {
					stack.unshift(node.id);
					return node.parentId;
				}
			}
		}
	}

	traverseHierarchy(hierarchyArray) {
		let currentCategory = this.categoryTree;
		// for each value in the hierarchy array, we navigate down in the tree
		let categoryLevel = 1;
		hierarchyArray.forEach((catId) => {
			// ignore level 0 (all Categories)
			if (catId !== 0) {
				let nextLvCategory = {};
				let id = "L" + categoryLevel + "Category";
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
				categoryLevel++;
			}
		});
		// Display next level for selection
		if (currentCategory.children !== 'undefined' && currentCategory.children.length > 0) {
			let id = "L" + categoryLevel + "Category";
			let select = $(document.createElement('select')).attr("id", id).addClass("edit-ad-select-box");
			currentCategory.children.forEach((node) => {
				let option = $(document.createElement('option')).attr("value", node.id).html(node.localizedName);
				select.append(option);
			});
			this.$categorySelection.append(select);
		}
	}

	updateCategory(categoryId) {
		this.getCategoryHierarchy(this.categoryTree, categoryId, this.hierarchyArray);
		this.traverseHierarchy(this.hierarchyArray);
		postFormCustomAttributes.updateCustomAttributes(categoryId);
	}
}

module.exports = new CategoryUpdateModal();



