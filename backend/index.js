import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import parseRouter from "./routes/parse.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["https://resume-parser-dev.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const PORT = process.env.PORT | 5050;

app.use("/api", parseRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("<h1>Welcome to the Backend Server</h1>");
});
