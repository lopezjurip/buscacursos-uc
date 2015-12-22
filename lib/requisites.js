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

function processInitials(initials) {
  if (initials.endsWith('(c)')) {
    // It's a corequisite
    initials = initials.slice(0, -3);
    return { initials: initials, corequisite: true };
  } else {
    return { initials: initials };
  }
}

function prerequisites(string) {
  // (FIS1503 y MAT1203) o (MAT1202 y MAT1620(c)) o (FIS1513(c) y MAT1512(c)) o FIS1513(c) o ICE1513(c)
  if (!string) return null;
  const ors = string.split('o').map(s => removeParenthesis(s.trim()));
  return ors.map(s => s.split('y').map(q => processInitials(q.trim())));
}

function equivalences(string) {
  // (MAT1511 o MAT1516 o MAT1518 o MAT220E o MLM1120)
  if (!string) return null;
  return string.replace(/[)(]/g, '').trim().split('o').map(s => processInitials(s.trim()));
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
      prerequisites: prerequisites(filterNull(pre[0])),
      relation: relations(filterNull(pre[1])),
      restrictions: filterNull(pre[2]),
      equivalences: equivalences(filterNull(eq[0])),
    };
  });

}
