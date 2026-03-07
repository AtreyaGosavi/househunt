import React, { useState } from 'react';
import {
  Box, TextField, Button, MenuItem, Grid, Typography,
  Accordion, AccordionSummary, AccordionDetails,
  Chip, Stack, Slider, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import ClearIcon from '@mui/icons-material/Clear';

const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Studio', 'Condo'];
const FURNISHING = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const AMENITY_OPTIONS = ['WiFi', 'Parking', 'Pool', 'Gym', 'AC', 'Security', 'Garden', 'Lift'];

/**
 * SearchFilters – extended filter panel.
 * Exported as both `SearchFilters` (new canonical name) and default.
 * The old `SearchFilter` component is unchanged — this is an addition.
 *
 * Props:
 *   onSearch {fn({ location, minPrice, maxPrice, propertyType,
 *                   furnishingStatus, bedrooms, amenities })} – callback
 */
const SearchFilters = ({ onSearch, compact = false }) => {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [furnishingStatus, setFurnishingStatus] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const toggleAmenity = (a) =>
    setSelectedAmenities(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );

  const handleReset = () => {
    setLocation('');
    setPropertyType('');
    setFurnishingStatus('');
    setBedrooms('');
    setPriceRange([0, 100000]);
    setSelectedAmenities([]);
    onSearch({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filters = {
      ...(location && { location }),
      ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
      ...(priceRange[1] < 100000 && { maxPrice: priceRange[1] }),
      ...(propertyType && { propertyType }),
      ...(furnishingStatus && { furnishingStatus }),
      ...(bedrooms && { bedrooms }),
      ...(selectedAmenities.length > 0 && { amenities: selectedAmenities.join(',') }),
    };
    onSearch(filters);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        bgcolor: 'white',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
      }}
    >
      {/* Primary row – always visible */}
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Location"
              placeholder="e.g. Pune, Mumbai…"
              value={location}
              onChange={e => setLocation(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">📍</InputAdornment>
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField select fullWidth label="Property Type" value={propertyType} onChange={e => setPropertyType(e.target.value)}>
              <MenuItem value="">All Types</MenuItem>
              {PROPERTY_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth type="number" label="Min Bedrooms"
              value={bedrooms}
              onChange={e => setBedrooms(e.target.value)}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" fullWidth size="large"
                startIcon={<SearchIcon />}
                sx={{ fontWeight: 700, borderRadius: 2, py: 1.7 }}>
                Search
              </Button>
              <Button variant="outlined" onClick={handleReset}
                sx={{ borderRadius: 2, py: 1.7, minWidth: 48 }}>
                <ClearIcon />
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Advanced filters accordion */}
      {!compact && (
        <Accordion elevation={0} disableGutters
          sx={{ borderTop: '1px solid #E2E8F0', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Advanced Filters
              </Typography>
              {(selectedAmenities.length > 0 || furnishingStatus || priceRange[0] > 0 || priceRange[1] < 100000) && (
                <Chip size="small" color="primary"
                  label={`${selectedAmenities.length + (furnishingStatus ? 1 : 0)} active`}
                  sx={{ fontWeight: 700, height: 20 }}
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 3, pb: 3 }}>
            <Grid container spacing={3}>
              {/* Price range slider */}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Price Range: ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(_, val) => setPriceRange(val)}
                  min={0} max={100000} step={1000}
                  valueLabelDisplay="auto"
                  valueLabelFormat={v => `₹${v.toLocaleString()}`}
                  sx={{ color: '#2563EB' }}
                />
              </Grid>

              {/* Furnishing */}
              <Grid item xs={12} md={6}>
                <TextField select fullWidth label="Furnishing Status" value={furnishingStatus} onChange={e => setFurnishingStatus(e.target.value)}>
                  <MenuItem value="">Any</MenuItem>
                  {FURNISHING.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </TextField>
              </Grid>

              {/* Amenities */}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Amenities</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {AMENITY_OPTIONS.map(a => (
                    <Chip
                      key={a} label={a} clickable
                      onClick={() => toggleAmenity(a)}
                      color={selectedAmenities.includes(a) ? 'primary' : 'default'}
                      variant={selectedAmenities.includes(a) ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 500 }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export { SearchFilters };
export default SearchFilters;
