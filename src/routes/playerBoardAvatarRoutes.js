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
import { auth } from "../middleware/auth.js";

const router = Router();

// Create (upload)
router.post("/avatars", upload.single("boardAvatar"), createAvatar); // admin side

// Select (list + get)
router.get("/allavatars", listAvatars); // admin side
router.put("/:id", auth, getAvatar); // client unity side

// Update (metadata and/or replace image)
router.patch("/:id", upload.single("boardAvatar"), updateAvatar); // admin side

// Delete
router.delete("/:id", deleteAvatar); // admin side

// Optional: add purchaser
router.post("/:id/purchase", addPurchaser); 

export default router;
