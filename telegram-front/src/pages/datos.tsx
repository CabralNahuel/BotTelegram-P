import * as React from 'react';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AddHomeIcon from '@mui/icons-material/AddHome';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import KeyIcon from '@mui/icons-material/Key';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { InsertChartOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EstadisticasInteracciones from '../componentes/estadisticasInteracciones';
import DispositivosC from '../componentes/tableroContador';
import BotonesDrawer from '../componentes/botonesDrawer';
import { drawerNavListSx, drawerNavScrollBoxSx } from '../componentes/drawerNavListStyles';
import FooterLogo from '../componentes/footerLogo';

export default function Datos() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const drawerItems = [
    { text: 'Bienvenida', icon: <AddHomeIcon />, path: '/home', color: 'var(--color8)' },
    { text: 'Menu', icon: <AutoAwesomeMosaicIcon />, path: '/menu', color: 'var(--color11)' },
    { text: 'Token', icon: <KeyIcon />, path: '/token', color: 'var(--color6)' },
    { text: 'Usuario', icon: <AccountCircleIcon />, path: '/usuario', color: 'var(--color5)' },
    { text: 'Datos', icon: <InsertChartOutlined />, path: '/datos', color: 'var(--color3)' },
  ];

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
                onClick={() => setOpen(true)}
                edge="start"
                sx={{
                  color: 'var(--pba-secondary)',
                  '&:hover': { backgroundColor: 'var(--pba-secondary)', color: '#fff' },
                  ...(open && { display: 'none' }),
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
          open={open}
          onClose={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
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
                  open={open}
                  icon={item.icon}
                  onClick={() => {
                    navigate(item.path);
                    setOpen(false);
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
            pt: { xs: 8, sm: 9 },
            overflow: 'auto',
          }}
        >
          <Typography
            component="h3"
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              py: '1rem',
              textAlign: 'center',
              fontFamily: 'var(--font-primary)',
              fontWeight: 700,
              color: 'var(--pba-primary)',
              fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
              background: 'var(--pba-header-bg)',
            }}
          >
            Datos
          </Typography>
          <Box sx={{ display: 'grid', flex: 1, px: { xs: 1, sm: 2 }, pb: 2 }}>
            <DispositivosC />
            <EstadisticasInteracciones />
          </Box>
        </Box>
      </Box>
      <FooterLogo />
    </Box>
  );
}
