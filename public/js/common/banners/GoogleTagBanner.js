var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

var BOLT = BOLT || {};
(function(B) {
	B.displayBanner = function(bannerParams) {
		googletag.cmd.push(function() {

			var slot = googletag.defineSlot(bannerParams.accId, bannerParams.slotDim, bannerParams.slotId);

			if (bannerParams.pos) {
				slot.setTargeting("pos", bannerParams.pos);
			}
			if (bannerParams.pf) {
				slot.setTargeting("pf", bannerParams.pf);
			}
			if (bannerParams.tile) {
				slot.setTargeting("tile", bannerParams.tile);
			}
			if (bannerParams.price) {
				slot.setTargeting("price", bannerParams.price);
				slot.setTargeting("currency", bannerParams.currency);
			}

			slot.addService(googletag.pubads())
				.setTargeting("loc", bannerParams.loc)
				.setTargeting("kw", bannerParams.kw)
				.setTargeting("dc_ref", bannerParams.dc_ref)
				.setTargeting("ptype", bannerParams.ptype)

			googletag.pubads();

			googletag.enableServices();

			if (bannerParams.slotRenderEnded_callback) {
				googletag.pubads().addEventListener('slotRenderEnded', function(event) {
					bannerParams.slotRenderEnded_callback(event, slot);
				});
			}

		});

		googletag.cmd.push(function() {
			googletag.display(bannerParams.slotId);
		});
	};

	B.displaySkinCampaign = function(bannerParams) {
		googletag.cmd.push(function() {
			googletag.defineSlot(bannerParams.accId, bannerParams.slotDim, bannerParams.slotId);
			googletag.defineOutOfPageSlot(bannerParams.accId, bannerParams.slotId).addService(googletag.pubads())
				.setTargeting("loc", bannerParams.loc)
				.setTargeting("kw", bannerParams.kw)
				.setTargeting("dc_ref", bannerParams.dc_ref)
				.setTargeting("ptype", bannerParams.ptype)
				.setTargeting("tile", bannerParams.tile)
				.setTargeting("pos", bannerParams.pos)

			googletag.enableServices();
		});

		googletag.cmd.push(function() {
			googletag.display(bannerParams.slotId);
		});

	}

	function createCloseButton() {

		var closeBtn = "";
		closeBtn.on("click", function(e) {
			e.stopImmediatePropagation();
			e.preventDefault();
			wrapper.addClass('hidden');
		});
		var wrapper = $("#" + bannerParams.slotId).parent();
		wrapper.removeClass("hidden").append(closeBtn);

	}

})(BOLT);
