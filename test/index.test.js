/* eslint prefer-arrow-callback: 0, arrow-body-style: 0, import/no-extraneous-dependencies: 0  */

import { expect } from "chai";
import cheerio from "cheerio";
import fs from "mz/fs";
import fetch from "node-fetch";

import buscacursos from "../src";

const baseUrl = "http://buscacursos.uc.cl";

const createInstance = () => buscacursos({ baseUrl, fetch, $: cheerio });
const readFile = path => fs.readFile(path, "utf-8");

const QUERY = {
  cxml_semestre: "2017-2",
  cxml_sigla: "INP3440",
};

describe("loading content", function() {
  this.timeout(5000);

  it("should request the html as string", function() {
    const client = createInstance();
    return client.requestCourses(QUERY);
  });

  it("should parse a valid html", function() {
    const client = createInstance();
    return readFile("test/mocks/MAT1610-2016-2.html").then(html => {
      const result = client.processCourses(client.parse(html), { year: 2016, period: 2 });
      return result;
    });
  });

  it("should parse a valid html with complex schedule", function() {
    const client = createInstance();
    return readFile("test/mocks/ENF2512-2016-1.html").then(html => {
      const result = client.processCourses(client.parse(html), { year: 2016, period: 1 });
      return result;
    });
  });

  it("should return an empty array if nothing is found", function() {
    const client = createInstance();
    return readFile("test/mocks/empty-2016-2.html").then(html => {
      const $document = client.parse(html);
      const result = client.processCourses($document, { year: 2016, period: 2 });
      return expect(result).to.be.empty;
    });
  });

  it("should get courses by query", function() {
    const client = createInstance();
    return client.getCourses(QUERY).then(result => {
      // console.log(JSON.stringify(result, null, 4));
      return result;
    });
  });

  it("should get information as string", function() {
    const client = createInstance();
    return client.requestInformation({ year: 2016, period: 2, initials: "MAT1610", section: "1" });
  });

  it("should parse and process information string", function() {
    const client = createInstance();
    return readFile("test/mocks/MAT1610-2016-2-information.html").then(html => {
      const result = client.processInformation(client.parse(html));
      return result;
    });
  });

  it("should get requisites as string", function() {
    const client = createInstance();
    return client.requestRequisites({ initials: "MAT1610" });
  });

  it("should parse and process requisites string", function() {
    const client = createInstance();
    return readFile("test/mocks/IIC3695-requisites.html").then(html => {
      const result = client.processRequisites(client.parse(html));
      // console.log(JSON.stringify(result, null, 4));
      return result;
    });
  });

  it("should get requisites", function() {
    const client = createInstance();
    return client.getRequisites({ initials: "ENF2318" }).then(requisites => {
      // console.log(JSON.stringify(requisites, null, 4));
      return requisites;
    });
  });

  it("should make the example work", function() {
    const client = createInstance();
    const query = {
      cxml_semestre: "2016-2",
      cxml_sigla: "ICS2613",
    };

    return client
      .getCourses(query)
      .then(courses => {
        const promises = courses.map(course => {
          return Promise.all([
            client
              .getInformation(course)
              .then(information => Object.assign(course, { information })),
            client.getRequisites(course).then(requisites => Object.assign(course, { requisites })),
          ])
            .then(() => course)
            .catch(() => course);
        });
        return Promise.all(promises);
      })
      .then(courses => {
        // console.log(JSON.stringify(courses[0], null, 4));
        return courses;
      });
  });
});
