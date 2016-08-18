./node_modules/handlebars/bin/handlebars app/templateStaging/*.hbs -c -p --output $1

sed -i -e s/.hbs//g $1
