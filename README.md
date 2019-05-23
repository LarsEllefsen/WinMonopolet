# WinMonopolet.com

all PR are welcome!

Note that the database included here is not the same as live, but intended for use in local development.

## Set up locally
1. `yarn install && cd client && yarn install`
2. Start backend: `node index.js`
3. start frontend: `cd client && yarn start`

The site uses the untappd-api to fetch beer info during the fetch/update routine, which runs nightly. 
If you wish to use this, go to `server/api.js` and change `clientID` and `clientSecret` with your own API key. If not the site will work normally, but will got be able to run the nightly update routine.
