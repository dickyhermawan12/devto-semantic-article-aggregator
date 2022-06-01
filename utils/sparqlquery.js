const endpointUrl = 'http://icvmdev.duckdns.org:3030/devto/sparql'

function obtainAuthorQuery() {
  return `
  PREFIX schema: <https://schema.org/>
  PREFIX devto: <https://dev.to/>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

  SELECT DISTINCT
    ?id
    ?name
    ?image
    ?location
    ?joinedOn
    ?website
    ?education
    ?work
  WHERE {
    ?id a devto:Person .
    ?id schema:name ?name .
    ?id schema:image ?image .
    ?id schema:location ?location .
    ?id schema:dateCreated ?joinedOn .
    ?id schema:sameAs ?website .
    ?id schema:educationalLevel ?education .
    ?id schema:affiliation ?work .
  }
  `
}

function obtainTagsQuery() {
  return `
  PREFIX schema: <https://schema.org/>
  PREFIX devto: <https://dev.to/>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

  SELECT DISTINCT
    ?tags
  WHERE {
    ?id a devto:Article .
    ?id schema:keywords ?tags .
  }
  ORDER BY ?tags
  `
}

function obtainArticleQuery(filters, orderValues) {
  const { search, author, tags } = filters
  let tagFilter = '', orderBy = '';
  if (tags.length !== 0) {
    tags.forEach((tag) => {
      tagFilter += tagFilter === '' ? tag : `|${tag}`
    })
  }

  if (orderValues.length !== 0) {
    // [ { attr: 'datePosted' , mod: 'desc' } ]
    orderValues.forEach(a => {
      orderBy += a.mod === 'asc' ? ` ?${a.attr}` : ` DESC(?${a.attr})`;
    });
  }
  return `
  PREFIX schema: <https://schema.org/>
  PREFIX devto: <https://dev.to/>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

  SELECT DISTINCT
    ?id
    ?name
    ?description
    ?author
    ?image
    ?url
    ?datePosted
    ?reactions
    ?tags
  WHERE {
    ?id a devto:Article .
    ?id schema:name ?name .
    ?id schema:description ?description .
    ?id devto:Person/schema:name ?author .
    ?id schema:image ?image .
    ?id schema:url ?url .
    ?id schema:datePublished ?datePosted .
    ?id schema:ratingValue ?reactions .
    ?id schema:keywords ?tags .
    FILTER REGEX(?name, "${search ?? ''}", "i")
    FILTER REGEX(?author, "${author ?? ''}", "i")
    FILTER EXISTS {
      ?id schema:keywords ?tagFilter .
      FILTER (REGEX(?tagFilter, "${tagFilter}", "i"))
    }
  }
  ORDER BY ${orderValues.length !== 0 ? orderBy : 'DESC(?datePosted)'}
  `
}

module.exports = {
  obtainTagsQuery,
  obtainAuthorQuery,
  obtainArticleQuery,
  endpointUrl,
}
