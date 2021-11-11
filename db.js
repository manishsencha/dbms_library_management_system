const Pool = require("pg").Pool
const config = require("./dbconfig")
const pool = new Pool(config)
pool.connect()
module.exports = pool
