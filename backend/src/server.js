const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(express.json());

connectDB();

const productRoutes = require("./routes/productRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const inventoryTransactionRoutes = require("./routes/inventoryTransactionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/inventory-transactions",inventoryTransactionRoutes);
app.use("/api/analytics",analyticsRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("SupplyChainIQ API is running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});