import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import SearchFilter from '../components/SearchFilter';

const PropertyListings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchProperties = async (queryString = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/properties${queryString ? `?${queryString}` : ''}`);
      setProperties(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(searchParams.toString());
  }, [searchParams]);

  const handleSearch = (filters) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    setSearchParams(params);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Browse Properties
      </Typography>
      
      <SearchFilter onSearch={handleSearch} />

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {properties.length === 0 ? (
            <Typography variant="h6" sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
              No properties matched your search.
            </Typography>
          ) : (
            properties.map((property) => (
              <Grid item key={property._id} xs={12} sm={6} md={4}>
                <PropertyCard property={property} />
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
};

export default PropertyListings;
