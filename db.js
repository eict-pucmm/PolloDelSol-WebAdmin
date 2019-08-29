const sql = require('mssql')
const config = require('./config')

const poolPromise = new sql.ConnectionPool(config.values.azure)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL')
    return pool
  })
  .catch(err => console.log('Database Connection Failed! Bad Config: ', err))


  /*
  *   @sql no se usa en ningun lado y es lo mismo que importar @mssql
  *   No tienen que exportar sql, solo poolPromise
  */
module.exports = {
  sql, poolPromise
}