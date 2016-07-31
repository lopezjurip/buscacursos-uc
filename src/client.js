import { stringify } from 'qs';
import merge from 'lodash/merge';
import transform from 'lodash/transform';
import trim from 'lodash/trim';
import split from 'lodash/split';
import startsWith from 'lodash/startsWith';
import endsWith from 'lodash/endsWith';

import Sanitizer from './sanitizer';


export default class BuscaCursosClient {
  constructor(baseUrl, fetch, $) {
    this.baseUrl = baseUrl;
    this.fetch = fetch;
    this.$ = $;
    this.sanitizer = new Sanitizer($);
  }

  parse(html, options = {}) {
    // Allow custom loading of HTML
    if (options.load) {
      return options.load(html);
    }
    return this.$('<div/>').html(html).contents();
  }

  request(url, query, options) {
    const querystring = stringify(query);
    const fetch = this.fetch;
    return fetch(`${url}?${querystring}`, {
      method: 'GET',
      mode: 'no-cors',
      ...options,
    }).then(response => response.text());
  }

  requestCourses(query = {}, options = {}) {
    return this.request(this.baseUrl, query, options);
  }

  requestInformation({ year, period, initials, section }, options = {}) {
    const query = {
      semestre: `${year}-${period}`,
      sigla: initials,
      seccion: section,
    };
    const url = `${this.baseUrl}/informacionCurso.ajax.php`;
    return this.request(url, query, options);
  }

  requestRequisites({ initials }, options = {}) {
    const query = {
      tmpl: 'component',
      option: 'com_catalogo',
      view: 'requisitos',
      sigla: initials,
    };
    const url = 'http://catalogo.uc.cl/index.php';
    return this.request(url, query, options);
  }

  getCourses(query, options = {}) {
    // eslint-disable-next-line
    const [year, period] = split(query['cxml_semestre'], '-').map(Number);
    const params = { year, period };

    const { fetching, parsing } = options;

    return this.requestCourses(query, fetching)
      .then(html => this.parse(html, parsing))
      .then($document => this.processCourses($document, params));
  }

  getInformation({ year, period, initials, section }) {
    return this.requestInformation({ year, period, initials, section })
      .then(html => this.parse(html))
      .then($document => this.processInformation($document));
  }

  getRequisites(course) {
    return this.requestRequisites(course)
    .then(html => this.parse(html))
    .then($document => this.processRequisites($document));
  }

  processCourses($document, params = {}) {
    const { sanitizer, $ } = this;

    const $last = $document.find('body > div:nth-child(9) > table').first();

    // Empty results
    if ($last.length === 0) return [];

    const $table = $last.children('tr');

    let school = null;
    const entities = [];

    $table.each((index, element) => {
      const $row = $(element);

      // Check if this row is a course entity
      if ($row.hasClass('resultadosRowImpar') || $row.hasClass('resultadosRowPar')) {
        const entity = this.processRow($row, { ...params, school });
        entities.push(entity);

      // Check the number of children to determine if this is the academic school or info headers
      } else if ($row.children().length === 1) {
        school = sanitizer.text($row.find('td').first());

      // this row has table "headers"
      } else {
        // TODO: get values
      }
    });

    return entities;
  }

  processRow($row, params = {}) {
    const { sanitizer } = this;

    const $columns = $row.children('td');

    const NRC = sanitizer.text($columns.eq(0));
    const initials = sanitizer.text($columns.eq(1));
    const droppable = sanitizer.boolean($columns.eq(2));
    const english = sanitizer.boolean($columns.eq(3));
    const section = sanitizer.number($columns.eq(4));
    const specialApproval = sanitizer.boolean($columns.eq(5));
    const category = sanitizer.text($columns.eq(6));
    const name = sanitizer.text($columns.eq(7));
    const campus = sanitizer.text($columns.eq(9));
    const credits = sanitizer.text($columns.eq(10));
    const vacancy = {
      total: sanitizer.number($columns.eq(11)),
      available: sanitizer.number($columns.eq(12)),
    };
    const schedule = this.processScheduler($columns.eq(14), campus);

    const entity = {
      ...params,
      NRC,
      initials,
      droppable,
      english,
      section,
      specialApproval,
      category,
      name,
      campus,
      credits,
      vacancy,
      schedule,
    };
    const teachers = this.processTeacher($columns.eq(8), entity);
    return merge(entity, { teachers });
  }

