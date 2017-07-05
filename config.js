module.exports = {
  pageTitle: "QuickSearch Example",
  search: {
    tableName: "technologies",
    orderBy: "id",
    searchFields: ["name", 'url', 'category'],
    headerField: "name",
    keyField: "id",
    displayFields: [
      {
        fieldLabel: 'Category',
        fieldName: 'category'
      },
      {
        fieldLabel: 'Website',
        fieldName: 'url'
      }
    ]
  },
  database: {
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
