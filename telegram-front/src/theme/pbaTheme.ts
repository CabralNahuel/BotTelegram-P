import { createTheme } from '@mui/material/styles';

/** Tokens del design system "Management Reporting" (DESIGN.md) */
const ds = {
  background: '#13131b',
  onBackground: '#e4e1ed',
  surfaceContainerLowest: '#0d0d15',
  surfaceContainerLow: '#1b1b23',
  surfaceContainer: '#1f1f27',
  surfaceContainerHigh: '#292932',
  surfaceContainerHighest: '#34343d',
  onSurface: '#e4e1ed',
  onSurfaceVariant: '#c7c4d7',
  outline: '#908fa0',
  outlineVariant: '#464554',
  primary: '#c0c1ff',
  onPrimary: '#1000a9',
  primaryContainer: '#8083ff',
  onPrimaryContainer: '#0d0096',
  inversePrimary: '#494bd6',
  secondary: '#4edea3',
  onSecondary: '#003824',
  tertiary: '#ffb95f',
  error: '#ffb4ab',
  onError: '#690005',
  surfaceTint: '#c0c1ff',
} as const;

/**
 * Tema alineado al design system: navy-carbón, acento índigo, secundario esmeralda.
 * Tipografía Inter (jerarquía del YAML).
 */
export const pbaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: ds.primary,
      light: '#e1e0ff',
      dark: ds.inversePrimary,
      contrastText: ds.onPrimary,
    },
    secondary: {
      main: ds.secondary,
      light: '#6ffbbe',
      dark: '#00a572',
      contrastText: ds.onSecondary,
    },
    error: {
      main: ds.error,
      contrastText: ds.onError,
      dark: '#93000a',
    },
    success: { main: ds.secondary },
    info: { main: ds.outline },
    warning: { main: ds.tertiary },
    background: {
      default: ds.background,
      paper: ds.surfaceContainer,
    },
    text: {
      primary: ds.onSurface,
      secondary: ds.onSurfaceVariant,
      disabled: ds.outlineVariant,
    },
    divider: ds.outlineVariant,
    action: {
      hover: 'rgba(192, 193, 255, 0.08)',
      selected: 'rgba(192, 193, 255, 0.16)',
      active: 'rgba(192, 193, 255, 0.12)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    h4: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.4 },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: 0,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
      color: ds.onSurfaceVariant,
      fontFeatureSettings: '"tnum"',
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1,
      letterSpacing: '0.02em',
    },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Inter", sans-serif',
          backgroundColor: ds.background,
          color: ds.onSurface,
        },
        'a:focus-visible, button:focus-visible': {
          outline: `2px solid ${ds.primary}`,
          outlineOffset: '2px',
        },
        '*::-webkit-scrollbar': { width: '8px', height: '8px' },
        '*::-webkit-scrollbar-track': { background: ds.surfaceContainerLow },
        '*::-webkit-scrollbar-thumb': {
          background: ds.surfaceContainerHighest,
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb:hover': { background: ds.primaryContainer },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: ds.surfaceContainer,
          border: `1px solid ${ds.outlineVariant}`,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontWeight: 500,
        },
        containedPrimary: {
          backgroundColor: ds.primary,
          color: ds.onPrimary,
          '&:hover': {
            backgroundColor: ds.primaryContainer,
            color: ds.onPrimaryContainer,
          },
        },
        outlined: {
          backgroundColor: 'transparent',
          borderColor: ds.outlineVariant,
          color: ds.onSurface,
          '&:hover': {
            borderColor: ds.outline,
            backgroundColor: 'rgba(192, 193, 255, 0.06)',
          },
        },
        text: {
          color: ds.onSurface,
          '&:hover': {
            backgroundColor: 'rgba(192, 193, 255, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: ds.outlineVariant },
            '&:hover fieldset': { borderColor: ds.outline },
            '&.Mui-focused fieldset': { borderColor: ds.primary },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: ds.primary },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: ds.surfaceContainerLowest,
          borderBottom: `1px solid ${ds.outlineVariant}`,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: ds.outlineVariant },
        head: {
          backgroundColor: ds.surfaceContainerHigh,
          fontWeight: 500,
          fontSize: '0.75rem',
          letterSpacing: '0.02em',
        },
      },
    },
  },
});
