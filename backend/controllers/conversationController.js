import { z } from "zod";
import { processConversationTurn, processVoiceTurn } from "../services/conversationService.js";

const messageSchema = z.object({
  message: z.string().min(1),
  draft: z.record(z.any()).default({}),
  messages: z.array(z.record(z.any())).default([])
});

const voiceSchema = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.string().default("audio/webm"),
  draft: z.record(z.any()).default({}),
  messages: z.array(z.record(z.any())).default([])
});

export async function handleMessage(req, res, next) {
  try {
    const payload = messageSchema.parse(req.body);
    const result = await processConversationTurn(payload);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleVoice(req, res, next) {
  try {
    const payload = voiceSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({
        error: "No voice audio was received. Please hold the mic, speak for at least 1 second, and try again."
      });
    }
    const result = await processVoiceTurn(payload.data);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
