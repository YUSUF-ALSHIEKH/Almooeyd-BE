const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config({ quiet: true })
const multer = require("multer")

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS)
const APP_SECRET = process.env.APP_SECRET

const hashPassword = async (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-/*+#])[A-Za-z\d@$!%*?&_\-/*+#]{8,}$/ // gibberish for password validation

  if (!passwordRegex.test(password)) {
    throw new Error(
      "Password recommendation: Use at least 8 characters, including uppercase, lowercase, a number, and a special character (@$!%*?&)."
    )
  }

  let hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  return hashedPassword
}

const comparePassword = async (password, storedPassword) => {
  let passwordMatch = await bcrypt.compare(password, storedPassword)

  return passwordMatch
}
const createToken = (payload) => {
  let token = jwt.sign(payload, APP_SECRET)
  return token
}
const stripToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]
      if (token) {
        res.locals.token = token
        return next()
      }
    }

    res
      .status(401)
      .send({ status: "Error", msg: "Unauthorized: No token provided" })
  } catch (error) {
    console.log(error)
    res.status(401).send({ status: "Error", msg: "Strip Token Error!" })
  }
}
const verifyToken = (req, res, next) => {
  const { token } = res.locals
  try {
    let payload = jwt.verify(token, APP_SECRET)
    if (payload) {
      res.locals.payload = payload
      return next()
    }
    res.status(401).send({ status: "Error", msg: "Unauthorized" })
  } catch (error) {
    console.log(error)
    res.status(401).send({ status: "Error", msg: "Verify Token Error!" })
  }
}
const isAdmin = (req, res, next) => {
  const { payload } = res.locals
  if (payload && payload.role === "admin") {
    return next()
  }
  res.status(403).send({ status: "Error", msg: "Admin Access Only" })
}
const isStaff = (req, res, next) => {
  const { payload } = res.locals
  if (payload && payload.role === "partner") {
    return next()
  }
  res.status(403).send({ status: "Error", msg: "Staff Access Only" })
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = file.originalname.split(".").pop()
    cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`)
  },
})
const upload = multer({ storage: storage })

module.exports = {
  hashPassword,
  comparePassword,
  createToken,
  stripToken,
  verifyToken,
  isAdmin,
  isStaff,
  upload,
}
