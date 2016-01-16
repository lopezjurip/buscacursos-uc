const buscacursos = require('..');

const query = {
  'cxml_semestre': '2015-2',
  'cxml_sigla': 'FIS1513',
};

function toJSON(course) {
  return JSON.stringify(course, null, 4);
}

// It's a Promise!
buscacursos.fetch(query).then(courses => {
  courses.forEach(course => {
    const initials = course.initials;
    const vacancy = course.vacancy;
    const credits = course.credits;
    // ...
  });
  console.log(toJSON(courses));
});
