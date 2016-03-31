bolt-2.0-frontend
=================




## Installation Tasks

### NodeJS
Bolt requires NodeJS v4.2.1 installed globally

#### Mac
Download and Install NodeJS pkg from [here](http://nodejs.org/dist/v4.2.1/node-v4.2.1.pkg)

    $ sudo npm install -g grunt-cli
    $ sudo chown -R `whoami` ~/.npm

#### Windows
Download and install NodeJS from [here](http://nodejs.org/dist/v4.2.1/node-v4.2.1-x86.msi)

    $ npm install -g grunt-cli

If you're having issues with "node-gyp":
   1. Install python 2.7 and make sure it's in your path.
   2. Uninstall any previous version of Visual C++ / Windows SDK 7
   3. [Install  Visual C++ 2010 Express](http://www.microsoft.com/visualstudio/eng/downloads#d-2010-express)
   4. If you still have issues, check [here](https://github.com/TooTallNate/node-gyp/wiki/Visual-Studio-2010-Setup)


### Compass and Susy

Compass and Susy are required to generate static files. Ruby and Ruby gems have to be installed before that.

#### Ruby and Ruby Gems

##### Mac
Since Mac OS Leopard, Ruby and Ruby Gems are installed as part of the operating system.

If you have an error while installing the gems like this
    /System/Library/Frameworks/Ruby.framework/Versions/2.0/usr/bin/ruby extconf.rb
mkmf.rb can't find header files for ruby at /System/Library/Frameworks/Ruby.framework/Versions/2.0/usr/lib/ruby/include/ruby.h

Follow the following steps to reinstall Ruby on Mac:

1. Install X-Code from App Store
2. Install Brew from terminal: ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
3. From the terminal install Ruby: brew install ruby
4. Add the installed ruby to path. For example for ruby 2.1.5 use: export PATH=/usr/local/Cellar/ruby/2.1.5/bin:$PATH
5. Check that the proper Ruby version is being used: ruby -v

##### Windows
Download and install Ruby installer from [here](http://rubyinstaller.org/downloads/)

#### Compass
    gem install compass -v 1.0.1 --source http://rubygems.org

#### Susy
    gem install susy -v 1.0.9 --source http://rubygems.org




## Development Tasks

### Starting the development server with bower

The first time you make a development build it is required that you build the styles and and the precompiled template.

```
[sudo] npm install
gulp
```


### Running linters separately
```
gulp jshint
gulp jsonlint
```
**HEADS UP: A linter is run at every code change and your changes might not be visible if it fails!**


### Process differences
Gulp automates building during development, meaning that when a source file changes it will trigger an automatic 'rebuild' when it applies.

Below are some of the tasks that get triggered on source changes. [All watchers/tasks are defined here](gulpfile.js)

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




## Execution Tasks

### Dev Mode (Run app with Local BAPI Server)

```
git clone git@github.corp.ebay.com:ecg-global/bolt-2dot0-frontend.git
cd bolt-2dot0-frontend
npm run dev
```

### Mock Mode (Run app with Mock BAPI Server)

```
git clone git@github.corp.ebay.com:ecg-global/bolt-2dot0-frontend.git
cd bolt-2dot0-frontend
npm run dev
```

### VM Mode (Run app with VM BAPI Server, VM details specidied in vm.json)
As of now, add below VM to host file:
10.65.201.202   api.bolt.ecg.ebay.com.sharon-fp003-4464.slc01.dev.ebayc3.com

```
git clone git@github.corp.ebay.com:ecg-global/bolt-2dot0-frontend.git
cd bolt-2dot0-frontend
npm run vm
```

### Quick deploy

```
git clone git@github.corp.ebay.com:ecg-global/bolt-2dot0-frontend.git
cd bolt-2dot0-frontend
npm run build
DEBUG=bolt-2dot0-frontend:* npm start
```

### Starting the development server in Production Mode (by setting up environment variables, and clustering the node server)

```
npm run envstart

OR
(If need only one site to come up)
SITES=en_ZA NODE_CONFIG_DIR=./server/config BASEDOMAINSUFFIX=localhost NODE_ENV=vm PORT=8000 node ./bin/www

OR
(If need to specify the current working directory)
SITES=en_ZA PM_CWD=/BOLTVM/b1frontend/bolt-2dot0-frontend NODE_CONFIG_DIR=/BOLTVM/b1frontend/bolt-2dot0-frontend/server/config BASEDOMAINSUFFIX=localhost NODE_ENV=vm PORT=8000 node ./bin/www

OR
(If you want to just run the server using start/stop scripts)
# Add this to your ~/.profile file #
export GIT_BOLT20_DIR=/Users/vrajendiran/Documents/Dev/bolt-2dot0-frontend
# Start Server #
./start.sh
# Stop Server #
./stop.sh
```

```npm run <mode>``` performs a quick development build and start a development Node+Express server. The task 'finishes' with a watcher. It will listen for all source changes and re run all needed build steps.

### Accessing App
http://www.vivanuncios.com.mx.localhost:8000
http://www.gumtree.co.za.localhost:8000



## Deployment Tasks

### Deploy in VM
```
Using pm2

pm2 stop frontend
PM_CWD=/opt/nodejs/bolt-2dot0-frontend/active NODE_CONFIG_DIR=/opt/nodejs/bolt-2dot0-frontend/active/server/config NODE_ENV=vmdeploy NODE_APP_INSTANCE=null PORT=8000 BASEDOMAINSUFFIX=lb-frontend-v7gff.ebayc3.com pm2 start /opt/nodejs/bolt-2dot0-frontend/active/bin/www --name "frontend" --log-date-format "YYYY-MM-DD HH:mm Z" -o /opt/nodejs/bolt-2dot0-frontend/active/out.log -e /opt/nodejs/bolt-2dot0-frontend/active/error.log
```

### Deploy in PP
```
Using pm2

pm2 stop frontend
PM_CWD=/opt/nodejs/bolt-2dot0-frontend/active NODE_CONFIG_DIR=/opt/nodejs/bolt-2dot0-frontend/active/server/config NODE_ENV=ppdeploy NODE_APP_INSTANCE=null PORT=8000 BASEDOMAINSUFFIX=lb-frontend-v7gff.ebayc3.com pm2 start /opt/nodejs/bolt-2dot0-frontend/active/bin/www --name "frontend" --log-date-format "YYYY-MM-DD HH:mm Z" -o /opt/nodejs/bolt-2dot0-frontend/active/out.log -e /opt/nodejs/bolt-2dot0-frontend/active/error.log
```

### Deploy in LnP
```
Using pm2

pm2 stop frontend
PM_CWD=/opt/nodejs/bolt-2dot0-frontend/active NODE_CONFIG_DIR=/opt/nodejs/bolt-2dot0-frontend/active/server/config NODE_ENV=lnpdeploy NODE_APP_INSTANCE=null PORT=8000 BASEDOMAINSUFFIX=lb-frontend-v7gff.ebayc3.com pm2 start /opt/nodejs/bolt-2dot0-frontend/active/bin/www --name "frontend" --log-date-format "YYYY-MM-DD HH:mm Z" -o /opt/nodejs/bolt-2dot0-frontend/active/out.log -e /opt/nodejs/bolt-2dot0-frontend/active/error.log
```
