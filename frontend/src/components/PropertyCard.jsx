import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const API_ORIGIN = 'http://localhost:5000';
const resolveImg = (src) => {
  if (!src) return null;
  if (src.startsWith('/uploads')) return `${API_ORIGIN}${src}`;
  return src;
};

const PropertyCard = ({ property }) => {
  const imgSrc = property.images?.length > 0
    ? resolveImg(property.images[0])
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  return (
    <Card sx={{
      display: 'flex', flexDirection: 'column', height: '100%',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 40px rgba(15,23,42,0.15)',
      },
      position: 'relative',
    }}>
      {/* Image */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="210"
          image={imgSrc}
          alt={property.title}
          sx={{ transition: 'transform 0.4s ease', '&:hover': { transform: 'scale(1.05)' } }}
        />
        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
          <Chip
            label={property.status}
            size="small"
            sx={{
              fontWeight: 700, fontSize: 11,
              bgcolor: property.status === 'Available' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
              color: 'white',
              backdropFilter: 'blur(8px)',
            }}
          />
          <Chip
            label={property.propertyType}
            size="small"
            sx={{ fontWeight: 600, fontSize: 11, bgcolor: 'rgba(15,23,42,0.7)', color: 'white', backdropFilter: 'blur(8px)' }}
          />
        </Box>
        {/* Price overlay */}
        <Box sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 100%)',
          p: '20px 12px 8px',
        }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>
            ₹{property.rentAmount?.toLocaleString()}
            <Typography component="span" variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', ml: 0.5 }}>/ mo</Typography>
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }} noWrap>
          {property.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1.5 }}>
          <LocationOnIcon sx={{ fontSize: 15, mr: 0.5, color: '#2563EB' }} />
          <Typography variant="body2" noWrap>{property.location}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, color: 'text.secondary' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HotelIcon sx={{ fontSize: 14 }} />
            <Typography variant="body2">{property.bedrooms} Beds</Typography>
          </Box>
          <Typography variant="body2" color="text.disabled">·</Typography>
          <Typography variant="body2">{property.furnishingStatus}</Typography>
        </Box>
      </CardContent>

      {/* Footer CTA */}
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Button
          fullWidth
          variant="contained"
          component={Link}
          to={`/properties/${property._id}`}
          endIcon={<ArrowForwardIcon />}
          sx={{
            borderRadius: 3, py: 1, fontWeight: 700, fontSize: 14,
            background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
          }}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );
};

export default PropertyCard;
