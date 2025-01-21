const db = require('../config/db');

const createUser = async (email, password) => {
  const query = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *';
  const values = [email, password];
  const result = await db.query(query, values);
  return result.rows[0];
};

module.exports = { createUser };