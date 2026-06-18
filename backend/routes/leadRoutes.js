import { Router } from "express";
import { createLead, getLead } from "../controllers/leadController.js";

const router = Router();

router.post("/", createLead);
router.get("/:reference", getLead);

export default router;
