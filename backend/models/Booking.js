import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    // Spec uses 'tenant'; backward-compat virtual 'tenantId' added below.
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a tenant'],
      index: true,
    },
    // Spec uses 'property'; backward-compat virtual 'propertyId' added below.
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Booking must reference a property'],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        // Cross-field validation: endDate must be after startDate
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    bookingDate: {
      type: Date,
      default: Date.now,
      immutable: true,           // once set, booking date should never change
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Cancelled', 'Rejected'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'Pending',
      index: true,
    },
    // Optional: capture cancellation / rejection reason for transparency
    statusReason: {
      type: String,
      trim: true,
      maxlength: [300, 'Status reason cannot exceed 300 characters'],
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
// Keep backward compat with controllers that reference booking.tenantId / booking.propertyId
bookingSchema.virtual('tenantId').get(function () { return this.tenant; });
bookingSchema.virtual('propertyId').get(function () { return this.property; });

// Convenience virtual: length of stay in whole days
bookingSchema.virtual('durationDays').get(function () {
  if (!this.startDate || !this.endDate) return null;
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// ─── Compound Indexes ─────────────────────────────────────────────────────────
// Owner dashboard: "show me all bookings for my properties"
bookingSchema.index({ property: 1, status: 1 });
// Tenant dashboard: "show me all my bookings"
bookingSchema.index({ tenant: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
