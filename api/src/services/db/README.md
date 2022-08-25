# @spirithub/mysql

This MySQL database connector uses the "mysql" database driver for Node.js.

## Installation

To install from Github:
`npm install --save https://github.com/BigFishCraftSpirits/mysql`

After initial installation, it can be updated with:
`npm update @spirithub/mysql`

To install on remote server:
`npm install https://<username>:<github token>@github.com/BigFishCraftSpirits/mysql`
(Installing in this way will store your username and token in package.json, so be sure to discard this change to avoid committing credentials)

## Usage

```
const initDB = require("@spirithub/mysql");

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

