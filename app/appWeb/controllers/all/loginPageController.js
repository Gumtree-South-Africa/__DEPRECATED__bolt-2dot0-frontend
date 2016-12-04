'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require('../../controllers/all/PageControllerUtil');
let pageTypeJson = require(`${cwd}/app/config/pagetype.json`);
let abTestPagesJson = require(`${cwd}/app/config/abtestpages.json`);
let LoginPageModel = require('../../../builders/page/LoginPageModel');
let passport = require('passport');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let AuthModel = require(cwd + '/app/builders/common/AuthModel');

let extendModelData = (req, modelData) => {
	modelData.header.pageType = modelData.pagename;
	modelData.header.pageTitle = modelData.seo.pageTitle;
	modelData.header.metaDescription = modelData.seo.description;
	modelData.header.metaRobots = modelData.seo.robots;
	modelData.header.canonical = modelData.header.homePageUrl;
	// CSS
	if (modelData.header.min) {
		modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/LoginPage.min.css');
	} else {
		modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/LoginPage.css');
	}
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'LoginPage_desktop_es_MX.js');
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'AnalyticsLegacyBundle.min.js');
};

router.get('/', (req, res, next) => {
	req.app.locals.pagetype = pageTypeJson.pagetype.LOGIN_PAGE;
	req.app.locals.abtestpage = abTestPagesJson.pages.L;
	let loginPageModel = new LoginPageModel(req, res);
	let redirectUrl = req.query.redirect;
	let showTerms = req.query.showTerms;
	let facebookToken = req.query.facebookToken;
	let email = req.query.email;
	let facebookId = req.query.facebookId;

	loginPageModel.populateData().then((modelData) => {
		extendModelData(req, modelData);
		modelData.header.distractionFree = true;
		modelData.footer.distractionFree = true;
		modelData.redirectUrl = redirectUrl;
		modelData.showTerms = showTerms;
		modelData.facebookToken = facebookToken;
		modelData.email = email;
		modelData.facebookId = facebookId;

		pageControllerUtil.postController(req, res, next, 'loginPage/views/hbs/loginPage_', modelData);
	}).fail((err) => {
		next(err);
	});
});

//Kick off initial redirect to facebook
router.get('/facebook', (req, res, next) => {
	let redirect = encodeURIComponent(req.query.redirect || '/');
	let callbackUrl = '/login/facebook/callback';
	if (redirect) {
		callbackUrl += `?redirect=${redirect}`;
	}
	passport.authenticate('facebook', {
		'callbackURL': callbackUrl,
		//TODO: scope params might need to change
		scope: ['user_about_me', 'email', 'publish_actions', 'public_profile']
	})(req, res, next);
});

//Callback after facebook oauth login
//Control comes back from the passport.use(new FacebookStrategy... callback
//done(error, userJson);
router.get('/facebook/callback', (req, res, next) => {
	let redirect = encodeURIComponent(req.query.redirect || '/');
	//TODO: match this url with facebook app config
	let callbackUrl = '/login/facebook/callback';
	if (redirect) {
		callbackUrl += `?redirect=${redirect}`;
	}
	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
	passport.authenticate('facebook', {
		'callbackURL': callbackUrl
	}, (err, user) => {
		if (err) {
			return next(err);
		}
		let email = user.email;
		let facebookToken = user.facebookToken;
		let facebookId = user.id;
		redirect = decodeURIComponent(redirect);
		model.authModel = new AuthModel(model.bapiHeaders);
		model.authModel.checkEmailExists(email).then((/* result */) => {
			//User exists, do something with result then redirect
			return model.authModel.loginViaFb({
				email: email,
				facebookToken: facebookToken,
				facebookId: facebookId
			});
		}).then((result) => {
			if (!result.accessToken) {
				let error = new Error(`bapi loginViaFb did not return access token, returning status 500`);
				console.error(error);
				return next(error);
			}
			// not setting expires or age so it will be a "session" cookie
			res.cookie('bt_auth', result.accessToken, { httpOnly: true });
			res.redirect(redirect);
		}).fail((error) => {
			if (error.statusCode === 404) {
				//User not found, redirect to terms
				return res.redirect(`/login?showTerms=true&facebookToken=${facebookToken}&facebookId=${facebookId}&email=${email}&redirect=${redirect}`);
			} else {
				next(error);
			}
		});
	})(req, res, next);
});

module.exports = router;
