import { Box } from '@mui/material';
import logoPrincipal from './logoPrincipal.png';

const Logo = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        
      }}
    >
      <img
        src={logoPrincipal}
        alt="CN-DEV"
        style={{
          maxWidth: '320px',
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
          borderRadius: 10,
        }}
      />
    </Box>
  );
};

export default Logo;
