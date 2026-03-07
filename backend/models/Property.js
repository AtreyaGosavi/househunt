import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    // Spec uses 'owner'; kept both so old references to 'ownerId' still resolve
    // via the virtual below.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Property must belong to an owner'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true,               // fuzzy search queries filter on this field
    },
    rentAmount: {
      type: Number,
      required: [true, 'Rent amount is required'],
      min: [0, 'Rent amount must be a positive number'],
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: {
        values: ['Apartment', 'House', 'Villa', 'Studio', 'Condo'],
        message: '{VALUE} is not a valid property type',
      },
      index: true,
    },
    furnishingStatus: {
      type: String,
      required: [true, 'Furnishing status is required'],
      enum: {
        values: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
        message: '{VALUE} is not a valid furnishing status',
      },
    },
    bedrooms: {
      type: Number,
      required: [true, 'Number of bedrooms is required'],
      min: [0, 'Bedrooms cannot be negative'],
      default: 1,
    },
    bathrooms: {
      type: Number,
      min: [0, 'Bathrooms cannot be negative'],
      default: 1,
    },
    sqft: {
      type: Number,
      min: [0, 'Square footage cannot be negative'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'A property can have at most 10 images',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['Available', 'Booked'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Available',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,             // soft-delete flag; admins can deactivate listings
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

// ─── Virtual ─────────────────────────────────────────────────────────────────
// Keep backward compat with controllers that still reference `property.ownerId`
propertySchema.virtual('ownerId').get(function () {
  return this.owner;
});

// ─── Compound Indexes ─────────────────────────────────────────────────────────
// Common search pattern: location + propertyType + status
propertySchema.index({ location: 1, propertyType: 1, status: 1 });
// Range query: rentAmount
propertySchema.index({ rentAmount: 1 });

const Property = mongoose.model('Property', propertySchema);
export default Property;
