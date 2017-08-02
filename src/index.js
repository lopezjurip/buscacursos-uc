"use strict";

import BuscaCursosClient from "./client";

const BASE_URL = "http://buscacursos.uc.cl";

export default function createClient({ baseUrl, fetch, $ }) {
  return new BuscaCursosClient(baseUrl || BASE_URL, fetch, $);
}
