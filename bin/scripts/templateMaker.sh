./node_modules/handlebars/bin/handlebars app/templateStaging/*.hbs -c -p --output test/clientUnit/helpers/webTemplates.js

sed -i -e s/.hbs//g test/clientUnit/helpers/webTemplates.js
