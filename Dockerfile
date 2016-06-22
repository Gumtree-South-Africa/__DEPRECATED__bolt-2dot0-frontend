FROM cs-registry-9425.slc01.dev.ebayc3.com:5000/bolt-docker

#####################################################################
# bolt-2dot0-frontend build and run app
#####################################################################

# Add node 
# Requires nodejs g++

# Add forever globally - to manage and monitor node process
RUN npm install -g forever
# Install gulp, node-gyp
RUN npm install -g gulp && \
    npm install -g node-gyp && \
    npm install -g raml-mockup

# Setup work directory
WORKDIR /src/bolt-2dot0-frontend/
# Bundle app source
COPY . /src/bolt-2dot0-frontend/

# Install app dependencies
RUN npm install --production

# Build
RUN gulp clean
RUN gulp build

# Port on which the app runs
EXPOSE 8000

# Set environment variables
ENV NODE_CONFIG_DIR     /src/bolt-2dot0-frontend/server/config
ENV NODE_ENV dockerdeploy
ENV BASEDOMAINSUFFIX `hostname`

CMD ["npm","run","dockerstart"]

ARG GIT_REV_FILE="unknown"
ADD ${GIT_REV_FILE} /tmp/
