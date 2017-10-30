# QuickSearch

QuickSearch is a small web app for searching a relational database, conceived as a quickly deployable app to allow untrained staff to easily search a database.

It is written with Express, Pug and Vue.js.

## Running

1. Install dependencies with `npm install`
2. Set up development database with `npx knex seed:run`
3. Run the app with `npm start`
4. Test it out at http://localhost:3000

## Configuration

The configuration file `config.js` allows you to customise QuickSearch for your purposes.

### `config.search`
- `tableName` - The view/table in the database to query
- `headerField` - The column to display as a heading for each result
- `keyField` - A unique column to identify the results, usually `id`
- `searchFields` - An array of the columns to search
- `displayFields` - An array of `field` objects. A `field` object contains a `label` and a `columnName`.


## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
