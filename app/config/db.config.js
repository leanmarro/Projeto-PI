require('dotenv').config()

module.exports = {
  HOST: process.env.DB_HOST,
  PORT: process.env.PORTMONGO,
  DB: process.env.DB
}
