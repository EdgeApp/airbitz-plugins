FROM node:6.9.5

RUN wget https://github.com/Yelp/dumb-init/releases/download/v1.1.3/dumb-init_1.1.3_amd64.deb && \
    echo '34995cf69c88311e9475b4d101186b1d5f4d653f222e41c6e5643ff4e6f56f54 *dumb-init_1.1.3_amd64.deb' | sha256sum -c --strict
RUN dpkg -i dumb-init_*.deb
ENTRYPOINT ["dumb-init"]

# Create app directory
RUN mkdir -p /usr/src/app

# Install app dependencies
RUN npm install -g webpack@1.14.0

WORKDIR /usr/src/app
RUN npm install