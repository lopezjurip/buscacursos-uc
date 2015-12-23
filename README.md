# Buscacursos UC Client

[![Build Status][ci-image]][ci-url] [![lint][lint-image]][lint-url] [![dependencies][dependencies-image]][dependencies-url] [![dev-dependencies][dev-dependencies-image]][dev-dependencies-url]

Perform queries to [buscacursos.uc.cl](http://buscacursos.uc.cl/) and get the results as JSON objects.

## Requirements

*   Node.js 5.3 or newer.

## Install

Using `npm`:

```sh
npm install --save buscacursos-uc
```

## Usage

```javascript
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

// Make the requests faster skipping additional requests
buscacursos.fetch(query, { skipRequisites: true, skipInformation: true }).then(courses => {
  courses.forEach(course => {
    // ...
  });
});
```

### Query

The query comes from the website, the following are the arguments you can pass:

#### `cxml_semestre`

*   **Required**
*   Example: `2016-1`

#### `cxml_sigla`

*   Example: `MAT1630`

#### `cxml_nombre`

*   Example: `Ingeniería de software`

#### `cxml_profesor`

*   Example: `Reutter Juan`

#### `cxml_campus`

*   Example: `San Joaquín`

#### `cxml_unidad_academica`

*   Example: `Arte`

#### `cxml_horario_tipo_busqueda`

#### `cxml_horario_tipo_busqueda_actividad`

## Results

The results are from page of at most 50 courses. The `Promimse` returns an array of courses with the following schema:

### Example

```json
{
  "school": "Física",
  "year": 2016,
  "period": 1,
  "NRC": 14444,
  "initials": "FIS1513",
  "droppable": true,
  "english": false,
  "section": 1,
  "specialApproval": false,
  "name": "Estática y Dinámica",
  "teachers": [{
    "name": "Garcia Griselda",
    "photoURL": "http://buscacursos.uc.cl/getFotoProfe.db.php?nombre=Garcia%20Griselda&semestre=2016-1&sigla=FIS1513&seccion=1"
  }],
  "credits": 10,
  "vacancy": {
    "total": 130,
    "available": 10
  },
  "schedule": {
    "CAT": {
      "modules": {
        "L": [
          "3"
        ],
        "W": [
          "3"
        ],
        "V": [
          "3"
        ]
      },
      "location": {
        "campus": "San Joaquin",
        "place": "BC23"
      }
    },
    "AYUD": {
      "modules": {
        "L": [
          "4"
        ]
      },
      "location": {
        "campus": "San Joaquin",
        "place": null
      }
    }
  },
  "information": "El curso presenta los principios fundamentales para el estudio de la estática y dinámica de sistemas mecánicos y estructurales discretos rígidos y deformables. El curso se basa en la aplicación de los tres pilares fundamentales de la mecánica clásica: la cinemática, el equilibrio, y las leyes constitutivas. El curso comienza con el estudio detallado de la cinemática del movimiento de partículas, sistemas de partículas y cuerpos. Se plantean luego las leyes y ecuaciones constitutivas fundamentales que relacionan la cinemática con las fuerzas que actúan sobre los cuerpos, conjuntamente con los principios fundamentales de energía mecánica y trabajo. Utilizando, la cinemática y las leyes constitutivas, se estudian distintas herramientas para plantear el equilibrio de los sistemas mecánicos y estructurales, con énfasis en los principios de energía y trabajos virtuales. El curso enfatiza la construcción y análisis de modelos físicos y matemáticos de sistemas mecánicos y estructurales reales.",
  "requisites": {
    "prerequisites": [
      [{
        "initials": "FIS1503"
      }, {
        "initials": "MAT1203"
      }, {
        "initials": "MAT1620",
        "corequisite": true
      }],
      [{
        "initials": "MAT1203",
        "corequisite": true
      }, {
        "initials": "MAT1610"
      }]
    ],
    "relation": null,
    "restrictions": null,
    "equivalences": [{
      "initials": "ICE1003"
    }, {
      "initials": "ICE1513"
    }, {
      "initials": "ICM1022"
    }]
  }
}
```

## Testing

Clone the project and run:

```sh
npm test
```

[ci-image]: https://travis-ci.org/mrpatiwi/buscacursos-uc.svg
[ci-url]: https://travis-ci.org/mrpatiwi/buscacursos-uc
[lint-image]: https://codeclimate.com/github/mrpatiwi/buscacursos-uc/badges/gpa.svg
[lint-url]: https://codeclimate.com/github/mrpatiwi/buscacursos-uc
[dependencies-image]: https://david-dm.org/mrpatiwi/buscacursos-uc.svg
[dependencies-url]: https://david-dm.org/mrpatiwi/buscacursos-uc
[dev-dependencies-image]: https://david-dm.org/mrpatiwi/buscacursos-uc/dev-status.svg
[dev-dependencies-url]: https://david-dm.org/mrpatiwi/buscacursos-uc#info=devDependencies
