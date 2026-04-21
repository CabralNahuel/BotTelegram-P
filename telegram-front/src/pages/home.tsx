import DrawerN from '../componentes/drawer';
import { Box } from '@mui/material';

export default function HomePage() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <DrawerN />
    </Box>
  );
}