  processScheduler($schedule, campus = null) {
    // Special cases: http://buscacursos.uc.cl/?cxml_semestre=2016-1&cxml_sigla=ENF2512
    // M-W-J-V:1,2,3  CLAS  J4
    // M-W-J:4,5  CLAS  J4

    const { sanitizer, $ } = this;
    const normalized = {};
    const raw = [];

    const $rows = $schedule.find('table').first().find('tr');
    $rows.each((index, element) => {
      const $columns = $(element).children('td');

      const type = sanitizer.text($columns.eq(1));
      const when = sanitizer.text($columns.eq(0));
      const where = sanitizer.text($columns.eq(2));

      raw.push({ type, when, where });

      const [days, hours] = when.split(':').map(part => split(part, /[,-]+/));

      // See: https://lodash.com/docs#transform
      const updater = transform(days, (daysAccumulator, day) => {
        daysAccumulator[day] = transform(hours, (hoursAccumulator, hour) => { // eslint-disable-line
          hoursAccumulator[hour] = { type, classroom: where, campus: campus }; // eslint-disable-line
        }, {});
      }, {});

      merge(normalized, updater); // this mutates 'normalized'
    });

    // See: https://lodash.com/docs#transform
    const schematic = transform(normalized, (accumulator, hours, day) => ( // hours is an object
      accumulator.push({
        day,
        hours: transform(hours, (acc, module, hour) => acc.push({ hour, module }), []),
      })
    ), []);

    return { raw, schematic, normalized };
  }

  processTeacher($teacher, { year, period, initials, section }) {
    const { sanitizer } = this;

    return sanitizer.text($teacher).split(',').map(trim).map(name => {
      const querystring = stringify({
        nombre: name,
        semestre: `${year}-${period}`,
        sigla: initials,
        seccion: section,
      });
      return {
        name,
        photoUrl: `${this.baseUrl}/getFotoProfe.db.php?${querystring}`,
        // name: name.split(' ').reverse().join(' '),
      };
    });
  }

  processInformation($document) {
    const $info = $document.find('div > div:nth-child(1) > div:nth-child(1)');
    return this.sanitizer.text($info);
  }

  processRequisites($document) {
    const { sanitizer, $ } = this;

    const $contentpane = $document.find('body > div.contentpane');
    const $pre = $contentpane.find('div:nth-child(2) > table').first();
    const $eq = $contentpane.find('div:nth-child(4) > table').first();

    const pre = [];
    $pre.children('tr').each((index, element) => {
      const $tr = $(element);
      const $td = $tr.find('td:nth-child(2)');
      pre.push(sanitizer.text($td));
    });

    const eq = [];
    $eq.children('tr').each((index, element) => {
      const $tr = $(element);
      const $td = $tr.find('td:nth-child(2)');
      eq.push(sanitizer.text($td));
    });

    return {
      raw: [pre, eq],
      // requisites: requisites(pre[0]),
      // relations: relations(pre[1]),
      // restrictions: restrictions(pre[2]),
      // equivalences: equivalences(eq[0]),
    };
  }
}


function removeParenthesis(string) {
  if (startsWith(string, '(') && endsWith(string, ')')) {
    return string.substring(1, string.length - 1);
  }
  return string;
}

function forceRemoveParenthesis(string) {
  const start = startsWith(string, '(') ? 1 : 0;
  const end = endsWith(string, ')') ? string.length - 1 : string.length;
  return string.substring(start, end);
}

function requisites(string) {
  if (!string) return [];
  // string example:
  // (FIS1503 y MAT1203) o (MAT1202 y MAT1620(c)) o (FIS1513(c) y MAT1512(c)) o FIS1513(c) o ICE1513(c)
  // BIO149E y ENF2201 y ENF2205 y EYP1086 y (MEB203B o MED821)

  const ors = string.split('o').map(trim).map(s => removeParenthesis(s));
  // ['FIS1503 y MAT1203', 'MAT1202 y MAT1620(c)', 'FIS1513(c) y MAT1512(c)', 'FIS1513(c)', 'ICE1513(c)']

  return ors.map(or => {
    const ands = or.split('y').map(trim);
    // [ 'FIS1503', 'MAT1203' ]
    // [ 'MAT1202', 'MAT1620(c)' ]

    return transform(ands, (acc, initials) => {
      if (initials.endsWith('(c)')) {
        acc.corequisites.push(initials.slice(0, -3));
      } else {
        acc.prerequisites.push(initials);
      }
    }, { prerequisites: [], corequisites: [] });
  });
}

function equivalences(string) {
  // (MAT1511 o MAT1516 o MAT1518 o MAT220E o MLM1120)
  if (!string) return [];
  return string.replace(/[)(]/g, '').trim().split('o').map(trim);
}

function relations(string) {
  if (!string) return null;
  switch (string.toLowerCase()) {
    case 'o': return 'or';
    case 'y': return 'and';
    default: return null;
  }
}

function optionSplit(string, options) {
  for (let separator = 0; separator < options.length - 1; separator++) {
    const result = string.split(options[separator]);
    if (result.length > 1) {
      return result;
    }
  }
  return string.split(options[options.length - 1]);
}

function restrictions(string) {
  if (!string) return [];
  const res = removeParenthesis(string).split(' o ').map(trim).map(s => forceRemoveParenthesis(s));
  return res.map(s => {
    const [type, value] = optionSplit(s, ['>=', '=']).map(trim);
    return { type, value };
  });
}
