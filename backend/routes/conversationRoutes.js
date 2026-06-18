import { Router } from "express";
import { handleMessage, handleVoice } from "../controllers/conversationController.js";

const router = Router();

router.post("/message", handleMessage);
router.post("/voice", handleVoice);

export default router;
