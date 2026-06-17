import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/eshop-admin";

// Define schema inline to avoid imports issues
const OrderSchema = new mongoose.Schema({
  createdAt: Date
});

const Order = mongoose.model("Order", OrderSchema);

async function refreshDates() {
  try {
    console.log("Connecting to database at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to update.`);

    if (orders.length === 0) {
      console.log("No orders found to update.");
      process.exit(0);
    }

    const now = new Date();

    for (let i = 0; i < orders.length; i++) {
      // Scatter orders randomly over the last 6 days
      const daysAgo = Math.floor(Math.random() * 6);
      const orderDate = new Date();
      orderDate.setDate(now.getDate() - daysAgo);
      // Random hour/minute
      orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      orders[i].createdAt = orderDate;
      await orders[i].save();
    }

    console.log("Successfully updated all order dates to the current week!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating dates:", error);
    process.exit(1);
  }
}

refreshDates();
