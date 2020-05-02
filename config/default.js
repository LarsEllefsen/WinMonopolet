/*
  `config` (https://www.npmjs.com/package/config) uses this file and the other files within the config directory
  to change application parameters (less formally, "stuff") based on the application instance's node environment.
  For example, if `NODE_ENV=foo`, parameters will be loaded from this file and subsequently overwritten by values
  at the same path in `config/foo.js`. NODE_ENV is usually `development` (default) or `production`.

  If you are just getting familiar with `config`, make a copy of this file named `local.js`
  and overwrite values to see the effects immediately (as `config/local.js` will take precedence over both this file and any NODE_ENV specific file).
  Once you are more familiar with the tool, you can use differently named files and the load order documented in the `config` wiki
  (https://github.com/lorenwest/node-config/wiki/Configuration-Files) to tailor parameters to your development and deployment.

  Be careful to _never_ git commit files containing secrets (e.g. any actual value `untappd.clientSecret`).
*/

module.exports = {
  untappd: {
    clientID: 'your-api-key-here',
    clientSecret: 'your-client-secret-here',
  }
}
