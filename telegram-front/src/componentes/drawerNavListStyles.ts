import type { SxProps, Theme } from '@mui/material/styles';

/** Contenedor scroll del área de botones del drawer temporal (full screen). */
export const drawerNavScrollBoxSx: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  px: { xs: 1.5, sm: 2 },
  py: { xs: 2, sm: 3 },
  overflowY: 'auto',
  overflowX: 'hidden',
};

/**
 * Grid de cards de navegación: mismo layout en home (`drawer`) y en el resto de pantallas
 * que duplican el drawer (menu, token, datos, etc.).
 */
export const drawerNavListSx: SxProps<Theme> = {
  width: '100%',
  maxWidth: { xs: '100%', md: 520, lg: 720 },
  display: 'grid',
  gap: { xs: 1.25, sm: 1.5 },
  m: 0,
  p: 0,
  listStyle: 'none',
  gridTemplateColumns: {
    xs: 'repeat(auto-fit, minmax(148px, 1fr))',
    md: 'repeat(2, minmax(0, 1fr))',
    lg: 'repeat(3, minmax(0, 1fr))',
  },
  alignContent: 'center',
  justifyContent: 'center',
};
