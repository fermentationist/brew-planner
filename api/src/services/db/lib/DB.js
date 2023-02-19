/* global console, setTimeout */
import mysql from "mysql2";
import { OperationalError, ProgramError } from "../../../server/errors.js";
import proxyMysqlDeadlockRetries from "node-mysql-deadlock-retries";

const formWhere = function (exactAttributes, queryParams) {
  let whereClause = "";
  let join = "WHERE ";
  const values = [];
  for (const attr of exactAttributes) {
    if (Object.hasOwn(queryParams, attr) && queryParams[attr] !== "") {
      whereClause = whereClause + join + attr + "=?";
      join = " AND ";
      values.push(queryParams[attr]);
    }
  }
  return {
    sqlString: whereClause,
    values: values,
  };
};

const insertion = function (tablename, rows = [], attrs = [], ignore = true) {
  //Returning formatted sql string and values for insertion of attributes <attrs> of <rows> into <tablename>
  let sqlString = `INSERT ${ignore ? "IGNORE" : ""} INTO ${tablename}`;
  let join = "(";
  let valueString = "VALUES";
  let dupString = "ON DUPLICATE KEY UPDATE ";
  let dupJoin = "";
  let values = [];
  for (const attr of attrs) {
    if (Object.hasOwn(rows[0], attr)) {
      dupString += dupJoin + attr + "=VALUES(" + attr + ")";
      dupJoin = ", ";
      sqlString = sqlString + join + attr;
      join = ", ";
    }
  }
  join = ", ";
  for (const dataObj of rows) {
    if (rows.indexOf(dataObj) == rows.length - 1) {
      join = "";
    }
    const filteredAttrs = attrs.filter(attr => Object.hasOwn(dataObj, attr));
    valueString += valueClause(filteredAttrs.length) + join;
    values.push(...filteredAttrs.map(attr => dataObj[attr]));
  }
  sqlString += ") ";
  sqlString += valueString;
  sqlString += " " + dupString;
  return { sqlString, values };
};

const valueClause = length => `(${Array(length).fill("?").join(",")})`;

class DB {
  constructor(connParams) {
    // ProxyMysqlDeadlockRetries from npm to resolve pooled deadlocking
    const retries = 5; // How many times will the query be retried when the ER_LOCK_DEADLOCK error occurs
    const minMillis = 1; // The minimum amount of milliseconds that the system sleeps before retrying
    const maxMillis = 100; // The maximum amount of milliseconds that the system sleeps before retrying
    const pmdrDebug = 1; // Show all the debugs on how the proxy is working
    const show_all_errors = 1; // Show all errors that are outside of the proxy

    console.log(
      `MySQL connection info: host=${connParams.host} user=${connParams.user} database=${connParams.database}`
    );
    this.pool = mysql.createPool({
      multipleStatements: true,
      connectionLimit: 5,
      ...connParams,
    });
    this.pool.on("connection", function (connection) {
      proxyMysqlDeadlockRetries(
        connection,
        retries,
        minMillis,
        maxMillis,
        pmdrDebug,
        show_all_errors
      );
    });
    this.isLocked = false; // While isLocked = true, queries that are called will halt (see "this.connectionQuery")
    this.insertion = insertion; // exporting for test cases
  }

  close(callback) {
    return this.pool.end(callback);
  }

  replaceTable(tablename, attributes, rows, deleteParams, callback) {
    const deleteObj = formWhere(attributes, deleteParams);
    const deleteSqlString =
      "DELETE FROM " + tablename + " " + deleteObj.sqlString;
    const insertObj = insertion(tablename, rows, attributes);
    this.pool.getConnection(function (error, connection) {
      if (error) {
        return callback(error, connection);
      }
      connection.beginTransaction(function (err) {
        if (err) {
          console.error(err);
          connection.release();
          return callback(err);
        }
        connection.query(
          deleteSqlString,
          deleteObj.values,
          function (error, results, fields) {
            if (error) {
              return connection.rollback(function () {
                connection.release();
                console.error(error);
                callback(error);
              });
            }
            connection.query(
              insertObj.sqlString,
              insertObj.values,
              function (error, results, fields) {
                if (error) {
                  return connection.rollback(function () {
                    connection.release();
                    console.error(error);
                    callback(error);
                  });
                }
                connection.commit(function (error) {
                  if (error){
                    return connection.rolllback(function () {
                      connection.release();
                      console.error(error);
                      callback(error);
                    });
                  }
                  connection.release();
                  callback(error, results, fields);
                });
              }
            );
          }
        );
      });
    });
  }

  replaceTableProm(tablename, attributes, rows, deleteParams) {
    return new Promise((resolve, reject) => {
      this.replaceTable(
        tablename,
        attributes,
        rows,
        deleteParams,
        function (error, results) {
          if (error) {
            return reject(error);
          }
          return resolve(results);
        }
      );
    });
  }

  connectionQuery(connection, sqlString, values, callback) {
    if (this.isLocked) {
      // wait while locked
      console.log("db connection paused");
      setTimeout(() => {
        this.connectionQuery(connection, sqlString, values, callback);
      }, 1000);
      return;
    }
    connection.query(sqlString, values, function (error, results, fields) {
      connection.release();
      if (error) {
        if (
          error.sqlState == "45000" ||
          error.sqlState == "45001" ||
          error.sqlState == "23000"
        ) {
          return callback(
            new OperationalError(error.sqlMessage, { sqlState: error.sqlState })
          );
        } else {
          console.log("QUERY ERROR");
          console.error(error);
          return callback(new ProgramError(error.sqlMessage));
        }
      }
      // debug(results);
      return callback(error, results, fields);
    });
  }

