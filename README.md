Airbitz Plugins
===============

## About

Plugins are HTML5 applications that can be easily loaded in the Airbitz mobile
wallet. The plugins utilize `airbitz-core.js` in order to securely store data,
generate bitcoin payment addresses and request spends from the user.

## Install dependencies

We are using git submodules, so make sure to initialize them on cloning the repo as

    git clone --recurse-submodules https://github.com/Airbitz/airbitz-plugins.git

If you forget to do so, you can do it afterwards with

    git submodule update --init --recursive

Install node on Ubuntu

    apt-get install nodejs

or on a Mac

    brew install node

Install node modules

    npm install gulp -g
    cd airbitz-plugins
    npm install

Check the available tasks

    gulp help

## API Documentation
[Airbitz Developer Website](https://developer.airbitz.co/plugins)
