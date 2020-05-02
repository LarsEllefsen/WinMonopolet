# WinMonopolet.com

all PR are welcome!

Note that the database included here is not the same as live, but intended for use in local development.

## Running the dev server
1. `yarn install && cd client && yarn install`
2. Start backend: `node index.js`
3. start frontend (Optional, front-end is also served through node): `cd client && yarn start`

**Note:** If you are having trouble installing, make sure to use Node version 10. 
You can assure this by installing the [ASDF version manager](https://asdf-vm.com/) 
and running `asdf install` before repeating the steps above.

## Fetching data from Untappd
The site uses the Untappd API to fetch beer info during the fetch/update routine, which runs nightly.

To run this routine locally or in your own deployment, 
you first have to apply for an API key on [Untappd's registration page](https://untappd.com/api/register).
(Be aware that Untappd manually reviews your application, so receiving them may take days or weeks.)
When you receive the keys, you can test them by making a copy of `config/default.js` called `local.js`;
the easiest way is to run `cp config/default.js config/local.js`. Afterwards, open `config/local.js` 
and replace `untappd.clientID` and `untappd.clientSecret`. 

Note: If you do not have an API key, you can still use all parts of the site normally,
but you will not be able to run the update routine.
