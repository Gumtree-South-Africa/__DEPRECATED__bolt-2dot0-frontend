bolt-2.0-frontend
=================

# bolt-2.0-frontend Server

bolt-2.0-frontend projects with NodeJS Platform


## Dev Mode

```
git clone git@github.corp.ebay.com:ecg-global/bolt-2dot0-frontend.git
cd bolt-2dot0-frontend
npm run dev
```

## Quick deploy

```
git clone git@github.corp.ebay.com:ecg-global/bolt-2dot0-frontend.git
cd bolt-2dot0-frontend
npm run build
DEBUG=bolt-2dot0-frontend:* npm start
```

Then access:
http://www.vivanuncios.com.mx.localhost:8000
http://www.gumtree.co.za.localhost:8000


## Running linters separately
```
gulp jshint 
gulp jsonlint
```

## Development

### Starting the development server

The first time you make a development build it is required that you build the styles and and the precompiled template.

```
[sudo] npm install
bower install
```

or

```
npm run dev
```

```npm run dev``` performs a quick development build and start a development Node+Express server. The develop task 'finishes' with a watcher. It will listen for all source changes and re run all needed build steps.

**HEADS UP: A linter is run at every code change and your changes might not be visible if it fails!**


### Process differences
Gulp automates building during development, meaning that when a source file changes it will trigger an automatic 'rebuild' when it applies.

Below are some of the tasks that get triggered on source changes. [All watchers/tasks are defined here]('gulfile.js')

- BE JS files
    - Will trigger a linter for JS files and refresh the Node server
- FE JS files
    - Will trigger a linter for JS files, rebuild all the modules for that page and refresh the Node server
- Precompilation files
    - Will precompile HTML files, process ```gulp precompile``` dependencies imports and refresh the Node server
- SASS files
    - Will run the ```gulp styles``` tasks in paralell and apply the run CSS post-processor

#### Dependencies

FE dependencies are managed using [Bower](http://bower.io). BE's and Gulp's are managed by [npm](http://npmjs.org).

#### Create a Component 
To do so:
You will have to run the ```gulp component -n [name-of-the-component]``` tasks and it will create a base folder structure for that component under ./app/views/components


