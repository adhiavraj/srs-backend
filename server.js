import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import generateSRSRoute from "./routes/generateSRS.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cors({
  origin: "https://srs-pdf.pages.dev",
  methods: ["GET", "POST"],
}));

// Routes
app.use("/api", generateSRSRoute);

app.get("/", (req, res) => {
  res.send("Welcome to SRS PDF Generator");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
