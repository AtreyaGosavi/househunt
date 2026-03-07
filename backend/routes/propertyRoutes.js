import express from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getProperties)
  .post(protect, authorize('Owner', 'Admin'), upload.array('images', 10), createProperty);

router.route('/:id')
  .get(getPropertyById)
  .put(protect, authorize('Owner', 'Admin'), updateProperty)
  .delete(protect, authorize('Owner', 'Admin'), deleteProperty);

// Dedicated image upload endpoint
router.post('/:id/images', protect, authorize('Owner', 'Admin'), upload.array('images', 10), async (req, res) => {
  try {
    const { Property } = await import('../models/Property.js');
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const newImages = req.files.map(f => `/uploads/properties/${f.filename}`);
    property.images.push(...newImages);
    await property.save();
    res.json({ images: property.images });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
