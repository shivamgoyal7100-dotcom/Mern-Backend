require("dotenv").config();
const app = require("./app");
const { connectDb } = require("./config/db");
const { connectRedis } = require("./config/redis");

const port = Number(process.env.PORT || 4000);

const start = async () => {
  try {
    await connectDb();
    await connectRedis();
    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
};

start();
