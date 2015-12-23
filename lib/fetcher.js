const request = require('request-promise');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const async = require('asyncawait/async');
const wait = require('asyncawait/await'); // await is reserved in strict mode

const Course = require('./course');
const fetchInformation = require('./information');
const fetchRequisites = require('./requisites');
const teacher = require('./teacher');

const BASE_URL = 'http://buscacursos.uc.cl';

function query(qs) {
  return {
    uri: BASE_URL,
    method: 'GET',
    qs: qs,
    transform: function(body) {
      return cheerio.load(body);
    },
  };
}

function schedule(string) {
  const result = {};
  string.replace(/ /g,'').split(';').map(s => s.split(':')).map(S => {
    const days = S[0];
    const blocks = S[1];
    days.split('-').forEach(day => {
      result[day] = blocks.split(',');
    });
  });
  return result;
}

module.exports = async(function(qs, options) {
  options = options || {};

  // Validate query
  if (!qs['cxml_semestre']) {
    throw (new Error(`missing 'cxml_semestre' query param.`));
  }

  // Make request
  const $ = wait(request(query(qs)));
  // Find results
  const last = $('body > div:nth-child(9)').children('table');
  if (!last.is('table')) {
    // Empty results
    return [];
  }

  // Parse results
  const table = last.children().toArray();

  // Filter rows and add school as extra 'td'
  var school = undefined;
  const rows = table.filter(tr => {
    tr = $(tr);
    if (tr.hasClass('resultadosRowImpar') || tr.hasClass('resultadosRowPar')) {
      // This row has a course
      tr.append(`<td>${school}</td>`);
      return true;
    } else if (tr.children().length === 1) {
      // This row is a header
      school = text(tr.children()[0]);
    }
    return false;
  });

  // Helper functions
  function text(node) {
    const t = $(node).text().trim();
    const temp = t.toLowerCase();
    return (temp === '(por asignar)' || temp === 'por fijar') ? null : t;
  }

  function boolean(node) {
    const t = text(node);
    return t && t.toUpperCase() === 'SI'
  }

  function number(node) {
    const t = text(node);
    return t ? Number(t) : null;
  }

  // Common properties for each result
  const time = qs['cxml_semestre'].split('-');
  const base = {
    year: Number(time[0]),
    period: Number(time[1]),
  }

  // Process table on parallel
  return wait(rows.map(tr => {
    const values = $(tr).children().toArray();
    const course = new Course(base);
    course.NRC = number(values[0]);
    course.initials = text(values[1]);
    course.droppable = boolean(values[2]);
    course.english = boolean(values[3]);
    course.section = number(values[4]);
    course.specialApproval = boolean(values[5]);
    course.name = text(values[6]);
    const teachers = text(values[7]);
    course.teachers = (teachers) ? teachers.split(',').map(name => {
      name = name.trim();
      return {
        name: name,
        photoURL: teacher.photoURL(name, course) 
      };
    }) : [];
    course.credits = number(values[9]);
    course.vacancy = {
      total: number(values[10]),
      available: number(values[11]),
    };
    course.schedule = {};
    $('table', values[13]).children().each((_, subtr) => {
      const data = $(subtr).children().toArray();
      const type = text(data[1]);
      // Create if not present
      const shc = course.schedule[type] = course.schedule[type] || {
        modules: {},
        location: {
          campus: text(values[8]),
          place: text(data[2])
        }
      };
      const processed = schedule(text(data[0])); // { L: [1, 2, 3], W: [4, 5] }
      Object.keys(processed).forEach(day => {
        const blocks = processed[day];
        // Append if block type already exists
        if (shc.modules[day]) {
          shc.modules[day] = shc.modules[day].concat(blocks);
        } else {
          shc.modules[day] = blocks;
        }
      });
    });
    course.school = text(values[15]);

    // Additional requests
    const information = options.skipInformation ? null : fetchInformation(course).reflect();
    const requisites = options.skipRequisites ? null : fetchRequisites(course.initials).reflect();

    // Parallel requests
    return Promise.all([information, requisites]).then(results => {
      course.information = (results[0] && results[0].isFulfilled()) ? results[0] : null;
      course.requisites = (results[1] && results[1].isFulfilled()) ? results[1] : null;
      return course;
    });
  }));
});
