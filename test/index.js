'use strict';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

const buscacursos = require('../index');
const Course = require('../lib/course');

const FIS0151 = {
  'cxml_semestre': '2016-1',
  'cxml_sigla': 'FIS0151',
};

const ENF2512 = {
  'cxml_semestre': '2016-1',
  'cxml_sigla': 'ENF2512',
};

const IIC3695 = {
  'cxml_semestre': '2016-1',
  'cxml_sigla': 'IIC3695',
}

const cases = {
  generic: FIS0151,
  equivalences: ENF2512,
  restrictions: IIC3695,
  corequisites: FIS0151,
  complexScheduler: ENF2512,
  multipleTeachers: ENF2512,
};

const invalid = {
  badQuery: {
    'cxml_sigla': 'IIC3695',
  },
  future: {
    'cxml_semestre': '2020-2',
    'cxml_sigla': 'IIC3695',
  },
  notFound: {
    'cxml_semestre': '2016-1',
    'cxml_sigla': 'XYZ1234',
  },
};

describe('buscacursos', function() {
  this.timeout(20000);

  it('should fetch generic resource', done => {
    buscacursos.fetch(cases.generic).then(results => {
      results.should.be.instanceof(Array);
      results.should.not.be.empty;
      results.forEach(course => {
        course.should.be.instanceof(Course);
        course.should.contain.all.keys([
          'year',
          'period',
          'school',
          'NRC',
          'initials',
          'droppable',
          'english',
          'section',
          'specialApproval',
          'name',
          'credits',
          'information',
        ]);
        function validatePositiveNumber(c) {
          c.should.be.a('number');
          c.should.be.above(0);
        }
        validatePositiveNumber(course.NRC, course.year, course.period, course.credits)
      });
      done();
    }).catch(done);
  });

  it('should fetch course with valid quivalences', done => {
    buscacursos.fetch(cases.equivalences).then(results => {
      // Expected:  (ENT2510 o ENT2520 o ENT2526 o ENT2532)
      // See: http://catalogo.uc.cl/index.php?tmpl=component&option=com_catalogo&view=requisitos&sigla=ENF2512
      const course = results[0];
      const equivalences = course.requisites.equivalences;
      equivalences.should.eql([
        { initials: 'ENT2510' },
        { initials: 'ENT2520' },
        { initials: 'ENT2526' },
        { initials: 'ENT2532' },
      ])
      done();
    }).catch(done);
  });

  it('should fetch course with valid corequisites', done => {
    buscacursos.fetch(cases.corequisites).then(results => {
      // Expected: (FIS1503 y MAT1203) o (MAT1202 y MAT1620(c)) o (FIS1513(c) y MAT1512(c)) o FIS1513(c) o ICE1513(c)
      // See: http://catalogo.uc.cl/index.php?tmpl=component&option=com_catalogo&view=requisitos&sigla=FIS0151
      const course = results[0];
      const prerequisites = course.requisites.prerequisites;
      prerequisites.should.eql([
        [
          { initials: 'FIS1503' },
          { initials: 'MAT1203' },
        ], [
          { initials: 'MAT1202' },
          { initials: 'MAT1620', corequisite: true },
        ], [
          { initials: 'FIS1513', corequisite: true },
          { initials: 'MAT1512', corequisite: true },
        ], [
          { initials: 'FIS1513', corequisite: true },
        ], [
          { initials: 'ICE1513', corequisite: true },
        ],
      ]);
      done();
    }).catch(done);
  });

  it('should parse results divided by multiple headers', done => {
    const query = {
      'cxml_semestre': '2016-1',
      'cxml_sigla': 'AR', // returns resutls from 'Arquitectura' and 'Arte'
    };
    buscacursos.fetch(query).then(results => {
      let arq = false;
      let art = false;
      for (let i = 0; i < results.length; i++) {
        const course = results[i];
        console.log(course.school);
        if (course.school.toLowerCase() === 'arte') art = true;
        if (course.school.toLowerCase() === 'arquitectura') arq = true;
      }
      arq.should.be.true;
      art.should.be.true;
      done();
    }).catch(done);
  });

  it('should skip unwanted information request', done => {
    buscacursos.fetch(cases.generic, { skipInformation: true }).then(results => {
      results.forEach(course => {
        course.should.be.instanceof(Course);
        expect(course.information).to.be.null;
      })
      done();
    }).catch(done);
  });

  it('should skip unwanted requisites request', done => {
    buscacursos.fetch(cases.generic, { skipRequisites: true }).then(results => {
      results.forEach(course => {
        course.should.be.instanceof(Course);
        expect(course.requisites).to.be.null;
      })
      done();
    }).catch(done);
  });

  it('should skip unwanted requisites and information requests', done => {
    buscacursos.fetch(cases.generic, { skipRequisites: true, skipInformation: true }).then(results => {
      results.forEach(course => {
        course.should.be.instanceof(Course);
        expect(course.requisites).to.be.null;
        expect(course.information).to.be.null;
      })
      done();
    }).catch(done);
  });
});
