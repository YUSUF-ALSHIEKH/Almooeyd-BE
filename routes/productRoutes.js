const express = require("express")
const router = express.Router()
const {
  getProducts,
  addProduct,
  getProductById,
} = require("../controllers/productController")

router.get("/", getProducts)
router.post("/add", addProduct)
router.get("/:id", getProductById)
module.exports = router
