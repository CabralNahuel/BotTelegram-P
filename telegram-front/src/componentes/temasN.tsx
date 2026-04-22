import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TableBody from '@mui/material/TableBody';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import BotonAgregar from './botonAgregar'; // Importa el componente BotonAgregar
import ItemsN from './itemsN'; // Importa el componente ItemsN
import { useNavigate } from 'react-router-dom';
import { obtenerIniciales } from '../assets/obtenerIniciales';
import { TextareaAutosize } from '@mui/material';
import { apiFetch } from '../api/client';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import BotonesDrawer from './botonesDrawer';
import { drawerNavListSx, drawerNavScrollBoxSx } from './drawerNavListStyles';
import KeyIcon from '@mui/icons-material/Key';
import AddHomeIcon from '@mui/icons-material/AddHome';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { InsertChartOutlined } from '@mui/icons-material';

const anchoDrawer = 180;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: anchoDrawer,
    width: `calc(100% - ${anchoDrawer}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const FixedHeader = styled('h3')({
  fontFamily: 'var(--font-primary)',
  fontWeight: 700,
  color: 'var(--pba-primary)',
  padding: '1rem 0',
  textAlign: 'center',
  fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
});


const crearDato = (id: number, titulo: string) => {
  return { id, titulo };
};

interface TemaFila {
  id: number;
  titulo: string;
  comando_tema: string;
  eliminado?: number;
}

interface TemarioNProps {
  idMenu: string;
  ruteo: boolean; // Permitir ruteo incluso con un string vacío ""
  eliminar: boolean; // Indicador para mostrar la opción de eliminar
  insertarFoto: boolean;
  textoEliminar: string;
}

const ListaN: React.FC<TemarioNProps> = ({ idMenu, ruteo, eliminar, textoEliminar, insertarFoto }) => {
  const esGlobal = String(idMenu).toLowerCase() === 'global';
  const [open] = React.useState(false);
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [filas, setFilas] = React.useState<TemaFila[]>([]);
  const [texto, setTexto] = React.useState(''); // Estado para controlar el texto en el campo de diálogo
  const [comandoTema, setComandoTema] = React.useState('');
  const [filaActual, setFilaActual] = React.useState<{ id: number, titulo: string, comando_tema?: string } | null>(null);
  const [openDialog, setOpenDialog] = React.useState(false); // Estado para controlar la apertura del diálogo de edición
  const [, setAgregandoNuevo] = React.useState(false); // Estado para indicar si se está agregando un nuevo elemento
  const [idMenues, setIdMenu] = React.useState<number | null>(null); // Estado para almacenar el id del menú
  const navigate = useNavigate();
  const drawerItems = [
    { text: 'Bienvenida', icon: <AddHomeIcon />, path: '/home', color: 'var(--color8)' },
    { text: 'Menu', icon: <AutoAwesomeMosaicIcon />, path: '/menu', color: 'var(--color11)' },
    { text: 'Token', icon: <KeyIcon />, path: '/token', color: 'var(--color6)' },
    { text: 'Usuario', icon: <AccountCircleIcon />, path: '/usuario', color: 'var(--color5)' },
    { text: 'Datos', icon: <InsertChartOutlined />, path: '/datos', color: 'var(--color3)' },
  ];


  const obtenerMenuesConTemas = React.useCallback(async () => {
    try {
      const response = await apiFetch(`/menu/temas/${idMenu}`);
      if (response.ok) {
        const data = await response.json();
        setFilas(data.temas);
        setIdMenu(data.idmenu); // Guardar el id del menú
      } else {
        console.error('Error al obtener menús:', response.statusText);
      }
    } catch (error) {
      console.error('Error del servidor:', error);
    }
  }, [idMenu]);

  React.useEffect(() => {
    obtenerMenuesConTemas();
  }, [obtenerMenuesConTemas]);

  const normalizarComandoTema = (raw: string, fallbackTitulo = '') => {
    const base = (raw || fallbackTitulo || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^\/+/, '')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .trim();
    return base || `cnd${obtenerIniciales(fallbackTitulo)}`;
  };

  // Función para manejar el guardado de cambios en una fila
  const manejarGuardar = async () => {
    if (filaActual) {
      const comando_tema = normalizarComandoTema(comandoTema, texto);
      let contador = 0;


      // Verificar si el comando_tema ya existe en alguna fila actual

      let comando_tema_modificado = comando_tema;
      while (filas.some(fila => fila.comando_tema.toLowerCase() === comando_tema_modificado.toLowerCase() && fila.id !== filaActual.id)) {
        contador++;
        comando_tema_modificado = `${comando_tema}_${contador}`;

      }

      const filasActualizadas = filas.map(fila =>
        fila.id === filaActual.id ? { ...fila, titulo: texto, comando_tema: comando_tema_modificado } : fila
      );

      try {
        const response = await apiFetch(`/menu/temas/${idMenu}/${filaActual.id}`, {
          method: 'PUT',
          body: JSON.stringify({ titulo: texto, comando_tema: comando_tema_modificado }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.message || 'Error al actualizar el tema');
        }

        // Actualizar el estado local con las filas actualizadas
        setFilas(filasActualizadas);
      } catch (error) {
        console.error('Error al actualizar el tema:', error);
      }
    } else {
      const comando_tema = `Cnd${obtenerIniciales(texto)}`;
      let contador = 0;


      let comando_tema_modificado = comando_tema;
      while (filas.some(fila => fila.comando_tema === comando_tema_modificado)) {
        contador++;

        comando_tema_modificado = `${comando_tema}${'a'.repeat(contador)}`;

      }

      const nuevaFila = crearDato(filas.length, texto);
      setFilas([...filas, { ...nuevaFila, comando_tema: comando_tema_modificado }]);
    }

    setOpenDialog(false);
    setTexto('');
    setComandoTema('');
  };
  const editar = (fila: { id: number, titulo: string, comando_tema?: string }) => {

    setFilaActual(fila);
    setTexto(fila.titulo);
    setComandoTema(fila.comando_tema || '');
    setOpenDialog(true);
  };

  const redirigir = (ruta: string) => {
    navigate(ruta);
  };
  const handleDrawerOpen = () => setOpenDrawer(true);
  const handleDrawerClose = () => setOpenDrawer(false);
  const manejarEliminar = async (id: number) => {
    try {
      const response = await apiFetch(`/menu/temas/${idMenu}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el tema');
      }

      // Actualiza el estado local para reflejar la eliminación lógica
      setFilas(filas.map(fila =>
        fila.id === id ? { ...fila, eliminado: 1 } : fila
      ));
      obtenerMenuesConTemas();

    } catch (error) {
      console.error('Error al eliminar el tema:', error);
      // Manejar el error, por ejemplo, mostrando un mensaje al usuario
    }
  };
  // Función para agregar un nuevo tema

  const manejarAgregarTema = async (titulo: string) => {
    const comando_tema = normalizarComandoTema('', titulo);
    let contador = 0;
    let comando_tema_modificado = comando_tema;
    while (filas.some(fila => fila.comando_tema.toLowerCase() === comando_tema_modificado.toLowerCase())) {
      contador++;
      comando_tema_modificado = `${comando_tema}_${contador}`;
    }

    try {
      const response = await apiFetch('/menu/tema', {
        method: 'POST',
        body: JSON.stringify({ titulo, comando_tema: comando_tema_modificado, idmenu: esGlobal ? null : idMenues }),
      });

      if (!response.ok) {
        throw new Error('Error al agregar el nuevo tema');
      }

      const data = await response.json();
      setFilas([...filas, data]); // Agrega la nueva fila retornada por el servidor, que incluirá el ID asignado por la base de datos
    } catch (error) {
      console.error('Error al agregar el nuevo tema:', error);
    }

    setOpenDialog(false);
    setAgregandoNuevo(false);
    setTexto('');
    obtenerMenuesConTemas()
  };


  // Función para cerrar el diálogo
  const manejarCerrarDialogo = () => {
    setOpenDialog(false);
    setAgregandoNuevo(false);
    setFilaActual(null);
    setTexto('');
    setComandoTema('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '85vh', padding: "75px 10px 0 10px" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} elevation={0} sx={{ backgroundColor: 'var(--pba-header-bg)', borderBottom: '1px solid var(--pba-gris-claro)', color: 'var(--pba-secondary)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <IconButton
              aria-label="Abrir menú de navegación"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                color: 'var(--pba-secondary)',
                '&:hover': { backgroundColor: 'var(--pba-secondary)', color: '#fff' },
                ...(openDrawer && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontFamily: 'var(--font-primary)', fontWeight: 800, color: 'var(--pba-primary)' }}>
              Telegram Bot
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <MuiDrawer
        variant="temporary"
        anchor="left"
        open={openDrawer}
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
          zIndex: (theme) => theme.zIndex.modal,
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
                  handleDrawerClose();
                }}
              />
            ))}
          </List>
        </Box>
        <Divider />
      </MuiDrawer>
      <Box component="main" sx={{ width: "100%", height: "100%", overflow: "auto" }}>
        <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto' }}>
          <FixedHeader>{esGlobal ? 'Temas globales' : 'Temas'}</FixedHeader>
          <TableContainer sx={{ overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
            <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
              <TableBody>
                {filas.map((fila) => {
                  return (
                    <ItemsN
                      key={fila.id}
                      fila={fila}
                      ruteo={ruteo}
                      redireccion={`${fila.id}`}
                      editar={editar}
                      redirigir={redirigir}
                      manejarEliminar={manejarEliminar}
                      mostrarEliminar={eliminar}
                      textoEliminacionSegura={textoEliminar}
                      estiloMenu
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Dialog open={openDialog} onClose={manejarCerrarDialogo}>
          <DialogTitle sx={{overflowWrap:"anywhere", minWidth:"300px"}}>{filaActual ? 'Editar ' : 'Editar'}</DialogTitle>
          <DialogContent>
          <TextareaAutosize
            autoFocus
            minRows={3}
            style={{
              width: '100%',
              minWidth: 0,
              maxWidth: '100%',
              boxSizing: 'border-box',
              resize: 'none',
              border: '2px solid var(--color1)',
              borderRadius: 10,
              padding: 5,
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
              
            }}
            id="name"
            placeholder={esGlobal ? "Nombre del tema global" : "Nombre del tema"}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <TextareaAutosize
            minRows={1}
            style={{
              width: '100%',
              minWidth: 0,
              maxWidth: '100%',
              boxSizing: 'border-box',
              resize: 'none',
              border: '2px solid var(--pba-gris-claro)',
              borderRadius: 10,
              padding: 5,
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
              marginTop: 10,
            }}
            id="command"
            placeholder="Comando (ej: linkedin o proyecto_web)"
            value={comandoTema}
            onChange={(e) => setComandoTema(e.target.value)}
          />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center" }}>
            <Button onClick={manejarCerrarDialogo} color="error">
              Cancelar
            </Button>
            <Button onClick={filaActual ? manejarGuardar : () => manejarAgregarTema(texto)} color="primary">
              {filaActual ? 'Guardar' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto' }}>
        <BotonAgregar
          onAdd={(titulo: string) => manejarAgregarTema(titulo)}
          label="Nombre"
          showPhotoOption={insertarFoto}
          agregarEditar='Agregar'
        />
      </Box>
    </Box>
  );
};

export default ListaN;
