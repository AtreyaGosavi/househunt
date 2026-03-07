import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Container, Typography, Box, Grid,
  Button, Stack, Paper
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import VerifiedIcon from '@mui/icons-material/Verified';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AddIcon from '@mui/icons-material/Add';

/* ─── Static Data ──────────────────────────────────────────────────────────── */
const STATS = [
  { value: '10K+', label: 'Properties Listed' },
  { value: '50K+', label: 'Happy Tenants' },
  { value: '8K+', label: 'Verified Owners' },
  { value: '99%', label: 'Satisfaction Rate' },
];

const WHY_US = [
  { icon: <HomeWorkIcon sx={{ fontSize: 36, color: '#2563EB' }} />, title: 'Curated Listings', desc: 'Every property is verified to ensure quality and authenticity.' },
  { icon: <VerifiedIcon sx={{ fontSize: 36, color: '#10B981' }} />, title: 'Trusted Owners', desc: 'Owners are vetted so you can rent with complete confidence.' },
  { icon: <SupportAgentIcon sx={{ fontSize: 36, color: '#F59E0B' }} />, title: '24/7 Support', desc: 'Our support team is always available to help you find your home.' },
];

/* ─── Scroll-reveal Hook ───────────────────────────────────────────────────── */
const useScrollReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
};

/* ─── Animated Card (slides in from side) ──────────────────────────────────── */
const AnimatedCard = ({ children, delay = 0, direction = 'left' }) => {
  const { ref, visible } = useScrollReveal(0.1);
  const tx = direction === 'left' ? '-80px' : '80px';

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : `translateX(${tx})`,
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </Box>
  );
};

/* ─── Animated Section (scales + fades in) ──────────────────────────────────── */
const AnimatedSection = ({ children }) => {
  const { ref, visible } = useScrollReveal(0.15);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.95)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}
    >
      {children}
    </Box>
  );
};

/* ─── Animated Stat (pops up individually) ──────────────────────────────────── */
const AnimatedStat = ({ children, delay = 0 }) => {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </Box>
  );
};

