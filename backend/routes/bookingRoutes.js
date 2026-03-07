import express from 'express';
import {
  createBooking,
  getUserBookings,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('Tenant'), createBooking);
router.get('/user', protect, getUserBookings);
router.put('/:id/status', protect, authorize('Owner', 'Admin'), updateBookingStatus);

export default router;
