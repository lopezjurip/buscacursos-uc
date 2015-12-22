const request = require('request');
const cheerio = require('cheerio');

const BASE_URL = 'http://catalogo.uc.cl/index.php';

function requisites(string) {
  // IIC2343 o (IIC1222 y ING1011) o (IIC1222 y IPP1000)
  if (!string) return null;
  const ors = string.split('o').map(s => s.replace(/[)(]/g,'').trim());
  return ors.map(s => s.split('y').map(q => q.trim()));
}

function equivalences(string) {
  // (MAT1511 o MAT1516 o MAT1518 o MAT220E o MLM1120)
  if (!string) return null;
  return string.replace(/[)(]/g,'').trim().split('o').map(s => s.trim());
}

function filterNull(string) {
  if (!string) return null;
  return (string.toLowerCase() === 'no tiene') ? null : string;
}

function relations(string) {
  if (!string) return null;
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
  };
}

module.exports = function(initials) {
  return function(done) {
    request(query(initials), (err, response, html) => {
      if (err) return done(err);

      const $ = cheerio.load(html);

      function extract(dom) {
        return dom.children('tr').map((i, item) => {
          return $('td', item).get(1);
        }).toArray().map(r => $(r).text().trim());
      };

      const contentpane = $('body > div.contentpane');
      const pre = extract($('div:nth-child(2) > table', contentpane));
      const eq = extract($('div:nth-child(4) > table', contentpane));
      const result = {
        requisites: requisites(filterNull(pre[0])),
        relation: relations(filterNull(pre[1])),
        restrictions: filterNull(pre[2]),
        equivalences: equivalences(filterNull(eq[0])),
      };
      done(null, result);
    });
  }
}
