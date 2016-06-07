FROM    nodesource/node:trusty

# Setup work directory
RUN mkdir -p /src/bolt-2dot0-frontend
WORKDIR /src/bolt-2dot0-frontend

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
ENV NODE_CONFIG_DIR	/src/bolt-2dot0-frontend/server/config
ENV NODE_ENV vm
ENV BASEDOMAINSUFFIX localhost
ENV PORT 8000
ENV SSL_PORT 8443

# Start the Node Server
CMD npm run dockerstart