'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _qs = require('qs');

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _transform = require('lodash/transform');

var _transform2 = _interopRequireDefault(_transform);

var _trim = require('lodash/trim');

var _trim2 = _interopRequireDefault(_trim);

var _split = require('lodash/split');

var _split2 = _interopRequireDefault(_split);

var _startsWith = require('lodash/startsWith');

var _startsWith2 = _interopRequireDefault(_startsWith);

var _endsWith = require('lodash/endsWith');

var _endsWith2 = _interopRequireDefault(_endsWith);

var _sanitizer = require('./sanitizer');

var _sanitizer2 = _interopRequireDefault(_sanitizer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BuscaCursosClient = function () {
  function BuscaCursosClient(baseUrl, fetch, $) {
    _classCallCheck(this, BuscaCursosClient);

    this.baseUrl = baseUrl;
    this.fetch = fetch;
    this.$ = $;
    this.sanitizer = new _sanitizer2.default($);
  }

  _createClass(BuscaCursosClient, [{
    key: 'parse',
    value: function parse(html) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      // Allow custom loading of HTML
      if (options.load) {
        return options.load(html);
      }
      return this.$('<div/>').html(html).contents();
    }
  }, {
    key: 'request',
    value: function request(url, query, options) {
      var querystring = (0, _qs.stringify)(query);
      var fetch = this.fetch;
      return fetch(url + '?' + querystring, _extends({
        method: 'GET',
        mode: 'no-cors'
      }, options)).then(function (response) {
        return response.text();
      });
    }
  }, {
    key: 'requestCourses',
    value: function requestCourses() {
      var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return this.request(this.baseUrl, query, options);
    }
  }, {
    key: 'requestInformation',
    value: function requestInformation(_ref) {
      var year = _ref.year;
      var period = _ref.period;
      var initials = _ref.initials;
      var section = _ref.section;
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var query = {
        semestre: year + '-' + period,
        sigla: initials,
        seccion: section
      };
      var url = this.baseUrl + '/informacionCurso.ajax.php';
      return this.request(url, query, options);
    }
  }, {
    key: 'requestRequisites',
    value: function requestRequisites(_ref2) {
      var initials = _ref2.initials;
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var query = {
        tmpl: 'component',
        option: 'com_catalogo',
        view: 'requisitos',
        sigla: initials
      };
      var url = 'http://catalogo.uc.cl/index.php';
      return this.request(url, query, options);
    }
  }, {
    key: 'getCourses',
    value: function getCourses(query) {
      var _this = this;

      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      // eslint-disable-next-line
      var _split$map = (0, _split2.default)(query['cxml_semestre'], '-').map(Number);

      var _split$map2 = _slicedToArray(_split$map, 2);

      var year = _split$map2[0];
      var period = _split$map2[1];

      var params = { year: year, period: period };

      var fetching = options.fetching;
      var parsing = options.parsing;


      return this.requestCourses(query, fetching).then(function (html) {
        return _this.parse(html, parsing);
      }).then(function ($document) {
        return _this.processCourses($document, params);
      });
    }
  }, {
    key: 'getInformation',
    value: function getInformation(_ref3) {
      var _this2 = this;

      var year = _ref3.year;
      var period = _ref3.period;
      var initials = _ref3.initials;
      var section = _ref3.section;
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return this.requestInformation({ year: year, period: period, initials: initials, section: section }).then(function (html) {
        return _this2.parse(html);
      }).then(function ($document) {
        return _this2.processInformation($document);
      });
    }
  }, {
    key: 'getRequisites',
    value: function getRequisites(course) {
      var _this3 = this;

      return this.requestRequisites(course).then(function (html) {
        return _this3.parse(html);
      }).then(function ($document) {
        return _this3.processRequisites($document);
      });
    }
  }, {
    key: 'processCourses',
    value: function processCourses($document) {
      var _this4 = this;

      var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
      var sanitizer = this.sanitizer;
      var $ = this.$;


      var $last = $document.find('body > div:nth-child(9) > table').first();

      // Empty results
      if ($last.length === 0) return [];

      var $table = $last.children('tr');

      var school = null;
      var entities = [];

      $table.each(function (index, element) {
        var $row = $(element);

        // Check if this row is a course entity
        if ($row.hasClass('resultadosRowImpar') || $row.hasClass('resultadosRowPar')) {
          var entity = _this4.processRow($row, _extends({}, params, { school: school }));
          entities.push(entity);

          // Check the number of children to determine if this is the academic school or info headers
        } else if ($row.children().length === 1) {
          school = sanitizer.text($row.find('td').first());

          // this row has table "headers"
        } else {
            // TODO: get values
          }
      });

      return entities;
    }
  }, {
    key: 'processRow',
    value: function processRow($row) {
      var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
      var sanitizer = this.sanitizer;


      var $columns = $row.children('td');

      var NRC = sanitizer.text($columns.eq(0));
      var initials = sanitizer.text($columns.eq(1));
      var droppable = sanitizer.boolean($columns.eq(2));
      var english = sanitizer.boolean($columns.eq(3));
      var section = sanitizer.number($columns.eq(4));
      var specialApproval = sanitizer.boolean($columns.eq(5));
      var category = sanitizer.text($columns.eq(6));
      var name = sanitizer.text($columns.eq(7));
      var campus = sanitizer.text($columns.eq(9));
      var credits = sanitizer.text($columns.eq(10));
      var vacancy = {
        total: sanitizer.number($columns.eq(11)),
        available: sanitizer.number($columns.eq(12))
      };
      var schedule = this.processScheduler($columns.eq(14), campus);

      var entity = _extends({}, params, {
        NRC: NRC,
        initials: initials,
        droppable: droppable,
        english: english,
        section: section,
        specialApproval: specialApproval,
        category: category,
        name: name,
        campus: campus,
        credits: credits,
        vacancy: vacancy,
        schedule: schedule
      });
      var teachers = this.processTeacher($columns.eq(8), entity);
      return (0, _merge2.default)(entity, { teachers: teachers });
    }
  }, {
    key: 'processScheduler',
    value: function processScheduler($schedule) {
      var campus = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      // Special cases: http://buscacursos.uc.cl/?cxml_semestre=2016-1&cxml_sigla=ENF2512
      // M-W-J-V:1,2,3  CLAS  J4
      // M-W-J:4,5  CLAS  J4

      var sanitizer = this.sanitizer;
      var $ = this.$;

      var normalized = {};
      var raw = [];

      var $rows = $schedule.find('table').first().find('tr');
      $rows.each(function (index, element) {
        var $columns = $(element).children('td');

        var type = sanitizer.text($columns.eq(1));
        var when = sanitizer.text($columns.eq(0));
        var where = sanitizer.text($columns.eq(2));

        raw.push({ type: type, when: when, where: where });

        var _when$split$map = when.split(':').map(function (part) {
          return (0, _split2.default)(part, /[,-]+/);
        });

        var _when$split$map2 = _slicedToArray(_when$split$map, 2);

        var days = _when$split$map2[0];
        var hours = _when$split$map2[1];

        // See: https://lodash.com/docs#transform

        var updater = (0, _transform2.default)(days, function (daysAccumulator, day) {
          daysAccumulator[day] = (0, _transform2.default)(hours, function (hoursAccumulator, hour) {
            // eslint-disable-line
            hoursAccumulator[hour] = { type: type, classroom: where, campus: campus }; // eslint-disable-line
          }, {});
        }, {});

        (0, _merge2.default)(normalized, updater); // this mutates 'normalized'
      });

      // See: https://lodash.com/docs#transform
      var schematic = (0, _transform2.default)(normalized, function (accumulator, hours, day) {
        return (// hours is an object
          accumulator.push({
            day: day,
            hours: (0, _transform2.default)(hours, function (acc, module, hour) {
              return acc.push({ hour: hour, module: module });
            }, [])
          })
        );
      }, []);

      return { raw: raw, schematic: schematic, normalized: normalized };
    }
  }, {
    key: 'processTeacher',
    value: function processTeacher($teacher, _ref4) {
      var _this5 = this;

      var year = _ref4.year;
      var period = _ref4.period;
      var initials = _ref4.initials;
      var section = _ref4.section;
      var sanitizer = this.sanitizer;


      return sanitizer.text($teacher).split(',').map(_trim2.default).map(function (name) {
        var querystring = (0, _qs.stringify)({
          nombre: name,
          semestre: year + '-' + period,
          sigla: initials,
          seccion: section
        });
        return {
          name: name,
          photoUrl: _this5.baseUrl + '/getFotoProfe.db.php?' + querystring
        };
      });
    }
  }, {
    key: 'processInformation',
    value: function processInformation($document) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var $info = $document.find('div > div:nth-child(1) > div:nth-child(1)');
      return this.sanitizer.text($info);
    }
  }, {
    key: 'processRequisites',
    value: function processRequisites($document) {
      var sanitizer = this.sanitizer;
      var $ = this.$;


      var $contentpane = $document.find('body > div.contentpane');
      var $pre = $contentpane.find('div:nth-child(2) > table').first();
      var $eq = $contentpane.find('div:nth-child(4) > table').first();

      var pre = [];
      $pre.children('tr').each(function (index, element) {
        var $tr = $(element);
        var $td = $tr.find('td:nth-child(2)');
        pre.push(sanitizer.text($td));
      });

      var eq = [];
      $eq.children('tr').each(function (index, element) {
        var $tr = $(element);
        var $td = $tr.find('td:nth-child(2)');
        eq.push(sanitizer.text($td));
      });

      return {
        raw: [pre, eq]
      };
    }
  }]);

  return BuscaCursosClient;
}();

