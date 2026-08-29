const express = require("express");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const router = express.Router();


// CREATE
router.post("/", createProduct);

// READ ALL
router.get("/", getProducts);

// READ ONE
router.get("/:productId", getProductById);

// UPDATE
router.put("/:productId", updateProduct);

// DELETE
router.delete("/:productId", deleteProduct);


module.exports = router;