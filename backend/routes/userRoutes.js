import express from 'express';
import { getUserProfile, updateUserProfile, getUsers, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/update', protect, updateUserProfile);

// Admin routes
router.get('/', protect, authorize('Admin'), getUsers);
router.delete('/:id', protect, authorize('Admin'), deleteUser);

export default router;
