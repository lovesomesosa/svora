import express, { Request, Response } from "express";
import router from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cors from "cors";
import path from "node:path";

const app = express();
const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api", router);
app.use(errorMiddleware);

app.get("/", (req: Request, res: Response) => {
  res.send("svora-manager backend started successfully!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
