import { Box } from '@mui/material';
import Logo from '../assets/Logo/img';

export default function FooterLogo() {
  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        flexShrink: 0,
        width: '100%',
        minHeight: { xs: '96px', sm: '20vh' },
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        mt: 'auto',
        background: 'var(--pba-primary)',
      }}
    >
      <Logo />
    </Box>
  );
}
