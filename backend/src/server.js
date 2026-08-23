const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(express.json());

connectDB();

const productRoutes = require("./routes/productRoutes");

app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("SupplyChainIQ API is running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});