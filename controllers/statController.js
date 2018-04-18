const axios = require('axios');
const Pool = require('pg-pool');
const { Client } = require('pg');

const options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.HUGINN_DB_NAME,
  password: process.env.DB_PASS,
  max: 10,
  min: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
};

async function getRSSStat(req, res) {
  try {
    options.database = process.env.RSS_DB_NAME;
    const client = new Client(options);
    client.connect();

    const { rows } = await client.query(`
        SELECT count(t.*)
        FROM ttrss_entries t
        WHERE t.date_entered >  current_date - interval '7 days'
        GROUP BY date_trunc('day', t.date_entered)
        ORDER BY date_trunc('day', t.date_entered);
    `);
    client.end();
    res.status(200).json(rows);
  } catch (error) {
    Error(error);
  }
}

async function getHuginnStat(req, res) {
  try {
    options.database = process.env.HUGINN_DB_NAME;
    const client = new Client(options);
    client.connect();

    const { rows } = await client.query(`
        SELECT count(t.*)
        FROM events t
        WHERE t.created_at >  current_date - interval '7 days'
        GROUP BY date_trunc('day', t.created_at)
        ORDER BY date_trunc('day', t.created_at);
    `);
    client.end();
    res.status(200).json(rows);
  } catch (error) {
    Error(error);
  }
}

async function getDockerRSSStat(req, res) {
  try {
    const result = await axios.get('https://hub.docker.com/v2/repositories/wangqiru/ttrss/',);
    res.status(200).json(result.data);
  } catch (error) {
    Error(error);
  }
}

module.exports = {
  getRSSStat,
  getHuginnStat,
  getDockerRSSStat,
};
