import React, { useState, useEffect } from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import AcordeonMenu from './acordeonMenu';
import BotonAgregar from './botonAgregar';
import { useNavigate } from 'react-router-dom';
import Cargando from './cargando';
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { apiFetch } from '../api/client';
import ConfirmDialog from './ConfirmDialog';
import { useSnackbarFeedback } from '../hooks/useSnackbarFeedback';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import BotonesDrawer from './botonesDrawer';
import KeyIcon from '@mui/icons-material/Key';
import AddHomeIcon from '@mui/icons-material/AddHome';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { InsertChartOutlined } from '@mui/icons-material';

interface TítulosDePaneles {
  [key: string]: { titulo: string; temas: { id: number; titulo: string }[] };
}

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: 'var(--pba-header-bg)',
  color: 'var(--pba-secondary)',
  boxShadow: 'none',
  borderBottom: '1px solid var(--pba-gris-claro)',
}));

export default function Menus() {
  const theme = useTheme();
  const { notify, SnackbarOutlet } = useSnackbarFeedback();
  const [open, setOpen] = useState(false);
  const [confirmEliminarOpen, setConfirmEliminarOpen] = useState(false);
  const [panelEliminar, setPanelEliminar] = useState<string | null>(null);
  const [desplegar, setDesplegar] = useState<string | false>('');
  const [abrirDialogo, setAbrirDialogo] = useState(false);
  const [agregarNuevo, setAgregarNuevo] = useState(false);
  const [panelActual, setPanelActual] = useState('');
  const [texto, setTexto] = useState('');
  const [textoTemporal, setTextoTemporal] = useState('');
  const [menues, setMenues] = useState<TítulosDePaneles>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recargar, setRecargar] = useState(false); // Estado para forzar la recarga

  useEffect(() => {
    const obtenerMenues = async () => {
      try {
        const respuesta = await apiFetch('/home/menues');
        if (!respuesta.ok) {
          throw new Error('Error al obtener los menús');
        }
        const datos = await respuesta.json();

        const menuesObj: TítulosDePaneles = {};
        datos.forEach((menu: { id: number; titulo: string; temas: { id: number; titulo: string }[] }) => {
          menuesObj[`${menu.id}`] = { titulo: menu.titulo, temas: menu.temas };
        });
        setMenues(menuesObj);
        setCargando(false);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Error desconocido');
        }
        setCargando(false);
      }
    };

    obtenerMenues();
  }, [recargar]); // Dependencia recargar para forzar la recarga cuando cambie

  const escucharCambios = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setDesplegar(isExpanded ? panel : false);
  };

  const navegar = useNavigate();
  const drawerItems = [
    { text: 'Bienvenida', icon: <AddHomeIcon />, path: '/home', color: 'var(--color8)' },
    { text: 'Menu', icon: <AutoAwesomeMosaicIcon />, path: '/menu', color: 'var(--color11)' },
    { text: 'Token', icon: <KeyIcon />, path: '/token', color: 'var(--color6)' },
    { text: 'Usuario', icon: <AccountCircleIcon />, path: '/usuario', color: 'var(--color5)' },
    { text: 'Datos', icon: <InsertChartOutlined />, path: '/datos', color: 'var(--color3)' },
  ];

  const redirigir = (ruta: string) => {
    navegar(ruta);
  };

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const editar = (panel: string) => {
    setPanelActual(panel);
    setTexto(menues[panel].titulo);
    setTextoTemporal(menues[panel].titulo);
    setAbrirDialogo(true);
  };

  const cerrarDialogo = () => {
    setAbrirDialogo(false);
    setAgregarNuevo(false);
  };

  const guardar = async () => {
    if (agregarNuevo) {
      try {
        const respuesta = await apiFetch('/home/menues', {
          method: 'POST',
          body: JSON.stringify({ titulo: texto }),
        });

        if (!respuesta.ok) {
          throw new Error('Error al agregar el nuevo menú');
        }

        const nuevoMenu = await respuesta.json();
        const nuevaClavePanel = `menu${nuevoMenu.id}`;
        setMenues((prevMenues) => ({
          ...prevMenues,
          [nuevaClavePanel]: { titulo: nuevoMenu.titulo, temas: [] },
        }));
        setDesplegar(nuevaClavePanel);
      } catch (error) {
        console.error(error);
      }
    } else {
      const menuActualizado = { id: parseInt(panelActual.replace('menu', '')), titulo: texto };
      try {
        const respuesta = await apiFetch(`/home/menues/${menuActualizado.id}`, {
          method: 'PUT',
          body: JSON.stringify({ titulo: menuActualizado.titulo }),
        });

        if (!respuesta.ok) {
          throw new Error('Error al actualizar el menú');
        }

        setMenues((prevMenues) => ({
          ...prevMenues,
          [panelActual]: { ...prevMenues[panelActual], titulo: texto },
        }));
      } catch (error) {
        console.error(error);
      }
    }
    setAbrirDialogo(false);
    setAgregarNuevo(false);
  };

  const solicitarEliminar = (panel: string) => {
    setPanelEliminar(panel);
    setConfirmEliminarOpen(true);
  };

  const ejecutarEliminar = async () => {
    if (!panelEliminar) return;
    const panel = panelEliminar;
    const id = parseInt(panel.replace('menu', ''));

    try {
      const respuesta = await apiFetch(`/home/menues/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ eliminado: 1 }),
      });

      if (!respuesta.ok) {
        throw new Error('Error al eliminar el menú');
      }

      const menuesActualizados = { ...menues };
      delete menuesActualizados[panel];
      setMenues(menuesActualizados);
      notify('Menú eliminado correctamente.', 'success');
    } catch (error) {
      console.error(error);
      notify(error instanceof Error ? error.message : 'Error al eliminar el menú', 'error');
    } finally {
      setConfirmEliminarOpen(false);
      setPanelEliminar(null);
    }
  };

  const FixedHeader = styled('h3')({
    position: 'sticky',
    fontFamily: 'var(--font-primary)',
    fontWeight: 700,
    color: 'var(--pba-primary)',
    top: 0,
    background: 'var(--pba-header-bg)',
    zIndex: 10,
    padding: '1rem 0',
    textAlign: 'center',
    fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
  });
  const manejarAgregarTema = async (nombre: string) => {
    try {
      const respuesta = await apiFetch('/home/menues', {
        method: 'POST',
        body: JSON.stringify({ titulo: nombre }),
      });

      if (!respuesta.ok) {
        throw new Error('Error al agregar el nuevo menú');
      }

      const nuevoMenu = await respuesta.json();
      const nuevaClavePanel = `menu${nuevoMenu.id}`;
      setMenues((prevMenues) => ({
        ...prevMenues,
        [nuevaClavePanel]: { titulo: nuevoMenu.titulo, temas: [] },
      }));
      setDesplegar(nuevaClavePanel);
      setRecargar(prev => !prev); 

    } catch (error) {
      console.error(error);
    }
  };

  if (cargando) {
    return <Cargando />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "85vh", padding: "75px 10px 0 10px" }}>
      <AppBar position="fixed" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <IconButton
              aria-label="Abrir menú de navegación"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                color: 'var(--pba-secondary)',
                '&:hover': { backgroundColor: 'var(--pba-secondary)', color: '#fff' },
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" noWrap sx={{ fontFamily: 'var(--font-primary)', fontWeight: 800, color: 'var(--pba-primary)' }}>
              Telegram Bot
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <MuiDrawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
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
            <Typography variant="subtitle1" noWrap sx={{ color: '#fff', fontWeight: 700, fontFamily: 'var(--font-primary)', fontSize: { xs: '1rem', sm: '1.0625rem' } }}>
              Telegram Bot
            </Typography>
            <IconButton
              aria-label="Cerrar menú"
              onClick={handleDrawerClose}
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
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 2, py: 3 }}>
          <List sx={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-around', height: '100%', gap: 0.5 }}>
            {drawerItems.map((item, index) => (
              <BotonesDrawer
                color={item.color}
                key={item.text}
                text={item.text}
                index={index}
                open={open}
                icon={item.icon}
                onClick={() => {
                  navegar(item.path);
                  handleDrawerClose();
                }}
              />
            ))}
          </List>
        </Box>
        <Divider />
      </MuiDrawer>
      <Box component="main" sx={{ width: "100%", height: "100%", overflow: "auto" }}>
        <FixedHeader >Menu</FixedHeader>
        <AcordeonMenu
          titulos={menues}
          desplegar={desplegar}
          escucharCambios={escucharCambios}
          editar={editar}
          redirigir={redirigir}
          eliminar={solicitarEliminar}
        />
      </Box>
      <Box sx={{ width: "100%", mt: "auto" }}>
        <BotonAgregar onAdd={manejarAgregarTema} label="Menu" agregarEditar='Agregar' />
      </Box>
      <Dialog open={abrirDialogo} onClose={cerrarDialogo} fullWidth maxWidth="sm">
        <DialogTitle sx={{ overflowWrap: "anywhere" }}>{agregarNuevo ? 'Agregar nuevo Menu' : `Editar título "${textoTemporal}"`}</DialogTitle>
        <DialogContent >
          <TextareaAutosize
            autoFocus
            minRows={3}
            style={{ width: '100%', resize: 'none', border: "2px solid var(--color1)", borderRadius: 10, padding: 5 }}
            id="name"
            placeholder="Nombre del Menu"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogo}>Cancelar</Button>
          <Button onClick={guardar}>Guardar</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmEliminarOpen}
        title="Eliminar menú"
        message="¿Estás seguro de que querés borrar esta información?"
        onConfirm={ejecutarEliminar}
        onCancel={() => {
          setConfirmEliminarOpen(false);
          setPanelEliminar(null);
        }}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmColor="error"
      />
      <SnackbarOutlet />
    </Box>
  );
}
