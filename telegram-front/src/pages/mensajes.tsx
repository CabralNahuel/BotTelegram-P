import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, TableContainer, Table, TableBody, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import ItemsN from '../componentes/itemsN';
import FooterLogo from '../componentes/footerLogo';
import { useNavigate, useParams } from 'react-router-dom';
import EditorMensaje from '../componentes/editorMensajes';
import { apiFetch } from '../api/client';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import ConfirmDialog from '../componentes/ConfirmDialog';
import { useSnackbarFeedback } from '../hooks/useSnackbarFeedback';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import AddHomeIcon from '@mui/icons-material/AddHome';
import BotonesDrawer from '../componentes/botonesDrawer';
import KeyIcon from '@mui/icons-material/Key';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { InsertChartOutlined } from '@mui/icons-material';

type MensajeFila = {
  id: number;
  titulo: string;
  mensaje?: string;
  etiqueta?: { negrita?: boolean; cursiva?: boolean };
  comando_tema?: string;
};

const MensajesN: React.FC = () => {
  const theme = useTheme();
  const { notify, SnackbarOutlet } = useSnackbarFeedback();
  const [confirmVacioOpen, setConfirmVacioOpen] = useState(false);
  const { tema, id: idTema } = useParams<{ tema: string, id: string }>();
  const [mensajes, setMensajes] = useState<MensajeFila[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [texto, setTexto] = useState('');
  const [mensajeActual, setMensajeActual] = useState<{ id: number, titulo: string } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const drawerItems = [
    { text: 'Bienvenida', icon: <AddHomeIcon />, path: '/home', color: 'var(--color8)' },
    { text: 'Menu', icon: <AutoAwesomeMosaicIcon />, path: '/menu', color: 'var(--color11)' },
    { text: 'Token', icon: <KeyIcon />, path: '/token', color: 'var(--color6)' },
    { text: 'Usuario', icon: <AccountCircleIcon />, path: '/usuario', color: 'var(--color5)' },
    { text: 'Datos', icon: <InsertChartOutlined />, path: '/datos', color: 'var(--color3)' },
  ];

  const getMensajeError = async (response: Response, fallback: string) => {
    try {
      const body = await response.json();
      if (response.status === 400 && body?.code === 'MESSAGE_TOO_LONG') {
        return `El mensaje supera el maximo permitido (${body.currentLength}/${body.maxLength}).`;
      }
      return body?.message || fallback;
    } catch {
      return fallback;
    }
  };



  const obtenerMensajes = useCallback(async () => {
    if (!tema || !idTema) return;
    try {
      const response = await apiFetch(`/menu/temas/${tema}/${idTema}`);
      if (response.ok) {
        const data = await response.json();
        setMensajes(data.mensajes);
      } else {
        console.error('Error al obtener menús:', response.statusText);
      }
    } catch (error) {
      console.error('Error del servidor:', error);
    }
  }, [tema, idTema]);

  useEffect(() => {
    obtenerMensajes();
  }, [obtenerMensajes]);

  const manejarEliminar = async (idMensaje: number) => {
    if (!tema || !idTema) return;
    try {
      const response = await apiFetch(`/menu/temas/${tema}/${idTema}/${idMensaje}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(await getMensajeError(response, 'Error al eliminar el mensaje'));
      }

      obtenerMensajes();
    } catch (error) {
      console.error('Error al eliminar el mensaje:', error);
    }
  };

  const manejarGuardar = async () => {



    if (!texto.trim()) {
      if (mensajeActual) {
        setConfirmVacioOpen(true);
      }
      return;
    }
    if (mensajeActual) {
      if (!tema || !idTema) return;
      const etiqueta = {
        negrita: isBold,
        cursiva: isItalic,
      };



      try {
        const response = await apiFetch(`/menu/temas/${tema}/${idTema}/${mensajeActual.id}`, {
          method: 'PUT',
          body: JSON.stringify({ titulo: texto, etiqueta }),
        });

        if (!response.ok) {
          throw new Error(await getMensajeError(response, 'Error al actualizar el mensaje'));
        }

        const mensajesActualizados = mensajes.map(mensaje =>
          mensaje.id === mensajeActual.id ? { ...mensaje, mensaje: texto } : mensaje
        );
        setMensajes(mensajesActualizados);
      } catch (error) {
        console.error('Error al actualizar el mensaje:', error);
        notify(error instanceof Error ? error.message : 'Error al actualizar el mensaje', 'error');
        return;
      }
    }

    setOpenDialog(false);
    setTexto('');
    setIsBold(false);
    setIsItalic(false);
 
  };
  const editar = (mensaje: { id: number; titulo: string; etiqueta?: { negrita?: boolean; cursiva?: boolean }  }) => {
    setMensajeActual(mensaje);
    setTexto(mensaje.titulo);

    setIsBold(mensaje.etiqueta?.negrita || false);
    setIsItalic(mensaje.etiqueta?.cursiva || false);

  
    setOpenDialog(true);
  };

  const manejarCerrarDialogo = () => {
    setOpenDialog(false);

    setMensajeActual(null);
  };



  const manejarAgregarMensaje = async (titulo: string) => {
    if (!tema || !idTema) return;
    const etiqueta = {
      negrita: isBold,
      cursiva: isItalic,
    };
    try {
      const response = await apiFetch(`/menu/temas/${tema}/${idTema}/${idTema}`, {
        method: 'POST',
        body: JSON.stringify({ titulo, etiqueta }),
      });

      if (!response.ok) {
        throw new Error(await getMensajeError(response, 'Error al agregar el nuevo mensaje'));
      }

      const data = await response.json();
      setMensajes([...mensajes, data]);
    } catch (error) {
      console.error('Error al agregar el nuevo mensaje:', error);
      notify(error instanceof Error ? error.message : 'Error al agregar el nuevo mensaje', 'error');
      return;
    }

    setOpenDialog(false);
    setTexto('');
    setIsBold(false);
    setIsItalic(false);
 
    obtenerMensajes();

  };

  const handleBold = () => {
    setIsBold(!isBold);
  };

  const handleItalic = () => {
    setIsItalic(!isItalic);
  };



  const handleTextChange = () => {
    if (editorRef.current) {
      const textoPlano = editorRef.current.innerText;
      setTexto(textoPlano);
    }
  };

  const confirmarEliminarMensajeVacio = async () => {
    if (!mensajeActual) {
      setConfirmVacioOpen(false);
      return;
    }
    await manejarEliminar(mensajeActual.id);
    setOpenDialog(false);
    setTexto('');
    setIsBold(false);
    setIsItalic(false);
    setMensajeActual(null);
    setConfirmVacioOpen(false);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <CssBaseline />
        <AppBar position="fixed" elevation={0} sx={{ backgroundColor: 'var(--pba-header-bg)', borderBottom: '1px solid var(--pba-gris-claro)', color: 'var(--pba-secondary)' }}>
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              <Typography variant="h6" component="span" noWrap sx={{ fontFamily: 'var(--font-primary)', fontWeight: 800, color: 'var(--pba-primary)', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
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
                    navigate(item.path);
                    handleDrawerClose();
                  }}
                />
              ))}
            </List>
          </Box>
          <Divider />
        </MuiDrawer>
        <Box component="main" sx={{ width: "100%", minHeight: 0, flex: 1, display: "flex", flexDirection: "column", pt: { xs: 8, sm: 9 } }}>
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
            Mensajes
          </Typography>
          <TableContainer sx={{ overflowX: 'auto', width: '100%', maxWidth: '100%', flex: 1, minHeight: 0 }}>
            <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableBody>
                {mensajes.map((mensaje) => (

                  <ItemsN
                    key={mensaje.id}
                    fila={{ id: mensaje.id, titulo: mensaje.mensaje ?? mensaje.titulo, etiqueta: mensaje.etiqueta }}
                    editar={editar}
                    redireccion=''
                    ruteo={false}
                    redirigir={() => ("")}
                    manejarEliminar={manejarEliminar}
                    mostrarEliminar={true}
                    textoEliminacionSegura="¿Estás seguro de eliminar este mensaje?"
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Dialog open={openDialog} onClose={manejarCerrarDialogo} fullWidth maxWidth="sm">
            <DialogTitle sx={{ textAlign: 'center' }}> Editar </DialogTitle>
            <DialogContent>
              <Box sx={{ p: 1, display: "flex", px: 0, gap: 1, minHeight: "2rem", alignItems: "center", flexWrap: 'wrap' }}>
                <Button className={isBold ? 'boton-activo' : 'BotonAgregar__botonesDeEstilos'} onClick={handleBold} >Negrita</Button>
                <Button className={isItalic ? 'boton-activo' : 'BotonAgregar__botonesDeEstilos'} onClick={handleItalic} variant="outlined">Cursiva</Button>
              </Box>
              <Box
                contentEditable
                ref={editorRef}
                onBlur={handleTextChange}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(texto.replace(/\n/g, '<br />')),
                }}
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  minHeight: '100px',
                  border: '2px solid var(--color1)',
                  borderRadius: '10px',
                  p: 0.625,
                  boxSizing: 'border-box',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  overflowX: 'hidden',
                  whiteSpace: 'pre-wrap',
                }}
              />
            </DialogContent>
            <DialogActions sx={{ overflowWrap: "anywhere", width: "100%", justifyContent: "space-around", px: { xs: 1, sm: 2 } }}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={manejarCerrarDialogo} color="error">
                  Cancelar
                </Button>
                <Button onClick={mensajeActual ? manejarGuardar : () => manejarAgregarMensaje(texto)} color="primary">
                  {mensajeActual ? 'Guardar' : 'Agregar'}
                </Button>
              </Box>
            </DialogActions>
          </Dialog>
          <Box sx={{ p: { xs: "6px 8px", sm: "1px 10px" }, width: '100%', minWidth: 0, boxSizing: 'border-box', mt: 'auto', mb: '2rem' }}>
             <Box sx={{ p: 1, display: "flex", px: 0, gap: 1, minHeight: "2rem", alignItems: "center", flexWrap: 'wrap' }}>
                <Button className={isBold ? 'boton-activo' : 'BotonAgregar__botonesDeEstilos'} onClick={handleBold} >Negrita</Button>
                <Button className={isItalic ? 'boton-activo' : 'BotonAgregar__botonesDeEstilos'} onClick={handleItalic} variant="outlined">Cursiva</Button>
              </Box>
              <EditorMensaje 
            texto={texto} 
            setTexto={setTexto} 
            manejarAgregarMensaje={manejarAgregarMensaje} 
          />
          </Box>

        </Box>
      </Box>
      <ConfirmDialog
        open={confirmVacioOpen}
        title="Mensaje vacío"
        message="El texto está vacío. ¿Deseas eliminar este mensaje?"
        onConfirm={confirmarEliminarMensajeVacio}
        onCancel={() => setConfirmVacioOpen(false)}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmColor="error"
      />
      <SnackbarOutlet />
      <FooterLogo />
    </Box>
  );
};

export default MensajesN;
