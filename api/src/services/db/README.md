# @spirithub/mysql

This MySQL database connector uses the "mysql" database driver for Node.js.

## Usage

```
const initDB = require("./path_to/lib/index.js");

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  timezone: "utc"
}

const db = initDB(dbConfig);
...

db.query("SELECT * FROM test_table", [], (error, results) => {
  ...

});
```

## Configuration

#### Parameters:

- **host (required)**: The host address of the database
- **user (required)**: The database user name
- **password**: The database password
- **database (required)**: The name of the database to connect to
- **timezone**: The timezone configured on the MySQL server. This is used to type cast server date/time values to JavaScript `Date` objects and vice versa. This can be "local", "utc", or an offset in the form +HH:MM or -HH:MM. Default is "local".

