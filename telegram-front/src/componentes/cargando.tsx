
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress, {
  circularProgressClasses,
  CircularProgressProps,
} from '@mui/material/CircularProgress';



function FacebookCircularProgress(props: CircularProgressProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      <CircularProgress
        variant="determinate"
        sx={{
          color: (theme) =>
            theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
        }}
        size={40}
        thickness={4}
        {...props}
        value={100}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        sx={{
          color: (theme) => (theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8'),
          animationDuration: '550ms',
          position: 'absolute',
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: 'round',
          },
        }}
        size={40}
        thickness={4}
        {...props}
      />
    </Box>
  );
}



export default function Cargando() {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{
        flexGrow: 1,
        width: '100%',
        minHeight: '45vh',
        px: 2,
      }}
    >
      <FacebookCircularProgress />
      <Typography
        sx={{
          fontFamily: 'var(--font-secondary)',
          color: 'rgba(255,255,255,0.82)',
          fontSize: '0.95rem',
        }}
      >
        Cargando datos...
      </Typography>
      <Box
        sx={{
          width: '100%',
          maxWidth: 560,
          border: '1px solid var(--pba-gris-claro)',
          borderRadius: 2,
          p: 2,
          bgcolor: 'rgba(255,255,255,0.03)',
        }}
      >
        <Skeleton variant="text" width="45%" sx={{ bgcolor: 'rgba(255,255,255,0.16)' }} />
        <Skeleton variant="rounded" height={42} sx={{ mt: 1.2, bgcolor: 'rgba(255,255,255,0.14)' }} />
        <Skeleton variant="rounded" height={42} sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.14)' }} />
      </Box>
    </Stack>
  );
}
