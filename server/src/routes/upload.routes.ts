import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.js";
import { csrfGuard } from "../middlewares/csrf.js";
import { prisma } from "../config/prisma.js";
import { uploadBuffer } from "../services/upload.service.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

export const uploadRouter = Router();

uploadRouter.post(
  "/media",
  requireAuth,
  csrfGuard,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "Missing file" });

    const allowed = ["image/", "video/", "audio/", "application/pdf", "text/"];
    if (!allowed.some((prefix) => req.file!.mimetype.startsWith(prefix))) {
      return res.status(400).json({ success: false, message: "Unsupported file type" });
    }

    const result = await uploadBuffer(req.file.buffer, `kaizu/${req.user!.id}`, req.file.mimetype);
    const media = await prisma.media.create({
      data: {
        ownerId: req.user!.id,
        type: req.file.mimetype.startsWith("image/")
          ? "IMAGE"
          : req.file.mimetype.startsWith("video/")
            ? "VIDEO"
            : req.file.mimetype.startsWith("audio/")
              ? "AUDIO"
              : "FILE",
        url: result.url,
        publicId: result.publicId,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size
      }
    });

    res.status(201).json({ success: true, media });
  })
);
