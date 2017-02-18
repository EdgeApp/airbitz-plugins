# Airbitz LibertyX Plugin

Be sure to read the Airbitz plugin README first.

## Setup Webpack
1. Install Docker
2. `cd THIS_DIRECTORY`
3. `docker-compose run --build webpack npm install`
4. Update `airbitz-plugins/lib/js/config.js`:
```
LIBERTYX_LABEL = 'LibertyX';
LIBERTYX_CATEGORY = 'Exchange:Buy Bitcoin';
LIBERTYX_API_KEY = 'SECRETAPIKEY';
```

## Run the development server
1. `cd THIS_DIRECTORY`
2. `docker-compose up`
3. Navigate your web browser to `http://localhost:2127`

## Build for production
1. `cd THIS_DIRECTORY`
2. `docker-compose run webpack npm run-script deploy`
3. `index.html` is created in this directory, along with some javascript files
4. Now you can perform the Airbitz plugin build steps e.g. `gulp libertyx-ios`