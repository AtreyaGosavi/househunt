import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,           // normalise to lowercase before saving
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true,               // fast look-ups during login
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[\d\s\-().]{7,15}$/, 'Please provide a valid phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        // Only run strength check on plain-text passwords (not yet hashed)
        validator: function (value) {
          if (this.isModified('password') && !value.startsWith('$2')) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/.test(value);
          }
          return true;
        },
        message:
          'Password must be at least 8 characters and contain uppercase, lowercase, a number, and a special character',
      },
      select: false,             // exclude from query results by default
    },
    // Canonical field name requested by the spec ('role'); kept as alias so
    // existing controllers that read req.user.userType still work.
    role: {
      type: String,
      enum: {
        values: ['Tenant', 'Owner', 'Admin'],
        message: '{VALUE} is not a supported role',
      },
      default: 'Tenant',
    },
    profileImage: {
      type: String,
      default: '',
    },
    currentLocation: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,             // allows soft-deactivation without deleting the document
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,            // auto createdAt + updatedAt
    toJSON: {
      // Strip sensitive/internal fields when the document is serialised
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
      virtuals: true,
    },
    toObject: { virtuals: true },
  }
);

// ─── Virtual ─────────────────────────────────────────────────────────────────
// Backward-compatible getter: code that reads `user.userType` still works
userSchema.virtual('userType').get(function () {
  return this.role;
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });

// ─── Pre-save Hook : hash password ───────────────────────────────────────────
// NOTE: Mongoose 7+ async middleware does NOT receive a `next` callback.
// Simply return from the async function; Mongoose awaits it automatically.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Method : compare password ──────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
