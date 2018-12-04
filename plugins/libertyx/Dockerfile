FROM node:10.12.0@sha256:00a7fb3df8e94ed24f42c2920f132f06e92ea5ed69b1c5e53c4bb3d20e85a3e2

# Create app directory
RUN mkdir -p /usr/src/app

# Install app dependencies
RUN npm install -g webpack@3.11.0

WORKDIR /usr/src/app