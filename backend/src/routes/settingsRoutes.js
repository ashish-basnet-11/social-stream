import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { updatePrivacySettings, getMySettings } from '../controllers/settingsController.js';

const router = express.Router();

// All settings routes are protected
router.use(protect);

router.get("/me", getMySettings);
router.put("/privacy", updatePrivacySettings);

export default router;