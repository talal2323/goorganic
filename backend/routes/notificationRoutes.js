import express from 'express';
const router = express.Router();
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

// All routes require authentication
router.use(protect);

// Get all notifications for logged-in user
router.get('/', getNotifications);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete all notifications
router.delete('/all', deleteAllNotifications);

// Mark specific notification as read
router.put('/:id/read', markAsRead);

// Delete specific notification
router.delete('/:id', deleteNotification);

export default router;
