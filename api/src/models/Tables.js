import Table from "./Table.js";

const Tables = {};

const tableNames = [
  "brewery",
  "brewhouse",
  "recipe",
  "fermentable",
  "hop",
  "water"
];

for (const tableName of tableNames) {
  Tables[tableName] = new Table(tableName);
  await Tables[tableName].init();
}

export default Tables;