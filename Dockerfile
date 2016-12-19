FROM dockerregistry-5131.slc01.dev.ebayc3.com:5000/bolt-docker

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
    npm install -g raml-mockup && \
    npm install -g karma-chrome-launcher --save-dev && \
    npm install -g phantomjs@1.9.20

# Install chromium, xvfb for karam test 
RUN apt-get update && \
    apt-get install -qqy --no-install-recommends \
    Xvfb\
    chromium-browser && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
ENV CHROME_BIN /usr/bin/chromium-browser
ADD ./bin/CI/xvfb.sh /etc/init.d/xvfb
ENV DISPLAY :99.0

# Setup work directory
WORKDIR /src/bolt-2dot0-frontend/
# Bundle app source
COPY . /src/bolt-2dot0-frontend/

# Install app dependencies
# When this image goto production, we only do npm install --production

# (TODO) get unicode.txt https://github.com/dodo/node-unicodetable
RUN wget http://unicode.org/Public/UNIDATA/UnicodeData.txt
ENV NODE_UNICODETABLE_UNICODEDATA_TXT /src/bolt-2dot0-frontend/UnicodeData.txt
RUN rm -rf /src/bolt-2dot0-frontend/node_modules
RUN npm install

# Build
RUN gulp clean
RUN gulp build

# Port on which the app runs
EXPOSE 8000

# Set environment variables
ENV NODE_CONFIG_DIR     /src/bolt-2dot0-frontend/server/config
ENV NODE_ENV dockerdeploy
ENV BASEDOMAINSUFFIX `hostname`

CMD ["/bin/bash"]

ARG GIT_REV_FILE="unknown"
ADD ${GIT_REV_FILE} /tmp/
