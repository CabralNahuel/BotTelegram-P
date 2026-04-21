import { createTheme } from '@mui/material/styles';

/**
 * Tema Material UI alineado al sistema de diseño PBA (gba.gob.ar).
 * Colores y tipografía: manual institucional.
 */
export const pbaTheme = createTheme({
  palette: {
    primary: {
      main: '#009AAE',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#414042',
      contrastText: '#FFFFFF',
    },
    error: { main: '#BE1717' },
    success: { main: '#22a954' },
    info: { main: '#417099' },
    warning: { main: '#ebb813' },
    background: {
      default: '#F0F0F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#414042',
    },
    divider: '#C0C0C0',
  },
  typography: {
    fontFamily: '"Encode Sans", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Encode Sans", sans-serif', fontWeight: 800, fontSize: '2rem' },
    h2: { fontFamily: '"Encode Sans", sans-serif', fontWeight: 700, fontSize: '1.75rem' },
    h3: { fontFamily: '"Encode Sans", sans-serif', fontWeight: 600, fontSize: '1.5rem' },
    h4: { fontFamily: '"Encode Sans", sans-serif', fontWeight: 600, fontSize: '1.25rem' },
    h5: { fontFamily: '"Encode Sans", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Encode Sans", sans-serif', fontWeight: 600 },
    body1: { fontFamily: '"Encode Sans", sans-serif', fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontFamily: '"Encode Sans", sans-serif', fontSize: '0.9375rem', lineHeight: 1.5 },
    button: { fontFamily: '"Encode Sans", sans-serif', fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Encode Sans", sans-serif',
        },
        'a:focus-visible, button:focus-visible': {
          outline: '2px solid #009AAE',
          outlineOffset: '2px',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: false },
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
        containedPrimary: {
          boxShadow: '0px 4px 8px rgba(65, 64, 66, 0.2)',
          '&:hover': {
            boxShadow: '0px 6px 12px rgba(65, 64, 66, 0.25)',
          },
        },
        outlined: {
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 4px 6px rgba(65, 64, 66, 0.12)',
          borderColor: '#C0C0C0',
          '&:hover': {
            borderColor: '#009AAE',
            backgroundColor: '#FFFFFF',
          },
        },
      },
    },
  },
});
