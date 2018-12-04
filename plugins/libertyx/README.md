# Airbitz LibertyX Plugin

Be sure to read the Airbitz plugin README first.

## Setup Webpack
1. Install Docker
1. `cd airbitz-plugins/plugins/libertyx`
1. `docker-compose run --build webpack npm install`
1. `docker-compose run webpack gulp libertyx-dev` to generate the `lib` files, then press Ctrl+C to exit
1. Update `airbitz-plugins/lib/js/config.js` with the appropriate values:
```
BIZID = '';
LIBERTYX_LABEL = 'LibertyX';
LIBERTYX_CATEGORY = 'Exchange:Buy Bitcoin';
LIBERTYX_API_KEY = '';
LIBERTYX_GOOGLE_API_KEY = '';
```

## Run the development server
1. `cd airbitz-plugins/plugins/libertyx`
1. `docker-compose up`
1. Navigate your web browser to `http://localhost:2127`

## Build for production
1. `cd airbitz-plugins/plugins/libertyx`
1. `docker-compose run webpack npm run-script deploy`
1. `index.html` is created in this directory, along with some javascript files
1. Now you can perform the Airbitz plugin build steps e.g. `gulp libertyx-ios`