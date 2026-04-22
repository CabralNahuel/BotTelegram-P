import * as React from 'react';
import { Stack, Box, Typography, Button, CssBaseline, AppBar, Toolbar, IconButton, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AddHomeIcon from '@mui/icons-material/AddHome';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import KeyIcon from '@mui/icons-material/Key';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { InsertChartOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../assets/store.redux';
import { cerrarSesion } from '../assets/store.redux';
import BotonesDrawer from '../componentes/botonesDrawer';
import { drawerNavListSx, drawerNavScrollBoxSx } from '../componentes/drawerNavListStyles';
import FooterLogo from '../componentes/footerLogo';

export default function Usuarios() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const usuario = useSelector((state: RootState) => state.usuario.usuario);
  const [openDrawer, setOpenDrawer] = React.useState(false);

  const drawerItems = [
    { text: 'Bienvenida', icon: <AddHomeIcon />, path: '/home', color: 'var(--color8)' },
    { text: 'Menu', icon: <AutoAwesomeMosaicIcon />, path: '/menu', color: 'var(--color11)' },
    { text: 'Token', icon: <KeyIcon />, path: '/token', color: 'var(--color6)' },
    { text: 'Usuario', icon: <AccountCircleIcon />, path: '/usuario', color: 'var(--color5)' },
    { text: 'Datos', icon: <InsertChartOutlined />, path: '/datos', color: 'var(--color3)' },
  ];

  const handleCerrarSesion = () => {
    dispatch(cerrarSesion());
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            backgroundColor: 'var(--pba-header-bg)',
            borderBottom: '1px solid var(--pba-gris-claro)',
            color: 'var(--pba-secondary)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                aria-label="Abrir menú de navegación"
                onClick={() => setOpenDrawer(true)}
                edge="start"
                sx={{
                  color: 'var(--pba-secondary)',
                  '&:hover': { backgroundColor: 'var(--pba-secondary)', color: '#fff' },
                  ...(openDrawer && { display: 'none' }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                component="span"
                noWrap
                sx={{
                  fontFamily: 'var(--font-primary)',
                  fontWeight: 800,
                  color: 'var(--pba-primary)',
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                }}
              >
                Telegram Bot
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
        <MuiDrawer
          variant="temporary"
          anchor="left"
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: '100vw',
              maxWidth: '100%',
              minWidth: '100%',
              height: '100%',
              minHeight: '100vh',
              maxHeight: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              bgcolor: 'var(--pba-header-bg)',
              boxSizing: 'border-box',
              overflow: 'hidden',
            },
          }}
          sx={{
            zIndex: theme.zIndex.modal,
            '& .MuiDrawer-paper': { width: '100vw', maxWidth: '100vw' },
            '& .MuiBackdrop-root': { backgroundColor: 'rgba(65, 64, 66, 0.5)' },
          }}
        >
          <Box sx={{ width: '100%', flexShrink: 0, bgcolor: 'var(--pba-primary)', pt: 'env(safe-area-inset-top, 0px)' }}>
            <Box
              component="header"
              sx={{
                minHeight: { xs: 56, sm: 64 },
                width: '100%',
                px: { xs: 1, sm: 2 },
                bgcolor: 'var(--pba-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                boxSizing: 'border-box',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Typography
                variant="subtitle1"
                noWrap
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  fontFamily: 'var(--font-primary)',
                  fontSize: { xs: '1rem', sm: '1.0625rem' },
                }}
              >
                Telegram Bot
              </Typography>
              <IconButton
                aria-label="Cerrar menú"
                onClick={() => setOpenDrawer(false)}
                size="medium"
                sx={{
                  flexShrink: 0,
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <Box sx={drawerNavScrollBoxSx}>
            <List component="ul" disablePadding aria-label="Navegación principal" sx={drawerNavListSx}>
              {drawerItems.map((item, index) => (
                <BotonesDrawer
                  color={item.color}
                  key={item.text}
                  text={item.text}
                  index={index}
                  open={openDrawer}
                  icon={item.icon}
                  onClick={() => {
                    navigate(item.path);
                    setOpenDrawer(false);
                  }}
                />
              ))}
            </List>
          </Box>
          <Divider />
        </MuiDrawer>
        <Box
          component="main"
          sx={{
            width: '100%',
            minHeight: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: { xs: 8, sm: 9 },
            px: 2,
            pb: 2,
            overflow: 'auto',
          }}
        >
          <Typography
            component="h3"
            sx={{
              width: '100%',
              maxWidth: 480,
              py: '1rem',
              textAlign: 'center',
              fontFamily: 'var(--font-primary)',
              fontWeight: 700,
              color: 'var(--pba-primary)',
              fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
            }}
          >
            Usuario
          </Typography>
          <Stack spacing={4} textAlign="center" alignItems="center" justifyContent="center" sx={{ flex: 1, width: '100%', maxWidth: 480 }}>
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Box
                sx={{
                  border: '1px solid var(--pba-gris-claro)',
                  bgcolor: 'rgba(0, 154, 174, 0.05)',
                  borderRadius: 2,
                  p: { xs: 2, sm: 2.5 },
                  textAlign: 'left',
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography sx={{ fontFamily: 'var(--font-primary)', fontWeight: 700, color: '#fff' }}>
                      Sesión activa
                    </Typography>
                    <Chip
                      size="small"
                      label="Conectado"
                      sx={{ bgcolor: '#1fbf75', color: '#fff', fontFamily: 'var(--font-secondary)', fontWeight: 700 }}
                    />
                  </Stack>
                  <Typography sx={{ fontFamily: 'var(--font-secondary)', color: 'rgba(255,255,255,0.85)' }}>
                    Usuario actual:{' '}
                    <Box component="span" sx={{ color: '#fff', fontWeight: 700 }}>
                      {usuario || 'Sin usuario'}
                    </Box>
                  </Typography>
                  <Typography sx={{ fontFamily: 'var(--font-secondary)', color: 'rgba(255,255,255,0.72)', fontSize: '0.9rem' }}>
                    Desde esta vista podés confirmar la cuenta en uso y cerrar sesión para ingresar con otro usuario.
                  </Typography>
                </Stack>
              </Box>

              <Box
                sx={{
                  border: '1px solid var(--pba-gris-claro)',
                  bgcolor: 'rgba(123, 106, 232, 0.08)',
                  borderRadius: 2,
                  p: { xs: 2, sm: 2.5 },
                  textAlign: 'left',
                }}
              >
                <Stack spacing={1.5}>
                  <Typography sx={{ fontFamily: 'var(--font-primary)', fontWeight: 700, color: '#fff' }}>
                    Seguridad
                  </Typography>
                  <Typography sx={{ fontFamily: 'var(--font-secondary)', color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
                    Si terminaste de usar el panel en este dispositivo, cerrá la sesión para proteger el acceso.
                  </Typography>
                  <Button
                    onClick={handleCerrarSesion}
                    variant="contained"
                    type="button"
                    sx={{
                      display: 'flex',
                      gap: 1,
                      width: { xs: '100%', sm: '220px' },
                      fontFamily: 'var(--font-secondary)',
                      background: '#d32f2f',
                      color: '#fff',
                      '&:hover': { background: '#b71c1c',                      color: '#fff',
                      },
                      alignSelf: 'flex-start',
                    }}
                  >
                    Cerrar sesión
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Box>
      <FooterLogo />
    </Box>
  );
}
