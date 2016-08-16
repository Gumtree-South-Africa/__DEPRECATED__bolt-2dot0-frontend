'use strict';

let recentActivityService = require(process.cwd() + '/server/services/recentactivity');
let _ = require('underscore');

class RecentActivityModel {
	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;
	}

	isSold(feed) {
		return !(feed.action === 'LISTED');
	}

	filterArr(inputArr) {
		let filteredArr = [];
		for (let i = 0; i < inputArr.length; i++) {
			switch (inputArr[i].categoryId) {
				case 1097 :
					inputArr[i].attributes = _.filter(inputArr[i].attributes, function(attr) {
						return attr.name === 'DwellingType' || attr.name === 'NumberBedrooms';
					});
					if (inputArr[i].attributes.length) {
						let prefix1 = _.findWhere(inputArr[i].attributes, {name: 'DwellingType'});
						let prefix2 = _.findWhere(inputArr[i].attributes, {name: 'NumberBedrooms'});
						inputArr[i].prefix1 = 'una ' + prefix1.formattedValue;
						inputArr[i].prefix2 = 'con ' + prefix2.formattedValue + ' ' + prefix2.localizedName;
						filteredArr.push(inputArr[i]);
					}
					break;
				case 1089 :
					inputArr[i].attributes = _.filter(inputArr[i].attributes, function(attr) {
						return attr.name === 'CellPhoneType';
					});
					if (inputArr[i].attributes.length) {
						let prefix1 = _.findWhere(inputArr[i].attributes, {name: 'CellPhoneType'});
						inputArr[i].prefix1 = 'un ' + prefix1.formattedValue;
						inputArr[i].prefix2 = '';
						filteredArr.push(inputArr[i]);
					}
					break;
				case 6 :
					inputArr[i].attributes = _.filter(inputArr[i].attributes, function(attr) {
						return attr.name === 'ElectronicsType';
					});
					if (inputArr[i].attributes.length) {
						let prefix1 = _.findWhere(inputArr[i].attributes, {name: 'ElectronicsType'});
						inputArr[i].prefix1 = 'una ' + prefix1.formattedValue;
						inputArr[i].prefix2 = '';
						filteredArr.push(inputArr[i]);
					}
					break;
				case 65 :
					inputArr[i].attributes = _.filter(inputArr[i].attributes, function(attr) {
						return attr.name === 'AlmVehicleBrand' || attr.name === 'AlmVehicleModel';
					});
					if (inputArr[i].attributes.length) {
						let prefix1 = _.findWhere(inputArr[i].attributes, {name: 'AlmVehicleBrand'});
						let prefix2 = _.findWhere(inputArr[i].attributes, {name: 'AlmVehicleModel'});
						inputArr[i].prefix1 = 'un ' + prefix1.formattedValue;
						inputArr[i].prefix2 = prefix2.formattedValue;
						filteredArr.push(inputArr[i]);
					}
					break;
				case 9 :
					inputArr[i].attributes = _.filter(inputArr[i].attributes, function(attr) {
						return attr.name === 'FurnitureType';
					});
					if (inputArr[i].attributes.length) {
						let prefix1 = _.findWhere(inputArr[i].attributes, {name: 'FurnitureType'});
						inputArr[i].prefix1 = 'un ' + prefix1.formattedValue;
						inputArr[i].prefix2 = '';
						filteredArr.push(inputArr[i]);
					}
					break;
				case 1076 :
					inputArr[i].attributes = _.filter(inputArr[i].attributes, function(attr) {
						return attr.name === 'ApplianceType';
					});
					if (inputArr[i].attributes.length) {
						let prefix1 = _.findWhere(inputArr[i].attributes, {name: 'ApplianceType'});
						inputArr[i].prefix1 = 'un ' + prefix1.formattedValue;
						inputArr[i].prefix2 = '';
						filteredArr.push(inputArr[i]);
					}
					break;
				default :
					continue;
			}
		}
		return filteredArr;
	}

	shuffleArr(inputArr) {

		for (let i = inputArr.length - 1; i >= 0; i--) {

			let randomIndex = Math.floor(Math.random() * (i + 1));
			let itemAtIndex = inputArr[randomIndex];

			inputArr[randomIndex] = inputArr[i];
			inputArr[i] = itemAtIndex;
		}
		return inputArr;
	}

	getRecentActivities(geoLatLngObj) {
		return recentActivityService.getRecentActivities(this.bapiHeaderValues, geoLatLngObj).then((data) => {
			data.recent = [];

			data.filteredArr = [];
			data.filteredArr = this.filterArr(data.ads);

			data.shuffledArr = [];
			data.shuffledArr = this.shuffleArr(data.filteredArr);

			if (data.shuffledArr instanceof Array && data.shuffledArr.length > 2) {
				let feed1 = data.shuffledArr[0];
				feed1.renderSold = this.isSold(feed1);
				data.recent.push(feed1);

				let feed2 = data.shuffledArr[1];
				feed2.renderSold = this.isSold(feed2);
				data.recent.push(feed2);

				let feed3 = data.shuffledArr[2];
				feed3.renderSold = this.isSold(feed3);
				data.recent.push(feed3);
			}

			return data;
		});
	}
}

module.exports = RecentActivityModel;
