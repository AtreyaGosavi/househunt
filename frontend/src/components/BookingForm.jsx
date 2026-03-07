import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Grid, Alert,
  Divider, Chip, InputAdornment, MenuItem, Stack, CircularProgress
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../services/api';

/**
 * BookingForm – reusable booking component
 * Props:
 *   propertyId  {string}  – MongoDB ObjectId
 *   rentAmount  {number}  – used to calculate total preview
 *   onSuccess   {fn}      – called after successful submission
 *   onCancel    {fn}      – called when user dismisses the form
 */
const BookingForm = ({ propertyId, rentAmount, onSuccess, onCancel }) => {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1))
    .toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextMonth);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type, text }

  // ── Derived ──────────────────────────────────────────────────────────────
  const durationDays = startDate && endDate
    ? Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / 86_400_000))
    : 0;
  const durationMonths = (durationDays / 30).toFixed(1);
  const estimatedTotal = rentAmount ? (rentAmount * durationDays / 30).toFixed(0) : null;

  const isValid = startDate && endDate && new Date(endDate) > new Date(startDate);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setStatus({ type: 'error', text: 'End date must be after start date.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const payload = {
        propertyId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
      await api.post('/bookings', payload);
      setStatus({ type: 'success', text: 'Booking request sent! The owner will review it shortly.' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setStatus({
        type: 'error',
        text: err.response?.data?.message || 'Failed to send booking request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {status && (
        <Alert severity={status.type} sx={{ mb: 2, borderRadius: 2 }} icon={status.type === 'success' ? <CheckCircleIcon /> : undefined}>
          {status.text}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            fullWidth required
            type="date"
            label="Move-in Date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            inputProps={{ min: today }}
            InputLabelProps={{ shrink: true }}
            InputProps={{ startAdornment: <InputAdornment position="start"><CalendarTodayIcon fontSize="small" color="action" /></InputAdornment> }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth required
            type="date"
            label="Move-out Date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            inputProps={{ min: startDate || today }}
            InputLabelProps={{ shrink: true }}
            InputProps={{ startAdornment: <InputAdornment position="start"><CalendarTodayIcon fontSize="small" color="action" /></InputAdornment> }}
          />
        </Grid>
      </Grid>

      {/* Duration & cost preview */}
      {durationDays > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#F0F7FF', borderRadius: 2, border: '1px solid #DBEAFE' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="text.secondary">Duration</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {durationDays} days <Typography component="span" variant="body2" color="text.secondary">({durationMonths} mo)</Typography>
              </Typography>
            </Box>
            {estimatedTotal && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">Estimated Total</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2563EB' }}>
                  ₹{Number(estimatedTotal).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={1.5}>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={!isValid || loading}
          sx={{ fontWeight: 700, borderRadius: 3, py: 1.5 }}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {loading ? 'Sending…' : 'Confirm Booking Request'}
        </Button>
        {onCancel && (
          <Button onClick={onCancel} variant="outlined" sx={{ borderRadius: 3, py: 1.5, minWidth: 90 }}>
            Cancel
          </Button>
        )}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>
        No charge now — the owner reviews your request first.
      </Typography>
    </Box>
  );
};

export default BookingForm;
