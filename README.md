# Buscacursos UC Client

[![Build Status][ci-image]][ci-url] [![dependencies][dependencies-image]][dependencies-url] [![dev-dependencies][dev-dependencies-image]][dev-dependencies-url]

Perform queries to [buscacursos.uc.cl](http://buscacursos.uc.cl/) and get the results as JSON objects.

## Install

Using `npm`:

```sh
npm install --save buscacursos-uc
```

## Usage

```javascript
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import buscacursos from 'buscacursos-uc';

const client = buscacursos({ fetch, $: cheerio });

const query = {
  'cxml_semestre': '2016-2',
  'cxml_sigla': 'ICS2613',
};

// It's a Promise!
client.getCourses(query)
  .then(courses => {
    const promises = courses.map(course => {
      return Promise.all([
        client.getInformation(course).then(information => Object.assign(course, { information })),
        client.getRequisites(course).then(requisites => Object.assign(course, { requisites })),
      ]).then(() => course).catch(err => course); // return course as the result of the promise chain
    });
    return Promise.all(promises);
  })
  .then(courses => {
    console.log(JSON.stringify(courses, null, 4));
  })
  .catch(err => {
    console.error(err);
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

The results are from page of at most 50 courses. The `Promise` returns an array of courses with the following schema:

### Example

```json
{
    "year": 2016,
    "period": 2,
    "school": "Ingeniería",
    "NRC": "13530",
    "initials": "ICS2613",
    "droppable": true,
    "english": false,
    "section": 1,
    "specialApproval": false,
    "category": "",
    "name": "Contabilidad y Control de Gestión",
    "campus": "San Joaquín",
    "credits": "10",
    "vacancy": {
        "total": 85,
        "available": 3
    },
    "schedule": {
        "raw": [
            {
                "type": "CLAS",
                "when": "M-J:4",
                "where": "E11"
            },
            {
                "type": "AYU",
                "when": "W:5",
                "where": "B17"
            }
        ],
        "schematic": [
            {
                "day": "M",
                "hours": [
                    {
                        "hour": "4",
                        "module": {
                            "type": "CLAS",
                            "classroom": "E11",
                            "campus": "San Joaquín"
                        }
                    }
                ]
            },
            {
                "day": "J",
                "hours": [
                    {
                        "hour": "4",
                        "module": {
                            "type": "CLAS",
                            "classroom": "E11",
                            "campus": "San Joaquín"
                        }
                    }
                ]
            },
            {
                "day": "W",
                "hours": [
                    {
                        "hour": "5",
                        "module": {
                            "type": "AYU",
                            "classroom": "B17",
                            "campus": "San Joaquín"
                        }
                    }
                ]
            }
        ],
        "normalized": {
            "M": {
                "4": {
                    "type": "CLAS",
                    "classroom": "E11",
                    "campus": "San Joaquín"
                }
            },
            "J": {
                "4": {
                    "type": "CLAS",
                    "classroom": "E11",
                    "campus": "San Joaquín"
                }
            },
            "W": {
                "5": {
                    "type": "AYU",
                    "classroom": "B17",
                    "campus": "San Joaquín"
                }
            }
        }
    },
    "teachers": [
        {
            "name": "Soto Carlos",
            "photoUrl": "http://buscacursos.uc.cl/getFotoProfe.db.php?nombre=Soto%20Carlos&semestre=2016-2&sigla=ICS2613&seccion=1"
        }
    ],
    "information": "El propósito de este curso es introducir al alumno a los principios, conceptos y supuestos utilizados en la contabilidad financiera. Se discutirán los usos y limitaciones de los Estados Financieros a partir de una perspectiva de los procedimientos contables utilizados para realizarlos y, así, entenderlos comprehensivamente. En todo caso, el énfasis del curso se concentrará en el uso de la información contable para la evaluación de la gestión y riesgo de las corporaciones bajo análisis.",
    "requisites": {
        "raw": [
            [
                "No tiene",
                "No tiene",
                "(Creditos >= 270)"
            ],
            [
                "(ICS2512 o ICS2522)"
            ]
        ]
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
[dependencies-image]: https://david-dm.org/mrpatiwi/buscacursos-uc.svg
[dependencies-url]: https://david-dm.org/mrpatiwi/buscacursos-uc
[dev-dependencies-image]: https://david-dm.org/mrpatiwi/buscacursos-uc/dev-status.svg
[dev-dependencies-url]: https://david-dm.org/mrpatiwi/buscacursos-uc#info=devDependencies
