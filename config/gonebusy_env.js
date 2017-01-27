const url = require('url');
const env = process.env;

const envToken = env['GONEBUSY_TOKEN'];
const envApiHost = env['GONEBUSY_API_HOST'];
const envApiPath = env['GONEBUSY_API_PATH'];
const envIsProxied = env['GONEBUSY_IS_PROXIED'];
const envProxyHost = env['GONEBUSY_PROXY_HOST'];

const is_proxied = !!(envIsProxied && JSON.parse(envIsProxied));

const clientApiEndpoint = url.resolve((is_proxied ? envProxyHost : envApiHost) || '', envApiPath);
const clientToken = is_proxied ? 'none' : envToken;

const middlewareProxyHost = is_proxied ? envApiHost : undefined;
const middlewareToken = is_proxied ? envToken : undefined;

module.exports = {
  client: {
    REACT_APP_API_ENDPOINT: clientApiEndpoint,
    REACT_APP_TOKEN: clientToken
  },
  middleware: {
    proxy: middlewareProxyHost,
    path: envApiPath,
    token: middlewareToken
  }
};
