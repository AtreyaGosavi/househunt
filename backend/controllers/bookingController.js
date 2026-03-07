import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Tenant)
export const createBooking = async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'Available') {
      return res.status(400).json({ message: 'Property is not available for booking' });
    }

    // Check if tenant already has a pending booking for this property
    const existingBooking = await Booking.findOne({
      property: propertyId,
      tenant: req.user._id,
      status: 'Pending',
    });
    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a pending request for this property' });
    }

    const booking = new Booking({
      property: propertyId,
      tenant: req.user._id,
      startDate,
      endDate,
      status: 'Pending',
    });

    const createdBooking = await booking.save();

    // Populate tenant & property info before sending response
    await createdBooking.populate('tenant', 'name email phone');
    await createdBooking.populate('property', 'title location rentAmount images');

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/user
// @access  Private
export const getUserBookings = async (req, res) => {
  try {
    const userRole = req.user.role || req.user.userType;

    if (userRole === 'Tenant') {
      const bookings = await Booking.find({ tenant: req.user._id })
        .populate('property', 'title location rentAmount images owner')
        .populate({
          path: 'property',
          populate: { path: 'owner', select: 'name email phone' },
        })
        .sort('-createdAt');
      return res.json(bookings);
    }

    if (userRole === 'Owner') {
      // Find all properties owned by this user
      const properties = await Property.find({ owner: req.user._id }).select('_id');
      const propertyIds = properties.map(p => p._id);

      const bookings = await Booking.find({ property: { $in: propertyIds } })
        .populate('property', 'title location rentAmount images')
        .populate('tenant', 'name email phone')
        .sort('-createdAt');
      return res.json(bookings);
    }

    if (userRole === 'Admin') {
      const bookings = await Booking.find({})
        .populate('property', 'title location rentAmount images')
        .populate('tenant', 'name email phone')
        .sort('-createdAt');
      return res.json(bookings);
    }

    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (Accept / Reject)
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner/Admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Only allow Confirmed or Rejected
    if (!['Confirmed', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Confirmed or Rejected.' });
    }

    const booking = await Booking.findById(req.params.id).populate('property');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Once decided, can't change
    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: `Booking already ${booking.status.toLowerCase()}. Decision is final.` });
    }

    const prop = booking.property;
    const userRole = req.user.role || req.user.userType;
    const propOwnerId = (prop?.owner)?.toString();

    if (propOwnerId !== req.user._id.toString() && userRole !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    if (status === 'Confirmed') {
      // Property goes BOOKED permanently — no longer visible to tenants
      await Property.findByIdAndUpdate(prop._id, { status: 'Booked' });

      // Reject all OTHER pending bookings for the same property
      await Booking.updateMany(
        { property: prop._id, _id: { $ne: booking._id }, status: 'Pending' },
        { status: 'Rejected', statusReason: 'Another booking was confirmed for this property' }
      );
    } else if (status === 'Rejected') {
      // Check if there are other pending bookings
      const otherPending = await Booking.countDocuments({
        property: prop._id,
        status: 'Pending',
      });
      // If no other pending bookings, make sure the property stays available
      if (otherPending === 0) {
        await Property.findByIdAndUpdate(prop._id, { status: 'Available' });
      }
    }

    // Return populated booking
    const updated = await Booking.findById(booking._id)
      .populate('property', 'title location rentAmount images status')
      .populate('tenant', 'name email phone');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
