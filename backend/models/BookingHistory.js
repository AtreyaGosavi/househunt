import mongoose from 'mongoose';

const bookingHistorySchema = new mongoose.Schema(
  {
    // Spec uses 'user'; backward-compat virtual 'userId' added below.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'BookingHistory must reference a user'],
      index: true,
    },
    // Spec uses 'property'; backward-compat virtual 'propertyId' added below.
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'BookingHistory must reference a property'],
      index: true,
    },
    // Optional: link back to the Booking document if this view was booking-related
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    viewedOn: {
      type: Date,
      default: Date.now,
      index: true,               // supports "recently viewed" queries sorted by date
    },
    // Track where the view originated (e.g. 'search', 'direct', 'recommendation')
    source: {
      type: String,
      enum: ['search', 'direct', 'recommendation', 'other'],
      default: 'direct',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => { delete ret.__v; return ret; },
      virtuals: true,
    },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────
// Backward-compat aliases for controllers that still use the old field names
bookingHistorySchema.virtual('userId').get(function () { return this.user; });
bookingHistorySchema.virtual('propertyId').get(function () { return this.property; });
bookingHistorySchema.virtual('bookingId').get(function () { return this.booking; });

// ─── Compound Indexes ─────────────────────────────────────────────────────────
// "Recently viewed by user" query — most common read pattern
bookingHistorySchema.index({ user: 1, viewedOn: -1 });
// "All users who viewed this property" — useful for owner analytics
bookingHistorySchema.index({ property: 1, viewedOn: -1 });
// Avoid duplicate "viewed" entries for the same user+property within a session
// (use unique: false here; deduplication is handled at the service layer)
bookingHistorySchema.index({ user: 1, property: 1 });

const BookingHistory = mongoose.model('BookingHistory', bookingHistorySchema);
export default BookingHistory;
