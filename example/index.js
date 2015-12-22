const buscacursos = require('buscacursos-uc');

const query = {
  'cxml_semestre': '2016-1',
  'cxml_sigla': 'FIS0151',
};

// It's a Promise!
buscacursos.fetch(query).then(courses => {
  courses.forEach(course => {
    const initials = course.initials;
    const vacancy = course.vacancy;
    const credits = course.credits;
    console.log(course);
    // ...
  });
});
