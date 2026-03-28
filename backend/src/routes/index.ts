import { Router } from "express";
import { exampleHandler } from "../controllers/exampleController";

const router = Router();

router.get("/example", exampleHandler);

export default router;
