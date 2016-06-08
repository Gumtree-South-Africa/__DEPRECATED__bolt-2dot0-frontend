# Setup Ruby
FROM ruby:2.0.0

# Environment Variables
ENV RUBY_VERSION 2.0.0
ENV COMPASS_VERSION 1.0.1
ENV SUSY_VERSION 1.0.9
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 4.0.0

# Install ruby, rubygems
RUN curl -sSL https://rvm.io/mpapis.asc | gpg --import
RUN curl -L https://get.rvm.io | bash -s stable --rails --autolibs=enabled --ruby=$RUBY_VERSION
RUN gem install compass -v $COMPASS_VERSION --source http://rubygems.org && \
    gem install susy -v $SUSY_VERSION --source http://rubygems.org


# Setup work directory
RUN mkdir -p /src/bolt-2dot0-frontend
WORKDIR /src/bolt-2dot0-frontend

# Bundle app source
COPY . /src/bolt-2dot0-frontend/


# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash
RUN /bin/bash -c "source $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    nvm use default"

# Install gulp, node-gyp
RUN npm install -g gulp && \
    npm install -g node-gyp

# Install app dependencies
RUN npm install --production


# Build
RUN gulp clean
RUN gulp build


# Port on which the app runs
EXPOSE 8000


# Set environment variables
ENV NODE_CONFIG_DIR     /src/bolt-2dot0-frontend/server/config
ENV NODE_ENV vm
ENV BASEDOMAINSUFFIX localhost
ENV PORT 8000
ENV SSL_PORT 8443


# Start the Node Server
CMD npm run dockerstart