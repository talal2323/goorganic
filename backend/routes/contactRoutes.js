import express from 'express';
import { sendContactMessage } from '../controllers/contactController.js';

const router = express.Router();

// POST /api/v1/contact - Send contact form message (public route)
router.post('/', sendContactMessage);

export default router;
