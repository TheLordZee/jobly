"use strict";

const {
    query
} = require("express");
const db = require("../db");
const {
    sqlForPartialUpdate,
    makeJobQuery
} = require("../helpers/sql");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");

/** Related functions for jobs. */
class Job {
    /**Create a job (from data), update db, return new job data.
     *
     * data should be { title, salary, equity, companyHandle }
     *
     * Returns { id, title, salary, equity, companyHandle } */
    static async create({
        title,
        salary,
        equity,
        companyHandle
    }) {
        const res = await db.query(`
            INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS companyHandle`,
            [title, salary, equity, companyHandle])

        const job = res.rows[0];

        return job;
    }

    /** Find all jobs.
     *
     * Returns [{ id, title, salary, equity, companyHandle }, ...]
     * 
     * Takes a filter object and filters job by the added filters
     * 
     * Filter can use title, minSalary, and/or hasEquity which are passed as keys.
     * */
    static async getAll(filter = {}) {
        const query = makeJobQuery(filter);
        const res = await db.query(`
            SELECT id, title, salary, equity, company_handle
            FROM jobs
            ${query.query}`, query.value)
        return res.rows
    }

    /**Find all jobs for a specific company
     * 
     * Returns [{ id, title, salary, equity, companyHandle }, ...]
     */
    static async getCompanyJobs(handle){
        const res = await db.query(`
            SELECT id, title, salary, equity, company_handle
            FROM jobs
            WHERE company_handle = $1`, [handle])
        return res.rows
    }

    /** Given a job id, return data about job.
     *
     * Returns { id, title, salary, equity, companyHandle }
     *
     * Throws NotFoundError if not found.
     **/
    static async get(id) {
        const res = await db.query(`
        SELECT id, title, salary, equity, company_handle
        FROM jobs
        WHERE id = $1
        RETURNING id, title, salary, equity, company_handle AS companyHandle`,
        [id])

        const job = res.rows[0];

        if(!job) throw new NotFoundError(`No job with id ${id}`)

        return job;
    }

    /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */


    static async update(id, data){
        const { setCols, values } = sqlForPartialUpdate(
        data,
        {})
        const handleVarIdx = "$" + (values.length + 1);

        const query = `UPDATE jobs
                        SET ${setCols}
                        WHERE id = ${handleVarIdx}
                        RETURNING id,
                                title,
                                salary,
                                equity,
                                company_handle AS "companyHandle"`;
        const res = await db.query(query, [...values, id]);
        const job = res.rows[0];

        if(!job) throw new NotFoundError(`No job with id ${id}`)

        return job;
    }

    /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/
    static async delete(id){
        const rest = await db.query(`
            DELETE
            FROM jobs
            WHERE id = $1
            RETURNING id`,
            [id])
        
        const job = res.rows[0];

        if(!job) throw new NotFoundError(`No job with id ${id}`)
    }
}

module.exports = Job;