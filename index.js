'use strict';

const async = require('async');
const Combinatorics = require('js-combinatorics');

const fetch = require('./lib/fetcher');

function combinations(number) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split('');
  return ['ENF2'] // Combinatorics.combination(alphabet, number).toArray();
}

const get = module.exports = function(options, callback) {
  const requests = combinations(3).map(initials => {
    return {
      'cxml_semestre': `${options.year}-${options.period}`,
      'cxml_sigla': initials,
    };
  });
  return async.map(requests, fetch(callback, options), (err, results) => {
    console.error(err, results);
  });
}

get({
  year: 2016,
  period: 1
}, (course) => {
  console.log(JSON.stringify(course, null, 4));
});
