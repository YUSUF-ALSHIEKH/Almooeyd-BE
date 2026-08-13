const express = require("express")
const cors = require("cors")
const authRoutes = require("./routes/authRoutes")
const productRoutes = require("./routes/productRoutes")
require("dotenv").config()

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Routes mounting
app.use("/auth", authRoutes)
app.use("/api/products", productRoutes)
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
