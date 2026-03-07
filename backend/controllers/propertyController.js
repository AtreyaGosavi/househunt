import Property from '../models/Property.js';

// Levenshtein distance for fuzzy matching
const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
};

// Returns the best matching location given all distinct db locations
const fuzzyMatchLocation = (input, allLocations) => {
  if (!input) return null;
  const lower = input.toLowerCase();
  let best = null, bestScore = Infinity;
  for (const loc of allLocations) {
    const score = levenshtein(lower, loc.toLowerCase());
    if (score < bestScore) { bestScore = score; best = loc; }
  }
  // Accept if within distance of 3 characters (catches "pnue" -> "pune")
  return bestScore <= 3 ? best : null;
};

// @desc    Get all properties (with search & filter)
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    const { 
      location, 
      minPrice, 
      maxPrice, 
      propertyType, 
      bedrooms, 
      amenities 
    } = req.query;

    const query = {};

    if (location) {
      // Fuzzy match: first get all distinct locations from DB
      const allLocations = await Property.distinct('location');
      const matchedLocation = fuzzyMatchLocation(location, allLocations);

      if (matchedLocation) {
        // Use the corrected location for exact (case-insensitive) match
        query.location = { $regex: `^${matchedLocation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' };
      } else {
        // Fallback: partial regex match on original input
        query.location = { $regex: location, $options: 'i' };
      }
    }
    
    if (minPrice || maxPrice) {
      query.rentAmount = {};
      if (minPrice) query.rentAmount.$gte = Number(minPrice);
      if (maxPrice) query.rentAmount.$lte = Number(maxPrice);
    }
    
    if (propertyType) {
      query.propertyType = propertyType;
    }
    
    if (bedrooms) {
      query.bedrooms = { $gte: Number(bedrooms) };
    }
    
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      query.amenities = { $in: amenitiesArray };
    }

    const properties = await Property.find(query)
      .populate('owner', 'name email phone profileImage')
      .sort({ status: 1, createdAt: -1 });   // Available (A) before Booked (B), newest first
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone profileImage');

    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a property
// @route   POST /api/properties
// @access  Private (Owner/Admin)
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      rentAmount,
      propertyType,
      furnishingStatus,
      amenities,
      bedrooms,
      sqft
    } = req.body;

    // Parse amenities — may arrive as JSON string (from FormData) or array
    let parsedAmenities = [];
    if (amenities) {
      try { parsedAmenities = JSON.parse(amenities); }
      catch { parsedAmenities = typeof amenities === 'string' ? amenities.split(',').map(s => s.trim()).filter(Boolean) : amenities; }
    }

    // Images: use uploaded files if present, otherwise fall back to body.images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(f => `/uploads/properties/${f.filename}`);
    } else if (req.body.images) {
      try { imageUrls = JSON.parse(req.body.images); }
      catch { imageUrls = typeof req.body.images === 'string' ? req.body.images.split(',').map(s => s.trim()).filter(Boolean) : req.body.images; }
    }

    const property = new Property({
      owner: req.user._id,
      title,
      description,
      location,
      rentAmount,
      propertyType,
      furnishingStatus,
      amenities: parsedAmenities,
      images: imageUrls,
      bedrooms,
      sqft: sqft ? Number(sqft) : undefined,
      status: 'Available'
    });

    const createdProperty = await property.save();
    res.status(201).json(createdProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private (Owner/Admin)
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (property) {
      // Ensure the user is the owner or an admin (support both role/userType fields)
      const ownerId = (property.owner || property.ownerId)?.toString();
      const userRole = req.user.role || req.user.userType;
      if (ownerId !== req.user._id.toString() && userRole !== 'Admin') {
        return res.status(401).json({ message: 'Not authorized to update this property' });
      }

      property.title = req.body.title || property.title;
      property.description = req.body.description || property.description;
      property.location = req.body.location || property.location;
      property.rentAmount = req.body.rentAmount || property.rentAmount;
      property.propertyType = req.body.propertyType || property.propertyType;
      property.furnishingStatus = req.body.furnishingStatus || property.furnishingStatus;
      property.amenities = req.body.amenities || property.amenities;
      property.images = req.body.images || property.images;
      property.bedrooms = req.body.bedrooms || property.bedrooms;
      property.status = req.body.status || property.status;

      const updatedProperty = await property.save();
      res.json(updatedProperty);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private (Owner/Admin)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (property) {
      // Ensure the user is the owner or an admin (support both role/userType fields)
      const ownerId = (property.owner || property.ownerId)?.toString();
      const userRole = req.user.role || req.user.userType;
      if (ownerId !== req.user._id.toString() && userRole !== 'Admin') {
        return res.status(401).json({ message: 'Not authorized to delete this property' });
      }

      await Property.deleteOne({ _id: property._id });
      res.json({ message: 'Property removed' });
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
