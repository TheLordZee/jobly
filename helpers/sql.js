const { BadRequestError } = require("../expressError");
const {ExpressError} = require("../expressError");

/** Takes two objects and returns the sql for the columns based on the keys and the values based on the first objects values */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


/**Takes the filter object from the get all companies route and generates the need sql statement to filter for name, maxEmployee, and minEmployee*/
function makeCompanyQuery(filter){
  const keys = Object.keys(filter)
  const values = Object.values(filter)
  let query;
  const value = []

  if(keys.length > 0){
    query = "WHERE "
  }
  if(filter.minEmployees && filter.maxEmployees && 
    (parseInt(filter.minEmployees) > parseInt(filter.maxEmployees))){
      throw new ExpressError("minEmployees cannot be greater than maxEmployees", 400)
  }
  for(let i = 0; i < keys.length; i++){
    let res = '';
    let operation, column;
    if(keys[i-1] !== undefined){
      res = " AND "
    }
    
    switch(keys[i]){
      case "name":
        operation = "ILIKE";
        value.push(`%${values[i]}%`)
        column = 'name';
        break;
      case "minEmployees":
        operation = ">=";
        value.push(values[i]);
        column = 'num_employees';
        break;
      case "maxEmployees":
        operation = "<=";
        value.push(values[i]);
        column = 'num_employees';
        break;
      default:
        console.log("invalid filter");
    }
    res = res + `${column} ${operation} $${i+1}`
    query = query + res;
  }
  return {query, value};
}

function makeJobQuery(filter) {
  const keys = Object.keys(filter)
  const values = Object.values(filter)
  let query;
  const value = []

  if(keys.length > 0){
    query = "WHERE "
  }

  for(let i = 0; i < keys.length; i++){
    let res = '';
    let operation, column;
    if(keys[i-1] !== undefined){
      res = " AND "
    }
    
    if(keys[i] === "hasEquity" && values[i] === "true"){
      values.push(0);
      res = res + `equity >= $${i+1}`
      query = query + res;
    }

    if(keys[i] !== "hasEquity"){
    switch(keys[i]){
      case "title":
        operation = "ILIKE";
        value.push(`%${values[i]}%`)
        column = 'title';
        break;
      case "minSalary":
        operation = ">=";
        value.push(values[i]);
        column = 'num_employees';
        break;
      default:
        console.log("invalid filter");
    }
      res = res + `${column} ${operation} $${i+1}`
      query = query + res;
    }
    
  }
  return {query, value};
}

module.exports = { sqlForPartialUpdate, makeCompanyQuery, makeJobQuery };
