const Pool = require('pg').Pool
const pool = new Pool({
    user : "postgres",
    host : "localhost",
    database : "dbms_mini_project",
    password : "root",
    port : 5432
})
pool.connect()
module.exports = pool