/* ─── Landing Page ─────────────────────────────────────────────────────────── */
const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const userRole = user?.userType || user?.role;
  const isOwner = userRole === 'Owner';
  const isTenant = userRole === 'Tenant';
  const isGuest = !user;

  /* Hero buttons: role-conditional */
  const heroButtons = [];
  if (isGuest) {
    heroButtons.push(
      { label: 'Browse Properties', to: '/register', icon: <SearchIcon />, variant: 'contained',
        sx: { py: 1.8, px: 4, fontSize: 16, fontWeight: 700, borderRadius: 3, background: 'linear-gradient(135deg,#2563EB,#3B82F6)' } },
      { label: 'List a Property', to: '/register', icon: <AddIcon />, variant: 'outlined',
        sx: { py: 1.8, px: 4, fontSize: 16, fontWeight: 700, borderRadius: 3, color: 'white', borderColor: 'rgba(255,255,255,0.35)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.07)' } } },
    );
  } else if (isTenant) {
    heroButtons.push(
      { label: 'Browse Properties', to: '/properties', icon: <SearchIcon />, variant: 'contained',
        sx: { py: 1.8, px: 4, fontSize: 16, fontWeight: 700, borderRadius: 3, background: 'linear-gradient(135deg,#2563EB,#3B82F6)' } },
    );
  } else if (isOwner) {
    heroButtons.push(
      { label: 'List a Property', to: '/add-property', icon: <AddIcon />, variant: 'contained',
        sx: { py: 1.8, px: 4, fontSize: 16, fontWeight: 700, borderRadius: 3, background: 'linear-gradient(135deg,#2563EB,#3B82F6)' } },
    );
  }

  /* ── Hero animations ── */
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => {
    // Hero is always at top, so trigger after a short delay for a nice entrance
    const t = setTimeout(() => setHeroVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box>
      {/* ── Hero ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 55%, #1D4ED8 100%)',
        pt: { xs: 10, md: 16 }, pb: { xs: 4, md: 6 },
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <Box sx={{
          position: 'absolute', top: '-120px', right: '-100px',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '-80px', left: '-60px',
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Animated entrance */}
          <Box sx={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              bgcolor: 'rgba(37,99,235,0.2)', border: '1px solid rgba(59,130,246,0.4)',
              borderRadius: 20, px: 2.5, py: 0.8, mb: 4,
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', animation: 'pulse 2s infinite' }} />
              <Typography variant="body2" sx={{ color: '#93C5FD', fontWeight: 600 }}>
                New listings added every day
              </Typography>
            </Box>

            <Typography variant="h1" sx={{ color: 'white', fontWeight: 800, fontSize: { xs: '2.5rem', md: '4rem' }, lineHeight: 1.1, mb: 3 }}>
              Find Your Perfect{' '}
              <Box component="span" sx={{ background: 'linear-gradient(90deg,#3B82F6,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Home
              </Box>{' '}Today
            </Typography>

            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.15rem', mb: 5, maxWidth: 560, mx: 'auto', lineHeight: 1.8 }}>
              Browse thousands of verified rental properties. Connect directly with owners and move in faster.
            </Typography>
          </Box>

          {/* Buttons – slide in slightly later */}
          <Box sx={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(25px)',
            transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s',
          }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              {heroButtons.map(({ label, to, icon, variant, sx }) => (
                <Button key={label} component={Link} to={to} variant={variant} size="large" startIcon={icon} sx={sx}>
                  {label}
                </Button>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* ── Stats Bar ── (animated individually) */}
      <Box sx={{ bgcolor: '#1E293B', py: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {STATS.map(({ value, label }, index) => (
              <Grid item xs={6} sm={3} key={label} sx={{ textAlign: 'center' }}>
                <AnimatedStat delay={index * 0.12}>
                  <Typography variant="h4" sx={{ color: '#3B82F6', fontWeight: 800 }}>{value}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>{label}</Typography>
                </AnimatedStat>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Why HouseHunt ── (scroll-animated cards) */}
      <Box sx={{ bgcolor: '#F8FAFF', py: 8 }}>
        <Container maxWidth="lg">
          <AnimatedSection>
            <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 2 }}>Why HouseHunt?</Typography>
            <Typography align="center" color="text.secondary" sx={{ mb: 6, maxWidth: 500, mx: 'auto' }}>
              The smarter, faster way to find rental homes — built for both tenants and property owners.
            </Typography>
          </AnimatedSection>

          <Grid container spacing={4}>
            {WHY_US.map(({ icon, title, desc }, index) => (
              <Grid item xs={12} md={4} key={title}>
                <AnimatedCard delay={index * 0.15} direction={index === 2 ? 'right' : 'left'}>
                  <Paper elevation={0} sx={{
                    p: 4, borderRadius: 4, textAlign: 'center',
                    border: '1px solid #E2E8F0',
                    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                    '&:hover': { boxShadow: '0 16px 40px rgba(15,23,42,0.10)', transform: 'translateY(-4px)' },
                  }}>
                    <Box sx={{ mb: 2 }}>{icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
                    <Typography variant="body2" color="text.secondary">{desc}</Typography>
                  </Paper>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ── (scroll-animated) */}
      <Box sx={{ background: 'linear-gradient(135deg, #0F172A, #1D4ED8)', py: 10, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <AnimatedSection>
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 2 }}>
              Ready to find your home?
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', mb: 5 }}>
              Join thousands of happy renters on HouseHunt today.
            </Typography>
            {isGuest ? (
              <Button component={Link} to="/register" variant="contained" size="large"
                sx={{ py: 2, px: 6, fontWeight: 800, fontSize: 16, background: 'white', color: '#2563EB', borderRadius: 3, '&:hover': { background: '#F0F6FF' } }}
              >
                Get Started — It's Free
              </Button>
            ) : isTenant ? (
              <Button component={Link} to="/properties" variant="contained" size="large"
                sx={{ py: 2, px: 6, fontWeight: 800, fontSize: 16, background: 'white', color: '#2563EB', borderRadius: 3, '&:hover': { background: '#F0F6FF' } }}
              >
                Browse Properties
              </Button>
            ) : (
              <Button component={Link} to="/add-property" variant="contained" size="large"
                sx={{ py: 2, px: 6, fontWeight: 800, fontSize: 16, background: 'white', color: '#2563EB', borderRadius: 3, '&:hover': { background: '#F0F6FF' } }}
              >
                List Your Property
              </Button>
            )}
          </AnimatedSection>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
