
/**
 * @module server
 * @requires module:utils~Formatter
 */

(/** @lends module:server */function(){

var fs      = require('fs');
var restify = require('restify');
var http    = require('http');
var fmt     = require('../utils/formatter');
var filter  = require('./logfilter');
var msg     = require('./msg');

var name = 'server';

var defAddress    = '127.0.0.1';
var defHostname   = 'localhost';
var defOpenPort   = 8080;
var defSecurePort = 8081;

/**
 * Constructs a restify based HTTP server.
 *
 * @constructor
 * @param {Object} config                  - a server configuration object
 * @param {String} config.basedir          - the base directory of the server
 * @param {String} [config.address]        - IP address to bind
 * @param {String} [config.hostname]       - hostname to bind
 * @param {String} [config.open_port]      - tcp port to bind
 * @param {String} [config.secure_port]    - tls port to bind
 * @param {Object} [config.https]          - https configuration object
 * @param {String} config.https.key        - location of https private key
 * @param {String} config.https.cert       - location of https certificate
 * @param {String} config.static.directory - location of static content
 */

function Server(config, logger) {
  var that = this;

  // Grab a configuration if present ...
  // ... otherwise supply a default configuration
  this.config = config[name] || {
    address:     defAddress,
    hostname:    defHostname,
    open_port:   defOpenPort,
    secure_port: defSecurePort
  };

  this.logger = logger.addLog(name);

  // Set default values in case where passed config is deficient
  this.config.address     = this.config.address     || defAddress;
  this.config.hostname    = this.config.hostname    || defHostname;
  this.config.open_port   = this.config.open_port   || defOpenPort;
  this.config.secure_port = this.config.secure_port || defSecurePort;
  this.config.protocol    = this.config.production ? 'https' : 'http';

  // Create and configure a server instance
  this.server = restify.createServer()
    .use(restify.jsonp())
    .use(restify.gzipResponse())
    .use(restify.bodyParser());

  this.running = false;
}
exports.Server = Server;

/**
 * @callback httpCallback
 * @param {Object} req    - nodejs HTTP request object
 * @param {Object} res    - nodejs HTTP response object
 * @param {Function} next - function to envoke next http handler in chain
 */

/**
 * Registers a handler with the server to use for all HTTP reqeuests
 * where the method and path match their respective parts from the
 * request-url.
 *
 * @param {String} method        - HTTP method to catpure
 * @param {String} path          - the relative path of the handler
 * @param {httpCallback} handler - HTTP request handler to call
 * @returns {Server} a reference to the object instance
 */
Server.prototype.addHandler = function(method, path, handler) {
  this.logger.info('Adding Handler: %s %s', method, path);
  switch(method) {
    case 'post':
    case 'get':
    case 'put':
    case 'del':
      this.server[method](this.rootPath() + path, handler);
      break;
    case '*':
      this.server.use(handler);
      break;
    default:
      throw 'Bad server handler: ' + method + ' ' + path + ' ' + handler;
  }
  return this;
};

Server.prototype.addModule = function(mod) {
  mod.load(this);
  return this;
};

/**
 * Returns the base url for the running server.
 *
 * @returns {String} protocol://hostname:port
 */
Server.prototype.baseUrl = function() {
  var bp = this.https ? this.config.secure_port : this.config.open_port;
  return this.config.protocol + '://' + this.config.hostname;// + ':' + bp;
};

/**
 * Returns the path root of the server
 *
 * @returns {String} path root of server
 */
Server.prototype.rootPath = function() {
  return this.config.root + '/';
};

/**
 * Starts the server
 *
 * @returns {Server} returns a self reference
 */
Server.prototype.run = function() {
  var notFound;

  // Log all request before hitting handler
  this.server.pre(filter.requestLogger({
    log: this.logger,
    body: true
  }));

  // Log response after request hits handler
  this.server.on('after', filter.responseLogger({
    log: this.logger,
    body: true
  }));

  this.server.on('NotFound', function(req, res) {
    res.end(msg.routeDoesNotExist(req.url));
  });

  if(this.config.static) {
    this.server.get(this.config.static.mount+'.*', restify.serveStatic(
      {
        directory: this.config.static.directory,
        default: 'index.html'
      }
    ));
  }

  // start the primary server
  this.server.listen(this.config.open_port, this.config.address);

  this.running = true;
  this.logger.info('Started Flowsim');
  return this;
};

/**
 * A formatter implementation for the Server.
 *
 * @param {module:utils~Formatter} f - formatter object to use
 * @returns {module:utils~Formatter} a reference to the active formatter
 */
Server.prototype.toFormatter = function(f) {
  f.begin('Server');
  f.addPair('Address', this.config.address);
  f.addPair('Hostname', this.config.hostname);
  f.addPair('TCP Port', this.config.open_port);
  if(this.config.https) {
    f.addPair('TLS Port', this.config.secure_port);
  }
  f.addPair('Protocol', this.config.protocol);
  if(this.config.https) {
    f.addPair('Key', this.config.https.key);
    f.addPair('Cert', this.config.https.cert);
  }
  if(this.config.static) {
    f.addPair('Static', this.config.static.directory);
  }
  f.addPair('Running', this.running);
  f.end();
  return f;
};

/**
 * Attach the basic formatter.toString funcitonality.
 *
 * @returns {String} a stringified version of the Server.
 */
Server.prototype.toString = fmt.toString;

})();
