const pool = require("../db/db")

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await pool.query("SELECT * FROM products")
    res.json(products.rows)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: "Server error while fetching products" })
  }
}

// Add a new product
const addProduct = async (req, res) => {
  const { name, price, description, imageUrl, userId } = req.body

  try {
    const newProduct = await pool.query(
      "INSERT INTO products (name, price, description, image_url, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, price, description, imageUrl, userId]
    )

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct.rows[0],
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ message: "Server error while adding product" })
  }
}

const getProductById = async (req, res) => {
  const { id } = req.params

  try {
    // If you are using PostgreSQL with 'pg' pool:
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching product by ID:", error)
    res.status(500).json({ message: "Server error" })
  }
}
module.exports = {
  getProducts,
  addProduct,
  getProductById,
}
