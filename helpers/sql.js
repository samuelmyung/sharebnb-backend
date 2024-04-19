"use strict";

const { BadRequestError } = require("../expressError");

/** Given parameters of an object with updated data and an object to map JS keys
 * to the table column names, generates SQL query components to perform updates
 * in the database.
 *
 * Returns => {
      setCols: '"first_name"=$1, "age"=$2',
      values: ["Aliya", 32]
    }
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql, allowedColumns) {
  // {firstName: "Aliya", age: 32} => ["firstName", "age"]
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  const filteredKeys = keys.filter(colName => allowedColumns.includes(colName));

  // ["firstName", "age"] => ['"first_name"=$1', '"age"=$2']
  const cols = filteredKeys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    // '"first_name"=$1, "age"=$2'
    setCols: cols.join(", "),
    // ["Aliya", 32]
    values: filteredKeys.map(key => dataToUpdate[key]),
  };
}

module.exports = { sqlForPartialUpdate };
