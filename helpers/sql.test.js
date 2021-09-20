const {sqlForPartialUpdate, makeCompanyQuery} = require("./sql")

describe("sqlForPartialUpdate", function(){
    const data ={
        numEmployees: 10, 
        logoUrl: "some_url"
    }
    
    const toSql =  {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
    }

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

describe("makeCompanyQuery", function(){
    test("can filter by name", function(){
   
       const res = makeCompanyQuery({"name": "test"});
       expect(res).toEqual({ query: 'WHERE name ILIKE $1', value: [ '%test%' ] })
    })
    test("can filter by minEmployee", function(){
       const res = makeCompanyQuery({minEmployees: 50})
       expect(res).toEqual( { query: 'WHERE num_employees > $1', value: [ 50 ] })
    })
    test("can filter by maxEmployee", function(){
        const res = makeCompanyQuery({maxEmployees: 50})
        expect(res).toEqual( { query: 'WHERE num_employees < $1', value: [ 50 ] })
    })
    test("can filter by multiple values", function(){
        const res = makeCompanyQuery({name: 'test', maxEmployees: 50})
        expect(res).toEqual( { query: 'WHERE name ILIKE $1 AND num_employees < $2', value: [ '%test%', 50 ] })
    })
    test("minEmployee > maxEmployee throws error", function(){
        expect(()  => {makeCompanyQuery({minEmployees: 100, maxEmployees: 50})}).toThrow('minEmployees cannot be greater than maxEmployees');
    })
})