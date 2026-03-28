import express, { Request, Response } from "express";
import router from "./routes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from AI Decision Helper backend!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
