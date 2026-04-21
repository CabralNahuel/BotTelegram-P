import Menus from '../componentes/menus';
import { Box } from '@mui/material';
import FooterLogo from '../componentes/footerLogo';

export default function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Menus />
      </Box>
      <FooterLogo />
    </Box>
  );
}
