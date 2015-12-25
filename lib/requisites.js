const request = require('request-promise');
const cheerio = require('cheerio');

const BASE_URL = 'http://catalogo.uc.cl/index.php';

function removeParenthesis(string) {
  if (string.startsWith('(') && string.endsWith(')')) {
    return string.substring(1, string.length - 1);
  } else {
    return string;
  }
}

function forceRemoveParenthesis(string) {
  const start = string.startsWith('(') ? 1 : 0;
  const end = string.endsWith(')') ? string.length - 1 : string.length;
  return string.substring(start, end);
}

function requirements(string) {
  // (FIS1503 y MAT1203) o (MAT1202 y MAT1620(c)) o (FIS1513(c) y MAT1512(c)) o FIS1513(c) o ICE1513(c)
  if (!string) return [];
  const ors = string.split('o').map(s => removeParenthesis(s.trim()));
  // ['FIS1503 y MAT1203', 'MAT1202 y MAT1620(c)', 'FIS1513(c) y MAT1512(c)', 'FIS1513(c)', 'ICE1513(c)']
  return ors.map(ss => ss.split('y').map(s => s.trim())).map(array => {
    return array.reduce((obj, initials) => {
      if (initials.endsWith('(c)')) {
        obj.corequisites.push(initials.slice(0, -3));
      } else {
        obj.prerequisites.push(initials);
      }
      return obj;
    }, { prerequisites: [], corequisites: [] });
  });
}

function equivalences(string) {
  // (MAT1511 o MAT1516 o MAT1518 o MAT220E o MLM1120)
  if (!string) return [];
  return string.replace(/[)(]/g, '').trim().split('o').map(s => s.trim());
}

function filterNull(string) {
  if (!string) return null;
  return (string.toLowerCase() === 'no tiene') ? null : string;
}

function relations(string) {
  if (!string) return null;
  string = string.toLowerCase();
  if (string === 'o') {
    return 'or';
  } else if (string === 'y') {
    return 'and';
  }
  return null;
}

function optionSplit(string, options) {
  for (var separator = 0; separator < options.length - 1; separator++) {
    const result = string.split(options[separator]);
    if (result.length > 1) {
      return result;
    }
  }
  return string.split(options[options.length - 1]);
}

function restrictions(string) {
  if (!string) return [];
  const res = removeParenthesis(string).split(' o ').map(s => forceRemoveParenthesis(s.trim()));
  return res.map(s => {
    const info = optionSplit(s, ['>=', '=']).map(q => q.trim());
    return {
      type: info[0],
      value: info[1],
    };
  });
}

function query(initials) {
  return {
    uri: BASE_URL,
    method: 'GET',
    qs: {
      tmpl: 'component',
      option: 'com_catalogo',
      view: 'requisitos',
      sigla: initials,
    },
    transform: function(body) {
      return cheerio.load(body);
    },
  };
}

module.exports = function(initials) {
  return request(query(initials)).then($ => {
    function extract(dom) {
      return dom.children('tr').map((i, item) => {
        return $('td', item).get(1);
      }).toArray().map(r => $(r).text().trim());
    };

    const contentpane = $('body > div.contentpane');
    const pre = extract($('div:nth-child(2) > table', contentpane));
    const eq = extract($('div:nth-child(4) > table', contentpane));
    return {
      requirements: requirements(filterNull(pre[0])),
      relation: relations(filterNull(pre[1])),
      restrictions: restrictions(filterNull(pre[2])),
      equivalences: equivalences(filterNull(eq[0])),
    };
  });

}
