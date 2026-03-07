import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{
      bgcolor: '#0F172A', color: 'white', py: 3, mt: 'auto',
      textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.07)',
    }}>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
        &copy; {new Date().getFullYear()} HouseHunt. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
