const request = require('request-promise');
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
    transform: function(body) {
      return cheerio.load(body);
    },
  };
}

module.exports = function(options) {
  return request(query(options)).then($ => {
    const info = $('div > div:nth-child(1) > div:nth-child(1)');
    const data = $(info).text().trim();
    return data;
  });
};
