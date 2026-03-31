import express, { Request, Response } from "express";
import router from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.send("svora-manager backend started successfully!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
