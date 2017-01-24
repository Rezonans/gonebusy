const url = require('url');
const env = process.env;
const reactAppServiceId = env['REACT_APP_SERVICE_ID'];
const reactAppGonebusyToken = env['REACT_APP_GONEBUSY_TOKEN'];
const gonebusyApiHost = env['REACT_APP_API_HOST'];
const gonebusyApiPath = env['REACT_APP_API_PATH'];
const gonebusyIsProxied = env['REACT_APP_IS_PROXIED'];
const gonebusyProxyHost = env['REACT_APP_PROXY_HOST'];

const is_proxied = !!(gonebusyIsProxied && JSON.parse(gonebusyIsProxied));

const clientApiEndpoint = url.resolve((is_proxied ? gonebusyProxyHost : gonebusyApiHost) || '', gonebusyApiPath);
const clientToken = is_proxied ? 'none' : reactAppGonebusyToken;
const middlewareProxyHost = is_proxied ? gonebusyApiHost : undefined;
const middlewareToken = is_proxied ? reactAppGonebusyToken : undefined;

console.log("to change the way we process .env so that it won't appear in plain JS", is_proxied);

module.exports = {
  service_id: reactAppServiceId,
  clientApiEndpoint,
  clientToken,
  middlewareProxyHost,
  middlewarePath: gonebusyApiPath,
  middlewareToken,
};
