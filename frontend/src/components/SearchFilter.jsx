import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchFilter = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  const propertyTypes = ['Apartment', 'House', 'Villa', 'Studio', 'Condo'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ location, minPrice, maxPrice, propertyType, bedrooms });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ 
      p: 3, 
      mb: 4, 
      backgroundColor: 'white', 
      borderRadius: 2, 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
    }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Location"
            variant="outlined"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            select
            fullWidth
            label="Property Type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            {propertyTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            type="number"
            label="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            type="number"
            label="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            type="number"
            label="Bedrooms+"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={1}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ height: '56px' }}
          >
            <SearchIcon />
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchFilter;
