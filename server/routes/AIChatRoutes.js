import express from 'express';
import { handleProfileSearchChat } from '../controllers/AIChatController.js';

const router = express.Router();

router.post('/profile-search', handleProfileSearchChat);

export default router;