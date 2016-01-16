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
[
    {
        "year": 2015,
        "period": 2,
        "NRC": 16146,
        "initials": "FIS1513",
        "droppable": true,
        "english": false,
        "section": 1,
        "specialApproval": false,
        "name": "Estática y Dinámica",
        "teachers": [
            {
                "name": "Reyes Sebastian",
                "photoURL": "http://buscacursos.uc.cl/getFotoProfe.db.php?nombre=Reyes%20Sebastian&semestre=2015-2&sigla=FIS1513&seccion=1"
            }
        ],
        "credits": 10,
        "vacancy": {
            "total": 153,
            "available": 30
        },
        "schedule": [
            {
                "identifier": "CAT",
                "location": {
                    "campus": "San Joaquin",
                    "place": "A1"
                },
                "modules": [
                    {
                        "day": "L",
                        "hours": [
                            2
                        ]
                    },
                    {
                        "day": "W",
                        "hours": [
                            2
                        ]
                    },
                    {
                        "day": "V",
                        "hours": [
                            2
                        ]
                    }
                ]
            },
            {
                "identifier": "AYUD",
                "location": {
                    "campus": "San Joaquin",
                    "place": "A1"
                },
                "modules": [
                    {
                        "day": "J",
                        "hours": [
                            6
                        ]
                    }
                ]
            }
        ],
        "school": "Física",
        "information": "El curso presenta los principios fundamentales para el estudio de la estática y dinámica de sistemas mecánicos y estructurales discretos rígidos y deformables. El curso se basa en la aplicación de los tres pilares fundamentales de la mecánica clásica: la cinemática, el equilibrio, y las leyes constitutivas. El curso comienza con el estudio detallado de la cinemática del movimiento de partículas, sistemas de partículas y cuerpos. Se plantean luego las leyes y ecuaciones constitutivas fundamentales que relacionan la cinemática con las fuerzas que actúan sobre los cuerpos, conjuntamente con los principios fundamentales de energía mecánica y trabajo. Utilizando, la cinemática y las leyes constitutivas, se estudian distintas herramientas para plantear el equilibrio de los sistemas mecánicos y estructurales, con énfasis en los principios de energía y trabajos virtuales. El curso enfatiza la construcción y análisis de modelos físicos y matemáticos de sistemas mecánicos y estructurales reales.",
        "requisites": {
            "requirements": [
                {
                    "prerequisites": [
                        "FIS1503",
                        "MAT1203"
                    ],
                    "corequisites": [
                        "MAT1620"
                    ]
                },
                {
                    "prerequisites": [
                        "MAT1610"
                    ],
                    "corequisites": [
                        "MAT1203"
                    ]
                }
            ],
            "relation": null,
            "restrictions": [],
            "equivalences": [
                "ICE1003",
                "ICE1513",
                "ICM1022"
            ]
        }
    }
]
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
