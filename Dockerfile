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

CMD [ "npm", "start" ]
