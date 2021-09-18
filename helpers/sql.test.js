const {sqlForPartialUpdate} = require("./sql")
const data ={
    numEmployees: 10, 
    logoUrl: "some_url"
}

const toSql =  {
    numEmployees: "num_employees",
    logoUrl: "logo_url",
}

describe("sqlForPartialUpdate", function(){
    test("returns object with sql for columns and values", function(){
        const result = sqlForPartialUpdate(data, toSql)
        expect(result).toEqual({
            setCols: '"num_employees"=$1, "logo_url"=$2',
            values: [ 10, 'some_url' ]
        })
    })

    test("throws error when no data is in objects", function(){
        expect(() => {
            sqlForPartialUpdate({}, {})
        }).toThrow('No data')
    })
})