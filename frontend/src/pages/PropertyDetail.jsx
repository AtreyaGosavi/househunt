import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container, Grid, Typography, Box, Button, CircularProgress,
  Chip, Divider, Paper, Stack, Avatar
} from '@mui/material';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import WifiIcon from '@mui/icons-material/Wifi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const API_ORIGIN = 'http://localhost:5000';

/* Resolve image URL: if it starts with /uploads, prepend the backend origin */
const resolveImg = (src) => {
  if (!src) return null;
  if (src.startsWith('/uploads')) return `${API_ORIGIN}${src}`;
  return src;
};

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingSent, setBookingSent] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await api.get(`/properties/${id}`);
        setProperty(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (!property) return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h6">Property not found.</Typography>
      <Button component={Link} to="/properties" sx={{ mt: 2 }}>Back to listings</Button>
    </Box>
  );

  const owner = property.owner || {};
  const rawImages = property.images?.length ? property.images : [FALLBACK_IMG];
  const images = rawImages.map(resolveImg).filter(Boolean);

  const userRole = user?.userType || user?.role;
  const isOwner = userRole === 'Owner';
  const isMyProperty = owner?._id && user?._id && String(owner._id) === String(user._id);
  const canBook = !isOwner && property.status === 'Available' && !bookingSent;

  /* Arrow navigation */
  const prevImage = () => setActiveImage(i => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setActiveImage(i => (i === images.length - 1 ? 0 : i + 1));

  return (
    <Box sx={{ bgcolor: '#F1F5F9', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* ── Left Column ── */}
          <Grid item xs={12} md={8}>
            {/* Image Gallery with Arrows */}
            <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 3, position: 'relative' }}>
              <Box
                component="img"
                src={images[activeImage]}
                alt={property.title}
                sx={{ width: '100%', height: { xs: 260, md: 460 }, objectFit: 'cover', display: 'block' }}
              />
              <Chip
                label={property.status}
                sx={{
                  position: 'absolute', top: 16, left: 16,
                  fontWeight: 700, fontSize: 13,
                  bgcolor: property.status === 'Available' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
                  color: 'white',
                }}
              />

              {/* Arrow navigation */}
              {images.length > 1 && (
                <>
                  <Box
                    onClick={prevImage}
                    sx={{
                      position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0,0,0,0.45)', color: 'white', borderRadius: '50%',
                      width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'background 0.2s', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                    }}
                  >
                    <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box
                    onClick={nextImage}
                    sx={{
                      position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0,0,0,0.45)', color: 'white', borderRadius: '50%',
                      width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'background 0.2s', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                    }}
                  >
                    <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
                  </Box>
                  {/* Image counter */}
                  <Chip
                    label={`${activeImage + 1} / ${images.length}`}
                    size="small"
                    sx={{
                      position: 'absolute', bottom: 12, right: 12,
                      bgcolor: 'rgba(0,0,0,0.55)', color: 'white', fontWeight: 600,
                    }}
                  />
                </>
              )}
            </Box>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
                {images.map((img, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={img}
                    onClick={() => setActiveImage(i)}
                    sx={{
                      width: 80, height: 60, borderRadius: 2, objectFit: 'cover', cursor: 'pointer', flexShrink: 0,
                      border: i === activeImage ? '2px solid #2563EB' : '2px solid transparent',
                      opacity: i === activeImage ? 1 : 0.65,
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </Stack>
            )}

            {/* Title & Location */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 3, border: '1px solid #E2E8F0' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>{property.title}</Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                <LocationOnIcon sx={{ mr: 0.5, color: '#2563EB', fontSize: 20 }} />
                <Typography variant="subtitle1">{property.location}</Typography>
              </Box>

              <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 3 }}>
                <Chip icon={<HotelIcon />} label={`${property.bedrooms} Bedrooms`} variant="outlined" />
                {property.bathrooms && <Chip icon={<BathtubIcon />} label={`${property.bathrooms} Bathrooms`} variant="outlined" />}
                {property.sqft && <Chip icon={<SquareFootIcon />} label={`${property.sqft} sq.ft`} variant="outlined" />}
                <Chip icon={<CheckroomIcon />} label={property.furnishingStatus} variant="outlined" />
                <Chip label={property.propertyType} color="primary" variant="outlined" />
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Description</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {property.description}
              </Typography>
            </Paper>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 3, border: '1px solid #E2E8F0' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  <WifiIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#2563EB' }} />
                  Amenities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {property.amenities.map((a, i) => (
                    <Chip key={i} label={a} color="primary" variant="outlined" sx={{ fontWeight: 500 }} />
                  ))}
                </Box>
              </Paper>
            )}
          </Grid>

          {/* ── Right Column ── */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              {/* Price Card */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 2, border: '1px solid #E2E8F0' }}>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 800 }}>
                  ₹{property.rentAmount?.toLocaleString()}
                  <Typography component="span" variant="subtitle1" color="text.secondary"> / month</Typography>
                </Typography>

                <Chip
                  label={property.status}
                  color={property.status === 'Available' ? 'success' : 'error'}
                  sx={{ mt: 1.5, mb: 2.5, width: '100%', py: 2.5, fontSize: '1rem', fontWeight: 700 }}
                />

                {/* Owner Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: '#F8FAFF', borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: '#2563EB', fontWeight: 700 }}>
                    {(owner?.name || 'O')[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Listed by</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{owner?.name || 'Unknown Owner'}</Typography>
                    {owner?.phone && (
                      <Typography variant="caption" color="text.secondary">📞 {owner.phone}</Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                  <CalendarTodayIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                  <Typography variant="caption" color="text.secondary">
                    Listed {property.createdAt ? new Date(property.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : ''}
                  </Typography>
                </Box>
              </Paper>

              {/* Booking Section (only for tenants / guests — NO edit button, NO chat) */}
              {!isMyProperty && (
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                  {bookingSent ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <CheckCircleIcon sx={{ fontSize: 48, color: '#10B981', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Request Sent!</Typography>
                      <Typography color="text.secondary" variant="body2">
                        The owner will review your booking request. You can track it in your Dashboard.
                      </Typography>
                      <Button component={Link} to="/bookings" variant="outlined" sx={{ mt: 2, fontWeight: 600, borderRadius: 3 }}>
                        View My Bookings
                      </Button>
                    </Box>
                  ) : canBook ? (
                    <BookingForm
                      propertyId={property._id}
                      rentAmount={property.rentAmount}
                      onSuccess={() => setBookingSent(true)}
                    />
                  ) : !user ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>Log in to book this property.</Typography>
                      <Button variant="contained" component={Link} to="/login" sx={{ fontWeight: 700, borderRadius: 3 }}>Login</Button>
                    </Box>
                  ) : property.status !== 'Available' ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Chip label="Not Available" color="error" sx={{ mb: 1.5 }} />
                      <Typography color="text.secondary" variant="body2">This property has been rented out.</Typography>
                    </Box>
                  ) : isOwner ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="text.secondary" variant="body2">Owners cannot book properties.</Typography>
                    </Box>
                  ) : null}
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PropertyDetail;
