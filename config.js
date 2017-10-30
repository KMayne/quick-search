module.exports = {
  // The heading at the top of the page & tab title
  pageTitle: "QuickSearch Example",
  search: {
    tableName: "technologies",
    orderBy: "id",
    headerField: "name",
    keyField: "id",
    searchFields: ["name", 'url', 'category'],
    displayFields: [
      {
        label: 'Category',
        columnName: 'category'
      },
      {
        label: 'Website',
        columnName: 'url'
      }
    ]
  },
  database: {
    // Knex config - see http://knexjs.org/#Installation-client
    development: {
      client: "sqlite3",
      // debug: true, // Uncomment this line to see query info on stdout
      connection: {
        filename: "./dev.db"
      },
      useNullAsDefault: true
    }
  }
};