exports.default = BuscaCursosClient;


function removeParenthesis(string) {
  if ((0, _startsWith2.default)(string, '(') && (0, _endsWith2.default)(string, ')')) {
    return string.substring(1, string.length - 1);
  }
  return string;
}

function forceRemoveParenthesis(string) {
  var start = (0, _startsWith2.default)(string, '(') ? 1 : 0;
  var end = (0, _endsWith2.default)(string, ')') ? string.length - 1 : string.length;
  return string.substring(start, end);
}

function requisites(string) {
  if (!string) return [];
  // string example:
  // (FIS1503 y MAT1203) o (MAT1202 y MAT1620(c)) o (FIS1513(c) y MAT1512(c)) o FIS1513(c) o ICE1513(c)
  // BIO149E y ENF2201 y ENF2205 y EYP1086 y (MEB203B o MED821)

  var ors = string.split('o').map(_trim2.default).map(function (s) {
    return removeParenthesis(s);
  });
  // ['FIS1503 y MAT1203', 'MAT1202 y MAT1620(c)', 'FIS1513(c) y MAT1512(c)', 'FIS1513(c)', 'ICE1513(c)']

  return ors.map(function (or) {
    var ands = or.split('y').map(_trim2.default);
    // [ 'FIS1503', 'MAT1203' ]
    // [ 'MAT1202', 'MAT1620(c)' ]

    return (0, _transform2.default)(ands, function (acc, initials) {
      if (initials.endsWith('(c)')) {
        acc.corequisites.push(initials.slice(0, -3));
      } else {
        acc.prerequisites.push(initials);
      }
    }, { prerequisites: [], corequisites: [] });
  });
}

function equivalences(string) {
  // (MAT1511 o MAT1516 o MAT1518 o MAT220E o MLM1120)
  if (!string) return [];
  return string.replace(/[)(]/g, '').trim().split('o').map(_trim2.default);
}

function relations(string) {
  if (!string) return null;
  switch (string.toLowerCase()) {
    case 'o':
      return 'or';
    case 'y':
      return 'and';
    default:
      return null;
  }
}

function optionSplit(string, options) {
  for (var separator = 0; separator < options.length - 1; separator++) {
    var result = string.split(options[separator]);
    if (result.length > 1) {
      return result;
    }
  }
  return string.split(options[options.length - 1]);
}

function restrictions(string) {
  if (!string) return [];
  var res = removeParenthesis(string).split(' o ').map(_trim2.default).map(function (s) {
    return forceRemoveParenthesis(s);
  });
  return res.map(function (s) {
    var _optionSplit$map = optionSplit(s, ['>=', '=']).map(_trim2.default);

    var _optionSplit$map2 = _slicedToArray(_optionSplit$map, 2);

    var type = _optionSplit$map2[0];
    var value = _optionSplit$map2[1];

    return { type: type, value: value };
  });
}