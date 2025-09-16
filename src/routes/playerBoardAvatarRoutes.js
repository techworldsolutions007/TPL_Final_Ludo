import { Router } from "express";
import {
  createAvatar,
  listAvatars,
  getAvatar,
  updateAvatar,
  deleteAvatar,
  addPurchaser
} from "../controllers/playerBoardavatarController.js";
import  upload  from "../middleware/uploadMiddleware.js";

const router = Router();

// Create (upload)
router.post("/avatars", upload.fields([{ name: "boardAvatarImage", maxCount: 1 }, { name: "boardAvatarActiveImage", maxCount: 1 }]), createAvatar);

// Select (list + get)
router.get("/allavatars", listAvatars);
router.put("/:id", getAvatar);

// Update (metadata and/or replace image)
router.patch("/:id", upload.fields([{ name: "boardAvatarImage", maxCount: 1 }, { name: "boardAvatarActiveImage", maxCount: 1 }]), updateAvatar); 

// Delete
router.delete("/:id", deleteAvatar);

// Optional: add purchaser
router.post("/:id/purchase", addPurchaser); 

export default router;
