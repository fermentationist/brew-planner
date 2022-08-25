/* global describe, before, it, after */
import db from "../index.js";
import assert from "assert";

// Appending current timestamp to table name will help ensure we don't accidentally overwrite any existing tables
const TEST_TABLE = process.env.TEST_TABLE_PREFIX + "_" + Date.now();

const stdout = [];
const origStdoutWrite = process.stdout.write;

// Spies
const stdoutSpy = (chunk, ...otherArgs) => {
  if (typeof chunk === "string") {
    stdout.push(chunk.replace("\n", ""));
  } else {
    stdout.push(chunk);
  }
  return origStdoutWrite(chunk, ...otherArgs);
};

// Utility functions
const randomNum = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomString = length => {
  const chars = "1234567890abcdefghijklmnopqrstuvwxyz";
  return Array(length)
    .fill(null)
    .map(() => chars[randomNum(0, chars.length - 1)])
    .join("");
};

const randomTable = numRows => {
  const table = Array(numRows)
    .fill(null)
    .map(() => {
      return {
        message: randomString(10)
      };
    });
  return table;
};

//============================= TESTS ==============================//

export default describe("services", () => {
  describe("database", () => {
    describe("unit tests", function () {
      let testKey = null;

      before(async function () {
        // setup for tests
        const sqlString = `
          CREATE TABLE IF NOT EXISTS ${TEST_TABLE} (
            test_key BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
            message TEXT
          )
        `;
        await db.queryProm(sqlString, []);
      });

      it("query - SELECT", function (done) {
        const sqlString = `
          SELECT * FROM ${TEST_TABLE};
          SELECT NOW() AS now;
        `;
        db.query(sqlString, [], (error, results) => {
          if (error) {
            throw error;
          }

          assert(Array.isArray(results[0]), "results should be an array.");

          assert(
            results[1][0].now instanceof Date,
            "SELECT NOW() should return a Date object"
          );

          done();
        });
      });

      it("query - INSERT", function (done) {
        const testMessage = randomString(10);
        const sqlString = `
          INSERT INTO ${TEST_TABLE} (message) 
          VALUES (?);
        `;
        db.query(sqlString, [testMessage], (error, results) => {
          if (error) {
            throw error;
          }

          assert.strictEqual(
            results.affectedRows,
            1,
            "affectedRows should equal 1."
          );

          testKey = results.insertId;
          const sqlString = `
            SELECT message FROM ${TEST_TABLE} 
            WHERE test_key = ?;
          `;
          db.query(sqlString, [testKey], (error, results) => {
            if (error) {
              throw error;
            }

            assert.strictEqual(
              results[0].message,
              testMessage,
              `message should equal "${testMessage}".`
            );

            done();
          });
        });
      });

      it("query - UPDATE", function (done) {
        const newMessage = randomString(10);
        const sqlString = `
          UPDATE ${TEST_TABLE} SET message = ?
          WHERE test_key = ?;
        `;
        db.query(sqlString, [newMessage, testKey], async (error, results) => {
          if (error) {
            throw error;
          }
          const sqlString = `
            SELECT message FROM ${TEST_TABLE} 
            WHERE test_key = ?;
          `;
          db.query(sqlString, [testKey], (error, results) => {
            if (error) {
              throw error;
            }

            assert.strictEqual(
              results[0].message,
              newMessage,
              `message should equal "${newMessage}"`
            );

            done();
          });
        });
      });

      it("query - DELETE", function (done) {
        const sqlString = `
          DELETE FROM ${TEST_TABLE}
          WHERE test_key = ?;
        `;
        db.query(sqlString, [testKey], (error, results) => {
          if (error) {
            throw error;
          }

          assert.strictEqual(
            results.affectedRows,
            1,
            "affectedRows should equal 1."
          );

          const sqlString = `
            SELECT test_key FROM ${TEST_TABLE}
            WHERE test_key = ?;
          `;
          db.query(sqlString, [testKey], (error, results) => {
            if (error) {
              throw error;
            }

            assert.strictEqual(
              results.length,
              0,
              "There should be zero results returned."
            );

            done();
          });
        });
      });

      it("queryProm - SELECT", async function () {
        const sqlString = `SELECT * FROM ${TEST_TABLE};`;
        const results = await db.queryProm(sqlString, []);

        assert(Array.isArray(results), "results should be an array.");
      });

      it("queryProm - INSERT", async function () {
        const testMessage = randomString(10);
        let sqlString = `
          INSERT INTO ${TEST_TABLE} (message)
          VALUES (?);
        `;
        const insertResults = await db.queryProm(sqlString, [testMessage]);

        assert.strictEqual(
          insertResults.affectedRows,
          1,
          "affectedRows should equal 1"
        );

        testKey = insertResults.insertId;
        sqlString = `
          SELECT message FROM ${TEST_TABLE}
          WHERE test_key = ?;
        `;
        const selectResults = await db.queryProm(sqlString, [testKey]);

        assert.strictEqual(
          selectResults[0].message,
          testMessage,
          `message should equal "${testMessage}".`
        );
      });

      it("queryProm - UPDATE", async function () {
        const newMessage = randomString(10);
        const sqlString = `
          UPDATE ${TEST_TABLE} SET message = ?
          WHERE test_key = ?;
        `;
        const results = await db.queryProm(sqlString, [newMessage, testKey]);

        assert.strictEqual(
          results.affectedRows,
          1,
          "affectedRows should equal 1."
        );

        const selectString = `
          SELECT message FROM ${TEST_TABLE}
          WHERE test_key = ?;
        `;
        const [selectResults] = await db.queryProm(selectString, [testKey]);

        assert.strictEqual(selectResults.message, newMessage);
      });

      it("queryProm - SELECT (with options)", async function () {
        const sqlString = `
          SELECT * FROM ${TEST_TABLE}
          WHERE test_key = ?;`;
        const values = [testKey];
        const options = { nestTables: true, sql: sqlString };
        const response = await db.queryProm(options, values);
        assert(Array.isArray(response), "response should be an array.");
        const results = response[0][TEST_TABLE];
        assert.strictEqual(
          typeof results,
          "object",
          "results should be in nested table form, per the options passed"
        );
        assert.strictEqual(results.test_key, testKey);
        assert.strictEqual(typeof results.message, "string");
      });

      it("queryProm - DELETE", async function () {
        let sqlString = `
          DELETE FROM ${TEST_TABLE}
          WHERE test_key = ?;
        `;
        const deleteResults = await db.queryProm(sqlString, [testKey]);

        assert.strictEqual(
          deleteResults.affectedRows,
          1,
          "affectedRows should equal 1."
        );

        sqlString = `
          SELECT * FROM ${TEST_TABLE} 
          WHERE test_key = ?
        `;
        const selectResults = await db.queryProm(sqlString, [testKey]);

        assert.strictEqual(
          selectResults.length,
          0,
          "There should be zero results returned."
        );
      });

      it("queryAndLock", function (done) {
        const sleepTime = 1; // in seconds
        this.timeout((sleepTime + 1) * 1000);
        process.stdout.write = stdoutSpy; // use spy
        const sqlString1 = `SELECT SLEEP(${sleepTime});`;
        const sqlString2 = `SELECT * FROM ${TEST_TABLE};`;
        db.queryAndLock(sqlString1, [], (error, results) => {
          // should cause connection to be "paused"
          if (error) {
            throw error;
          }
        });
        db.query(sqlString2, [], (error, results) => {
          // second query will be temporarily blocked by first query, causing "db connection paused" to be logged
          if (error) {
            throw error;
          }
        });
        setTimeout(() => {
          process.stdout.write = origStdoutWrite; // remove spy
          assert.strictEqual(
            stdout.includes("db connection paused"),
            true,
            `The message "db connection paused" should have been sent to stdout.`
          );

          done();
        }, sleepTime * 1000);
      });

      it("insert - single", function (done) {
        const testMessage = randomString(10);
        db.insert(
          TEST_TABLE,
          ["message"],
          [{ message: testMessage }],
          (error, results) => {
            if (error) {
              throw error;
            }
            testKey = results.insertId;

            assert.strictEqual(
              results.affectedRows,
              1,
              "affectedRows should equal 1."
            );

            const sqlString = `
            SELECT message FROM ${TEST_TABLE}
            WHERE test_key = ?
          `;
            db.query(sqlString, [testKey], (error, results) => {
              assert.strictEqual(
                results[0].message,
                testMessage,
                `message should be equal to "${testMessage}"`
              );

              done();
            });
          }
        );
      });

      it("insert - multiple", function (done) {
        const testRows = Array(randomNum(2, 10))
          .fill(null)
          .map(() => {
            return {
              message: randomString(10)
            };
          });
        db.insert(TEST_TABLE, ["message"], testRows, (error, results) => {
          if (error) {
            throw error;
          }
          testKey = results.insertId;

          assert.strictEqual(
            results.affectedRows,
            testRows.length,
            `affectedRows should equal ${testRows.length}.`
          );

          const sqlString = `SELECT message FROM ${TEST_TABLE};`;
          db.query(sqlString, [], (error, results) => {
            if (error) {
              throw error;
            }
            const foundMessages = results.map(result => result.message);
            const expectedMessages = testRows.map(row => row.message);
            for (const message of expectedMessages) {
              assert(
                foundMessages.includes(message),
                `Messages in table should include message: ${message}`
              );
            }
            done();
          });
        });
      });

      it("insertProm", async function () {
        const testMessage = randomString(10);
        const insertResults = await db.insertProm(
          TEST_TABLE,
          ["message"],
          [{ message: testMessage }]
        );

        assert.strictEqual(
          insertResults.affectedRows,
          1,
          "affectedRows should equal 1."
        );

        testKey = insertResults.insertId;
        const sqlString = `
          SELECT message FROM ${TEST_TABLE}
          WHERE test_key = ?
        `;
        const [selectResult] = await db.queryProm(sqlString, [testKey]);

        assert.strictEqual(
          selectResult.message,
          testMessage,
          `message should be equal to "${testMessage}"`
        );
      });

      it("select", function (done) {
        db.select(TEST_TABLE, ["test_key", "message"], {}, (error, results) => {
          if (error) {
            throw error;
          }
          assert(results.length > 0);

          db.select(
            TEST_TABLE,
            ["test_key", "message"],
            { test_key: testKey },
            (error, results) => {
              if (error) {
                throw error;
              }

              assert.strictEqual(
                results[0].test_key,
                testKey,
                `Result should have test_key: ${testKey}`
              );

              assert(
                results[0].hasOwnProperty("message"),
                "Result should have a message"
              );

              done();
            }
          );
        });
      });

      it("selectProm", async function () {
        const results = await db.selectProm(
          TEST_TABLE,
          ["test_key", "message"],
          {}
        );
        assert(results.length > 0);

        const [result] = await db.selectProm(
          TEST_TABLE,
          ["test_key", "message"],
          {
            test_key: testKey
          }
        );

        assert.strictEqual(
          result.test_key,
          testKey,
          `Result should have test_key: ${testKey}`
        );

        assert(
          result.hasOwnProperty("message"),
          "Result should have a message"
        );
      });

      it("update", function (done) {
        const testMessage = randomString(10);
        db.update(
          TEST_TABLE,
          ["test_key", "message"],
          { message: testMessage },
          { test_key: testKey },
          (error, results) => {
            if (error) {
              throw error;
            }

            assert.strictEqual(
              results.affectedRows,
              1,
              "affectedRows should equal 1"
            );

            const sqlString = `
            SELECT * FROM ${TEST_TABLE}
            WHERE test_key = ?;
          `;
            db.query(sqlString, [testKey], (error, results) => {
              if (error) {
                throw error;
              }

              assert.strictEqual(
                results[0].message,
                testMessage,
                `message should be equal to "${testMessage}"`
              );

              done();
            });
          }
        );
      });

      it("updateProm", async function () {
        const testMessage = randomString(10);
        const results = await db.updateProm(
          TEST_TABLE,
          ["test_key", "message"],
          { message: testMessage },
          { test_key: testKey }
        );

        assert.strictEqual(
          results.affectedRows,
          1,
          "affectedRows should equal 1"
        );

        const sqlString = `
          SELECT * FROM ${TEST_TABLE}
          WHERE test_key = ?;
        `;
        const [selectResult] = await db.queryProm(sqlString, [testKey]);

        assert.strictEqual(
          selectResult.message,
          testMessage,
          `message should be equal to "${testMessage}"`
        );
      });

      it("delete", function (done) {
        db.delete(
          TEST_TABLE,
          ["test_key"],
          { test_key: testKey },
          (error, results) => {
            assert.strictEqual(
              results.affectedRows,
              1,
              "affectedRows should equal 1"
            );

            const sqlString = `
            SELECT * FROM ${TEST_TABLE}
            WHERE test_key = ?;
          `;
            db.query(sqlString, [testKey], (error, results) => {
              assert.strictEqual(
                results.length,
                0,
                "There should be zero results returned"
              );

              done();
            });
          }
        );
      });

      it("replaceTable", function (done) {
        const replacementTable = randomTable(randomNum(2, 10));
        db.replaceTable(
          TEST_TABLE,
          ["message"],
          replacementTable,
          {},
          (error, results) => {
            if (error) {
              throw error;
            }

            assert(
              results.affectedRows >= replacementTable.length,
              `At least ${replacementTable.length} rows should be affected`
            );

            const sqlString = `SELECT message FROM ${TEST_TABLE};`;
            db.query(sqlString, [], (error, results) => {
              if (error) {
                throw error;
              }
              const expectedMessages = replacementTable.map(obj => obj.message);

              for (const result of results) {
                assert(
                  expectedMessages.includes(result.message),
                  `Expected messages should include message: ${result.message}`
                );

                const resultIndex = expectedMessages.indexOf(result.message);
                expectedMessages.splice(resultIndex, 1); // remove found message from expectedMessages
              }

              assert.strictEqual(
                expectedMessages.length,
                0,
                "All expected messages should be accounted for"
              );

              done();
            });
          }
        );
      });

      it("replaceTableProm", async function () {
        const replacementTable = randomTable(randomNum(2, 10));
        const results = await db.replaceTableProm(
          TEST_TABLE,
          ["message"],
          replacementTable,
          {}
        );

        assert(
          results.affectedRows >= replacementTable.length,
          `At least ${replacementTable.length} rows should be affected`
        );

        const sqlString = `SELECT message FROM ${TEST_TABLE};`;
        const selectResults = await db.queryProm(sqlString, []);

        const expectedMessages = replacementTable.map(obj => obj.message);

        for (const result of selectResults) {
          assert(
            expectedMessages.includes(result.message),
            `Expected messages should include message: ${result.message}`
          );

          const resultIndex = expectedMessages.indexOf(result.message);
          expectedMessages.splice(resultIndex, 1); // remove found message from expectedMessages
        }

        assert.strictEqual(
          expectedMessages.length,
          0,
          "All expected messages should be accounted for"
        );
      });

      it("deleteProm", async function () {
        const sqlString = `
          SELECT test_key FROM ${TEST_TABLE}
          ORDER BY RAND() LIMIT 1;
        `;
        const [randomResult] = await db.queryProm(sqlString, []);
        const randomTestKey = randomResult.test_key;

        const results = await db.deleteProm(TEST_TABLE, ["test_key"], {
          test_key: randomTestKey
        });

        assert.strictEqual(
          results.affectedRows,
          1,
          "affectedRows should equal 1"
        );

        const sqlSelectString = `
          SELECT * FROM ${TEST_TABLE}
          WHERE test_key = ?;
        `;
        const selectResults = await db.queryProm(sqlSelectString, [
          randomTestKey
        ]);

        assert.strictEqual(
          selectResults.length,
          0,
          "There should be zero results returned"
        );
      });

      it("deleteProm - multiple", async function () {
        const results = await db.deleteProm(TEST_TABLE, [], {});

        assert(
          results.affectedRows > 0,
          "affectedRows should be greater than zero"
        );

        const sqlString = `SELECT * FROM ${TEST_TABLE};`;
        const selectResults = await db.queryProm(sqlString, []);
        assert.strictEqual(
          selectResults.length,
          0,
          "There should be zero results returned"
        );
      });

      after(async () => {
        // tear down
        const sqlString = `DROP TABLE ${TEST_TABLE};`;
        await db.queryProm(sqlString, []);
      });
    });
  });
});
