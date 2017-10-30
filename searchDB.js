// Load DB config
const ENV = process.env.NODE_ENV;
const dbConfig = require('./knexfile')[ENV];
if (!dbConfig) {
  console.error(`No database configuration found for environment "${ENV}"`);
  process.exit(1);
}
const db = require('knex')(dbConfig);
const searchConfig = require('./config').search;

// Build field array
const selectFields = searchConfig.displayFields.map(field => field.fieldName);
if (!selectFields.includes(searchConfig.headerField)) {
  selectFields.push(searchConfig.headerField);
}
if (!selectFields.includes(searchConfig.keyField)) {
  selectFields.push(searchConfig.keyField);
}

// Ensure database connected
db.raw('SELECT 1 AS connected FROM ' + searchConfig.tableName)
  .then(result => {
    if (result[0].connected !== 1) console.warn('Bad connected value.');
    console.log('DB connected successfully.')
  })
  .catch(err => {
    console.error('Error connecting to the database', err);
    process.exit(1);
  });

module.exports = function searchDB(queryString, offset) {
  if (!queryString || queryString === '') return Promise.resolve([]);
  offset = offset || 0;
  queryString = escapeWildcards(queryString);
  let query = db.select(selectFields).from(searchConfig.tableName)
    .orderBy(searchConfig.orderBy)
    .limit(25)
    .offset(offset)
    .distinct()
  return searchConfig.searchFields.reduce((query, field) => {
    return query.orWhere(field, 'LIKE', `%${queryString}%`)
  }, query);
};

// Escape variable wildcards used in LIKE query
function escapeWildcards(string) {
  return string.replace(/[[%_]/g, '[$&]');
}
