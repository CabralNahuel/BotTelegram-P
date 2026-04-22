import { createTheme } from '@mui/material/styles';

/**
 * Tema CN-DEV: minimal, dark, técnico. Negro profundo + acento rojo.
 * Tipografía monoespaciada para detalles técnicos, sans-serif para UI.
 */
export const pbaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E50914',
      light: '#FF1E2D',
      dark: '#B3060F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E5E5E5',
      contrastText: '#0A0A0A',
    },
    error: { main: '#E50914' },
    success: { main: '#22c55e' },
    info: { main: '#9CA3AF' },
    warning: { main: '#F59E0B' },
    background: {
      default: '#0A0A0A',
      paper: '#141414',
    },
    text: {
      primary: '#EDEDED',
      secondary: '#9CA3AF',
      disabled: '#4B5563',
    },
    divider: '#262626',
    action: {
      hover: 'rgba(229, 9, 20, 0.08)',
      selected: 'rgba(229, 9, 20, 0.16)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.01em' },
    h4: { fontWeight: 600, fontSize: '1.25rem' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.9375rem', lineHeight: 1.6, color: '#9CA3AF' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Inter", sans-serif',
          backgroundColor: '#0A0A0A',
          color: '#EDEDED',
        },
        'a:focus-visible, button:focus-visible': {
          outline: '2px solid #E50914',
          outlineOffset: '2px',
        },
        '*::-webkit-scrollbar': { width: '8px', height: '8px' },
        '*::-webkit-scrollbar-track': { background: '#141414' },
        '*::-webkit-scrollbar-thumb': { background: '#333', borderRadius: '4px' },
        '*::-webkit-scrollbar-thumb:hover': { background: '#E50914' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#141414',
          border: '1px solid #262626',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#E50914',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#FF1E2D',
          },
        },
        outlined: {
          backgroundColor: 'transparent',
          borderColor: '#333',
          color: '#EDEDED',
          '&:hover': {
            borderColor: '#E50914',
            backgroundColor: 'rgba(229, 9, 20, 0.08)',
          },
        },
        text: {
          color: '#EDEDED',
          '&:hover': {
            backgroundColor: 'rgba(229, 9, 20, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#333' },
            '&:hover fieldset': { borderColor: '#525252' },
            '&.Mui-focused fieldset': { borderColor: '#E50914' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#E50914' },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A0A0A',
          borderBottom: '1px solid #262626',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: '#262626' },
        head: { backgroundColor: '#1A1A1A', fontWeight: 600 },
      },
    },
  },
});
