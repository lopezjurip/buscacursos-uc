const querystring = require('querystring');

const BASE_URL = 'http://buscacursos.uc.cl/getFotoProfe.db.php';

module.exports.photoURL = function(name, options) {
  const query = querystring.stringify({
    nombre: name,
    semestre: `${options.year}-${options.period}`,
    sigla: options.initials,
    seccion: options.section,
  });
  return `${BASE_URL}?${query}`;
}
