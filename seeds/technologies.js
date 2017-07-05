exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex.schema.dropTableIfExists('technologies')
    .then(() => knex.schema.createTable('technologies', table => {
      table.increments('id');
      table.string('name');
      table.string('url');
      table.string('category');
      table.timestamps(true, true);
    }))
    .then(() => knex('technologies').insert([
      {
        id: 1,
        name: 'Node.js',
        url: 'https://nodejs.org/',
        category: 'Platform'
      }, {
        id: 2,
        name: 'Pug',
        url: 'https://pugjs.org/',
        category: 'Rendering engine'
      }, {
        id: 3,
        name: 'Javascript',
        url: 'https://en.wikipedia.org/wiki/JavaScript',
        category: 'Language'
      }, {
        id: 4,
        name: 'Knex',
        url: 'http://knexjs.org/',
        category: 'Database utility'
      }
    ]));
};
