import React, { useState } from 'react';
import {
  Container, Typography, Box, TextField, Button, MenuItem, Grid, Alert,
  Paper, Chip, Stack, IconButton, InputAdornment
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const COMMON_AMENITIES = [
  'WiFi', 'Parking', 'Pool', 'Gym', 'AC', 'Power Backup',
  'Security', 'Lift', 'Garden', 'Laundry', 'Water Supply', 'CCTV',
];

const AddProperty = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    rentAmount: '',
    propertyType: '',
    furnishingStatus: '',
    bedrooms: 1,
    sqft: '',
  });
  const [amenities, setAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [imageFiles, setImageFiles] = useState([]); // File objects
  const [imagePreviews, setImagePreviews] = useState([]); // data-URL previews
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ── Amenities ── */
  const toggleAmenity = (a) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };
  const addCustomAmenity = () => {
    const val = customAmenity.trim();
    if (val && !amenities.includes(val)) {
      setAmenities(prev => [...prev, val]);
    }
    setCustomAmenity('');
  };
  const removeAmenity = (a) => {
    setAmenities(prev => prev.filter(x => x !== a));
  };

  /* ── Images ── */
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => /\.(jpe?g|png)$/i.test(f.name));
    if (validFiles.length !== files.length) {
      setError('Only .jpg, .jpeg, and .png images are allowed.');
      setTimeout(() => setError(''), 3000);
    }

    // Limit to 10 total
    const remaining = 10 - imageFiles.length;
    const toAdd = validFiles.slice(0, remaining);

    const newPreviews = toAdd.map(f => URL.createObjectURL(f));
    setImageFiles(prev => [...prev, ...toAdd]);
    setImagePreviews(prev => [...prev, ...newPreviews]);

    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('location', formData.location);
      fd.append('rentAmount', formData.rentAmount);
      fd.append('propertyType', formData.propertyType);
      fd.append('furnishingStatus', formData.furnishingStatus);
      fd.append('bedrooms', formData.bedrooms);
      if (formData.sqft) fd.append('sqft', formData.sqft);
      fd.append('amenities', JSON.stringify(amenities));

      // Images — first image is the poster
      imageFiles.forEach(f => fd.append('images', f));

      await api.post('/properties', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Property listed successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#F1F5F9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #E2E8F0' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>List a New Property</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>Fill in the details below to list your property on HouseHunt.</Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField required fullWidth label="Property Title" name="title"
                  placeholder="e.g. Spacious 2BHK in Koregaon Park"
                  value={formData.title} onChange={handleChange}
                />
              </Grid>

              {/* Location & Rent */}
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth label="Location" name="location"
                  placeholder="e.g. Pune, Hinjawadi"
                  value={formData.location} onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth type="number" label="Rent Amount (₹/month)" name="rentAmount"
                  value={formData.rentAmount} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                />
              </Grid>

              {/* Type, Furnishing, Bedrooms, Sqft */}
              <Grid item xs={12} sm={3}>
                <TextField select required fullWidth label="Type" name="propertyType"
                  value={formData.propertyType} onChange={handleChange}
                >
                  <MenuItem value="Apartment">Apartment</MenuItem>
                  <MenuItem value="House">House</MenuItem>
                  <MenuItem value="Villa">Villa</MenuItem>
                  <MenuItem value="Studio">Studio</MenuItem>
                  <MenuItem value="Condo">Condo</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField select required fullWidth label="Furnishing" name="furnishingStatus"
                  value={formData.furnishingStatus} onChange={handleChange}
                >
                  <MenuItem value="Furnished">Furnished</MenuItem>
                  <MenuItem value="Semi-Furnished">Semi-Furnished</MenuItem>
                  <MenuItem value="Unfurnished">Unfurnished</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField required fullWidth type="number" label="Bedrooms" name="bedrooms"
                  value={formData.bedrooms} onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth type="number" label="Area (sq.ft)" name="sqft"
                  placeholder="e.g. 1200"
                  value={formData.sqft} onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField required fullWidth multiline rows={4} label="Description" name="description"
                  placeholder="Describe your property — highlight key features, nearby landmarks, etc."
                  value={formData.description} onChange={handleChange}
                />
              </Grid>

              {/* ── Amenities ── */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Amenities</Typography>

                {/* Quick-add grid */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {COMMON_AMENITIES.map(a => {
                    const selected = amenities.includes(a);
                    return (
                      <Chip
                        key={a}
                        label={a}
                        onClick={() => toggleAmenity(a)}
                        color={selected ? 'primary' : 'default'}
                        variant={selected ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 600, cursor: 'pointer',
                          transition: 'all 0.2s',
                          ...(selected && { boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }),
                        }}
                        onDelete={selected ? () => removeAmenity(a) : undefined}
                        deleteIcon={selected ? <RemoveCircleOutlineIcon /> : undefined}
                      />
                    );
                  })}
                </Box>

                {/* Custom amenity input */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    placeholder="Add custom amenity..."
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAmenity(); } }}
                    sx={{ flex: 1 }}
                  />
                  <IconButton color="primary" onClick={addCustomAmenity} disabled={!customAmenity.trim()}>
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Stack>

                {/* Selected custom amenities (those not in COMMON_AMENITIES) */}
                {amenities.filter(a => !COMMON_AMENITIES.includes(a)).length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                    {amenities.filter(a => !COMMON_AMENITIES.includes(a)).map(a => (
                      <Chip key={a} label={a} color="secondary" onDelete={() => removeAmenity(a)} sx={{ fontWeight: 600 }} />
                    ))}
                  </Box>
                )}
              </Grid>

              {/* ── Image Upload ── */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Property Images
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 400 }}>
                    (first image = poster)
                  </Typography>
                </Typography>

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ fontWeight: 700, borderRadius: 3, borderStyle: 'dashed', py: 1.5, px: 3, mb: 2, width: '100%',
                    color: '#2563EB', borderColor: '#2563EB',
                    '&:hover': { borderColor: '#1D4ED8', bgcolor: 'rgba(37,99,235,0.04)' } }}
                  disabled={imageFiles.length >= 10}
                >
                  {imageFiles.length >= 10 ? 'Max 10 images reached' : 'Choose Images (JPG, JPEG, PNG)'}
                  <input
                    type="file"
                    hidden
                    multiple
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageSelect}
                  />
                </Button>

                {imagePreviews.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {imagePreviews.map((src, i) => (
                      <Box key={i} sx={{ position: 'relative', width: 100, height: 80, borderRadius: 2, overflow: 'hidden',
                        border: i === 0 ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        boxShadow: i === 0 ? '0 0 0 2px rgba(37,99,235,0.25)' : 'none',
                      }}>
                        <Box component="img" src={src} alt={`Preview ${i + 1}`}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {i === 0 && (
                          <Chip label="Poster" size="small"
                            sx={{ position: 'absolute', top: 2, left: 2, height: 18, fontSize: 10, fontWeight: 700,
                              bgcolor: '#2563EB', color: 'white' }} />
                        )}
                        <IconButton
                          size="small"
                          onClick={() => removeImage(i)}
                          sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', p: 0.3,
                            '&:hover': { bgcolor: 'rgba(239,68,68,0.85)' } }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}

                {imageFiles.length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    No images selected. A default poster will be used.
                  </Typography>
                )}
              </Grid>

              {/* Submit */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={submitting}
                  sx={{
                    py: 1.8, fontWeight: 800, fontSize: 16, borderRadius: 3,
                    background: 'linear-gradient(135deg,#2563EB,#3B82F6)',
                    '&:hover': { background: 'linear-gradient(135deg,#1D4ED8,#2563EB)' },
                  }}
                >
                  {submitting ? 'Publishing...' : 'Publish Property Listing'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AddProperty;
