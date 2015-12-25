const buscacursos = require('..');

const query = {
  'cxml_semestre': '2016-1',
  'cxml_sigla': 'FIS0151',
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
    console.log(toJSON(course));
    // ...
  });
});
