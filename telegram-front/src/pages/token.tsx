import * as React from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  CssBaseline,
  AppBar,
  Toolbar,
} from '@mui/material';
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Cargando from '../componentes/cargando';
import BotonesDrawer from '../componentes/botonesDrawer';
import { drawerNavListSx, drawerNavScrollBoxSx } from '../componentes/drawerNavListStyles';
import FooterLogo from '../componentes/footerLogo';
import { apiFetch } from '../api/client';
import { useSnackbarFeedback } from '../hooks/useSnackbarFeedback';

export default function Token() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { notify, SnackbarOutlet } = useSnackbarFeedback();
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [token, setToken] = React.useState('');
  const [cargando, setCargando] = React.useState(true);
  const tokenDisponible =
    token &&
    token !== 'No se encontró el token' &&
    token !== 'Error al cargar el token';

  const drawerItems = [
    { text: 'Bienvenida', icon: <AddHomeIcon />, path: '/home', color: 'var(--color8)' },
    { text: 'Menu', icon: <AutoAwesomeMosaicIcon />, path: '/menu', color: 'var(--color11)' },
    { text: 'Token', icon: <KeyIcon />, path: '/token', color: 'var(--color6)' },
    { text: 'Usuario', icon: <AccountCircleIcon />, path: '/usuario', color: 'var(--color5)' },
    { text: 'Datos', icon: <InsertChartOutlined />, path: '/datos', color: 'var(--color3)' },
  ];

  const obtenerTextoToken = async () => {
    try {
      const response = await apiFetch('/home/token', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al obtener el token');
      }

      const data = await response.json();
      if (data && data.token) {
        setToken(data.token);
      } else {
        setToken('No se encontró el token');
      }

      setCargando(false);
    } catch (error) {
      console.error('Error al obtener el token:', error);
      setToken('Error al cargar el token');
      setCargando(false);
    }
  };

  const generarToken = async () => {
    const newToken = uuidv4();
    try {
      const response = await apiFetch('/home/token', {
        method: 'PUT',
        body: JSON.stringify({ token: newToken }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el nuevo token');
      }

      setToken(newToken);
      notify('Token generado con éxito', 'success');
    } catch (error) {
      console.error('Error al guardar el nuevo token:', error);
      notify('Error al guardar el nuevo token', 'error');
    }
  };

  const copiarToken = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(token);
      } else {
        const textField = document.createElement('textarea');
        textField.value = token;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        textField.remove();
      }
      notify('Token copiado al portapapeles', 'success');
    } catch {
      notify('No se pudo copiar el token', 'error');
    }
  };

  React.useEffect(() => {
    obtenerTextoToken();
  }, []);

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
              maxWidth: 550,
              py: '1rem',
              textAlign: 'center',
              fontFamily: 'var(--font-primary)',
              fontWeight: 700,
              color: 'var(--pba-primary)',
              fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
            }}
          >
            Token
          </Typography>
          {cargando ? (
            <Box sx={{ display: 'grid', maxWidth: 550, width: '100%', flex: 1, placeItems: 'center' }}>
              <Cargando />
            </Box>
          ) : (
            <Box sx={{ display: 'grid', maxWidth: 680, width: '100%' }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    border: '1px solid var(--pba-gris-claro)',
                    bgcolor: 'rgba(0, 154, 174, 0.05)',
                    borderRadius: 2,
                    p: { xs: 2, sm: 2.5 },
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
                      <Typography sx={{ fontFamily: 'var(--font-primary)', fontWeight: 700, color: '#fff' }}>
                        Token actual del bot
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                        wordBreak: 'break-all',
                        fontFamily: 'var(--font-secondary)',
                        color: '#fff',
                      }}
                    >
                      {token}
                      <Tooltip title="Copiar token">
                        <span>
                          <IconButton
                            onClick={copiarToken}
                            aria-label="Copiar token"
                            disabled={!tokenDisponible}
                            size="small"
                          >
                            <ContentCopyIcon sx={{ color: tokenDisponible ? 'var(--color3)' : 'var(--pba-gris-claro)' }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Typography>
                    <Typography sx={{ fontFamily: 'var(--font-secondary)', color: 'rgba(255,255,255,0.78)', fontSize: '0.88rem' }}>
                      Usá este token para registrar usuarios en Telegram. Si lo regenerás, compartí el nuevo valor.
                    </Typography>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    border: '1px solid var(--pba-gris-claro)',
                    bgcolor: 'rgba(123, 106, 232, 0.08)',
                    borderRadius: 2,
                    p: { xs: 2, sm: 2.5 },
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography sx={{ fontFamily: 'var(--font-primary)', fontWeight: 700, color: '#fff' }}>
                      Acciones rápidas
                    </Typography>
                    <Button
                      onClick={generarToken}
                      variant="contained"
                      type="button"
                      sx={{
                        display: 'flex',
                        gap: 1,
                        width: { xs: '100%', sm: '260px' },
                        fontFamily: 'var(--font-secondary)',
                        background: 'var(--color1)',
                        alignSelf: 'flex-start',
                      }}
                      endIcon={<KeyIcon />}
                    >
                      Generar nuevo token
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}
          <SnackbarOutlet />
        </Box>
      </Box>
      <FooterLogo />
    </Box>
  );
}
