import express from "express";
import dotenv from "dotenv";
import parseRouter from './routes/parse.js';
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT | 5050;

app.use("/api",parseRouter)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("<h1>Welcome to the Backend Server</h1>");
});
