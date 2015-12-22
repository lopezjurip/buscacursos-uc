const request = require('request');
const cheerio = require('cheerio');
const async = require('async');

const Course = require('./course');
const fetchInformation = require('./information');
const fetchRequisites = require('./requisites');

const BASE_URL = 'http://buscacursos.uc.cl';

function query(qs) {
  return {
    uri: BASE_URL,
    method: 'GET',
    qs: qs,
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

module.exports = function(callback, options) {
  return function(qs, done) {
    request(query(qs), (err, response, html) => {
      if (err) return done(err);

      const $ = cheerio.load(html);
      const last = $('body > div:nth-child(9)').children('table');
      if (!last.is('table')) {
        return done(new Error(`invalid query ${JSON.stringify(qs)}`));
      }

      const table = last.children().toArray();
      const title = table.shift();
      const header = table.shift();
      const subheader = table.shift();

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

      const base = {
        school: text(title),
        year: options.year,
        period: options.period,
      }

      table.forEach(tr => {
        const values = $(tr).children().toArray();
        const course = new Course(base);
        course.NRC = number(values[0]);
        course.initials = text(values[1]);
        course.droppable = boolean(values[2]);
        course.english = boolean(values[3]);
        course.section = number(values[4]);
        course.specialApproval = boolean(values[5]);
        course.name = text(values[6]);
        course.teachers = text(values[7]).split(',').map(s => s.trim());
        course.campus = text(values[8]);
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
            modules: {}, location: text(data[2])
          };
          const processed = schedule(text(data[0])); // { L: [1, 2, 3], W: [4, 5] }
          Object.keys(processed).forEach(day => {
            const blocks = processed[day];
            if (shc.modules[day]) {
              shc.modules[day] = shc.modules[day].concat(blocks);
            } else {
              shc.modules[day] = blocks;
            }
          });
        });
        async.parallel({
          info: fetchInformation(course),
          requisites: fetchRequisites(course.initials)
        }, (err, results) => {
          course.information = results.info;
          course.requisites = results.requisites;
          callback(course);
        });
      });
      done(null, table.length);
    });
  };
}
