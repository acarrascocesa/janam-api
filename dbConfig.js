const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true // Agregar esta línea para confiar en todos los certificados, incluso los autofirmados
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};


const getConnection = async () => {
    try {
        const pool = await sql.connect(dbConfig);
        return pool;
    } catch (err) {
        console.error('SQL error', err);
        throw err;
    }
};

module.exports = { getConnection, sql };
