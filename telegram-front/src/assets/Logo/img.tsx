import { Box } from '@mui/material';
import logoPrincipal from './logoPrincipal.png';

const Logo = () => {
  return (
    <Box>
      <img
        src={logoPrincipal}
        alt="Logo Gobierno de la Provincia de Buenos Aires"
        style={{ minWidth: '100px' }}
      />
    </Box>
  );
};

export default Logo;
