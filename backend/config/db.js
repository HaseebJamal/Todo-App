import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL is connected");
    client.release();
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();

export default pool;