'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createClient;

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BASE_URL = 'http://buscacursos.uc.cl';

function createClient(_ref) {
  var baseUrl = _ref.baseUrl;
  var fetch = _ref.fetch;
  var $ = _ref.$;

  return new _client2.default(baseUrl || BASE_URL, fetch, $);
}