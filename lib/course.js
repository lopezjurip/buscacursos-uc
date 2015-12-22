'use strict';

module.exports = class Course {
  constructor(options) {
    this.school = options.school;
    this.year = options.year;
    this.period = options.period;
  }
}
