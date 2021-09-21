"use strict";
jest.setTimeout(10000)
const db = require("../db.js");
const {
    BadRequestError,
    NotFoundError
} = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "job",
        salary: 100,
        equity: 0,
        company_handle: "c1"
    };

    test("works", async function () {
        let company = await Job.create(newJob);
        expect(company).toEqual({
            id: 5,
            title: "job",
            salary: 100,
            equity: "0",
            company_handle: "c1"
        });

        const result = await db.query(
            `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'job'`);
        expect(result.rows).toEqual([{
            title: "job",
            salary: 100,
            equity: "0",
            company_handle: "c1"
        }, ]);
    });
});

/************************************** getAll */

describe("getAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.getAll();
        expect(jobs).toEqual([{
                id: 1,
                title: "j1",
                salary: 10,
                equity: "0.05",
                companyhandle: "c1"
            },
            {
                id: 2,
                title: "j2",
                salary: 20,
                equity: "0",
                companyhandle: "c2"
            },
            {
                id: 3,
                title: "j3",
                salary: 200,
                equity: "0",
                companyhandle: "c3"
            },
            {
                id: 4,
                title: "j4",
                salary: 30,
                equity: "0",
                companyhandle: "c3"
            },
        ]);
    });

    test("works: filters by title", async function () {
        let jobs = await Job.getAll({
            title: "j1",
        });
        expect(jobs).toEqual([{
            id: 1,
            title: "j1",
            salary: 10,
            equity: "0.05",
            companyhandle: "c1"
        }])
    })

    test("works: filters by minSalary", async function () {
        let jobs = await Job.getAll({
            minSalary: 30
        });
        expect(jobs).toEqual([{
            id: 3,
            title: "j3",
            salary: 200,
            equity: "0",
            companyhandle: "c3"
        },
        {
            id: 4,
            title: "j4",
            salary: 30,
            equity: "0",
            companyhandle: "c3"
        },])
    })

    test("works: filters by equity", async function () {
        let jobs = await Job.getAll({
            hasEquity: true
        });
        expect(jobs).toEqual([{
            id: 1,
            title: "j1",
            salary: 10,
            equity: "0.05",
            companyhandle: "c1"
        }])
    })
});

/************************************** get */

describe("get", function () {
    test("works", async function () {
        let job = await Job.get(1);
        expect(job).toEqual({
            id: 1,
            title: "j1",
            salary: 10,
            equity: "0.05",
            company_handle: "c1"
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(12);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("update", function () {
    const updateData = {
        title: "job1",
        salary: 100,
        equity: "0.1",
    };

    test("works", async function () {
        let job = await Job.update(1, updateData);
        expect(job).toEqual({
            id: 1,
            ...updateData,
            companyHandle: 'c1'
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
        expect(result.rows).toEqual([{
            id: 1,
            title: "job1",
            salary: 100,
            equity: "0.1",
            company_handle: 'c1'
        }]);
    });

    test("works: null fields", async function () {
        const updateDataSetNulls = {
            title: "job1",
            salary: null,
            equity: null,
        };

        let company = await Job.update(1, updateDataSetNulls);
        expect(company).toEqual({
            id: 1,
            ...updateDataSetNulls,
            companyHandle: "c1"
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
        expect(result.rows).toEqual([{
            id: 1,
            title: "job1",
            salary: null,
            equity: null,
            company_handle: "c1"
        }]);
    });

    test("not found if no such job", async function () {
        try {
            await Job.update(12, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        try {
            await Job.update(1, {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("delete", function () {
    test("works", async function () {
        await Job.delete(1);
        const res = await db.query(
            "SELECT id FROM jobs WHERE id = 1");
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such job", async function () {
        try {
            await Job.delete(7);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});