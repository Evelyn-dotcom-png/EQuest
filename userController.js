const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  const { email, password } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await userModel.createUser(email, hashedPassword);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: 'Error creating user' });
  }
};

module.exports = { registerUser };