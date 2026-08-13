const pool = require("../db/db")
const bcrypt = require("bcrypt")
const { createToken } = require("../middleware")

const signup = async (req, res) => {
  const { name, email, password } = req.body

  try {
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ])
    if (userCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Email already exists. Please sign in." })
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    )

    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: "Server error during sign up" })
  }
}

//sign in
const login = async (req, res) => {
  const { email, password } = req.body
  console.log("Login attempt for email:", email)
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ])
    if (user.rows.length === 0) {
      console.log("User not found in database")
      return res
        .status(404)
        .json({ message: "Email not found. Please sign up first!" })
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password)
    console.log("Password matches database?:", validPassword)
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password." })
    }

    // Define the payload you want to store inside the token
    const payload = {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
    }

    // Generate the JWT token using the payload
    const token = createToken(payload)

    res.json({
      message: "Login successful",
      token: token, // Send token back to the frontend
      user: payload,
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: "Server error during login" })
  }
}

const checkSession = async (req, res) => {
  const { payload } = res.locals
  res.send(payload)
}

module.exports = {
  signup,
  login,
  checkSession,
}
