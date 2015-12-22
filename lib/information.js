const request = require('request');
const cheerio = require('cheerio');

const BASE_URL = `http://buscacursos.uc.cl/informacionCurso.ajax.php`;

function query(options) {
  return {
    uri: BASE_URL,
    method: 'GET',
    qs: {
      semestre: `${options.year}-${options.period}`,
      sigla: options.initials,
      seccion: options.section,
    },
  };
}

module.exports = function(options) {
  return function(done) {
    request(query(options), (err, response, html) => {
      if (err) return done(err);

      const $ = cheerio.load(html);
      const info = $('div > div:nth-child(1) > div:nth-child(1)');
      const data = $(info).text().trim();
      done(null, data);
    });
  }
};
