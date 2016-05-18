FROM cs-registry-9425.slc01.dev.ebayc3.com:5000/bolt-node-cislave

# Setup work directory
WORKDIR /src

# Bundle app source
COPY . /src

# Install app dependencies
RUN npm install --production

# Build
RUN gulp clean
RUN gulp build

# Port on which the app runs
EXPOSE 8000

CMD PM_CWD=/src NODE_CONFIG_DIR=/src/server/config NODE_ENV=vmdeploy LOG_DIR=/src PORT=8000 SSL_PORT=7443 BASEDOMAINSUFFIX=$VM_NAME forever start --append -l frontend-forever.log -o /src/out.log -e /src/error.log /src/bin/www