  query(sqlString, values, callback) {
    this.pool.getConnection((error, connection) => {
      if (error) {
        console.error(error);
        throw error;
      }
      this.connectionQuery(connection, sqlString, values, callback);
    });
  }

  queryAndLock(sqlString, values, callback) {
    //locks before query, and unlocks after query has finished
    this.pool.getConnection((error, connection) => {
      if (error) {
        console.log(error);
        throw error;
      }
      this.isLocked = true;
      connection.query(sqlString, values, (error, results, fields) => {
        this.isLocked = false;
        connection.release();
        if (error) {
          if (
            error.sqlState === "45000" ||
            error.sqlState === "45001" ||
            error.sqlState === "23000"
          ) {
            return callback(
              new OperationalError(error.sqlMessage, {
                sqlState: error.sqlState,
              })
            );
          } else {
            return callback(new ProgramError(error.sqlMessage));
          }
        }
        return callback(error, results, fields);
      });
    });
  }

  queryProm(sqlString, values = []) {
    //promise version of query
    return new Promise((resolve, reject) => {
      this.query(sqlString, values, function (error, results) {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      });
    });
  }

  transaction(callback) {
    this.pool.getConnection(function (error, connection) {
      if (error) {
        callback(error, connection);
      } else {
        connection.beginTransaction(function (err) {
          callback(err, connection);
        });
      }
    });
  }

  insert(tablename, attributes, rows, callback, ignore = true) {
    //Inserting the <attributes> of <rows> into <tablename>
    const insertObj = insertion(tablename, rows, attributes, ignore);
    const sqlString = insertObj.sqlString;
    const values = insertObj.values;
    this.query(sqlString, values, callback);
  }

  insertProm(tablename, attributes, rows, ignore = true) {
    //Inserting the <attributes> of <rows> into <tablename> with a promise
    const insertObj = insertion(tablename, rows, attributes, ignore);
    const sqlString = insertObj.sqlString;
    const values = insertObj.values;
    return this.queryProm(sqlString, values);
  }

  select(tablename, attributes, params, callback) {
    //Selecting <attributes> of <tablename> where <params> are true
    const obj = formWhere(attributes, params);
    let sqlString =
      "SELECT " + attributes.join(", ") + " FROM " + tablename + " ";
    sqlString = sqlString + obj.sqlString;
    this.query(sqlString, obj.values, callback);
  }

  selectProm(tablename, attributes, params) {
    //Selecting <attributes> of <tablename> where <params> are true with a promise
    const obj = formWhere(attributes, params);
    let sqlString =
      "SELECT " + attributes.join(", ") + " FROM " + tablename + " ";
    sqlString = sqlString + obj.sqlString;
    return this.queryProm(sqlString, obj.values);
  }

  update(tablename, attributes, updates, params, callback) {
    //Updating <attributes> of <tablename> with <updates> where <params> are true
    let sqlString = "UPDATE " + tablename + " SET";
    let nextChar = " ";
    let values = [];
    for (const attr of attributes) {
      if (Object.hasOwn(updates, attr)) {
        sqlString = sqlString + nextChar + attr + "=?";
        values.push(updates[attr]);
        nextChar = ", ";
      }
    }
    const whereObj = formWhere(attributes, params);
    values = values.concat(whereObj.values);
    sqlString = sqlString + " " + whereObj.sqlString;
    this.query(sqlString, values, callback);
  }

  updateProm(tablename, attributes, updates, params, singleRow = false) {
    //Updating <attributes> of <tablename> with <updates> where <params> are true
    let sqlString = "UPDATE " + tablename + " SET";
    let nextChar = " ";
    let values = [];
    for (const attr of attributes) {
      if (Object.hasOwn(updates, attr)) {
        sqlString = sqlString + nextChar + attr + "=?";
        values.push(updates[attr]);
        nextChar = ", ";
      }
    }
    const whereObj = formWhere(attributes, params);
    values = values.concat(whereObj.values);
    sqlString = sqlString + " " + whereObj.sqlString;
    if (singleRow) {
      sqlString += " LIMIT 1";
    }
    return this.queryProm(sqlString, values);
  }

  delete(tablename, attributes, params, callback) {
    const obj = formWhere(attributes, params);
    let sqlString = "DELETE FROM " + tablename + " ";
    sqlString = sqlString + obj.sqlString;
    if (Object.hasOwn(params, "limit")) {
      sqlString += " LIMIT " + params.limit;
    }
    this.query(sqlString, obj.values, callback);
  }

  deleteProm(tablename, attributes, params) {
    const obj = formWhere(attributes, params);
    let sqlString = "DELETE FROM " + tablename + " ";
    sqlString = sqlString + obj.sqlString;
    if (Object.hasOwn(params, "limit")) {
      sqlString += " LIMIT " + params.limit;
    }
    return this.queryProm(sqlString, obj.values);
  }
}

export default DB;
