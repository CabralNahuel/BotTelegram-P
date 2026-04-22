import * as React from 'react';
import { Stack, Box, Typography, Container, Card } from '@mui/material';
import Cargando from './cargando';
import BotonAgregar from './botonAgregar';
import { apiFetch } from '../api/client';
import { useSnackbarFeedback } from '../hooks/useSnackbarFeedback';
import { sanitizeHtml } from '../utils/sanitizeHtml';

const tituloBienvenidaSx = {
  flexShrink: 0,
  width: '100%',
  maxWidth: 720,
  textAlign: 'center',
  fontFamily: 'var(--font-primary)',
  fontWeight: 600,
  color: 'primary.main',
  fontSize: { xs: '1.75rem', sm: '2.125rem' },
  lineHeight: 1.2,
  letterSpacing: '-0.01em',
  mt: { xs: 1, sm: 1.5 },
  mb: { xs: 2, sm: 2.5 },
  px: { xs: 1, sm: 0 },
} as const;

function LayoutBienvenida({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'stretch',
      }}
    >
      <Typography component="h2" variant="h2" sx={{...tituloBienvenidaSx, pt: '2rem'}}>
        Bienvenida
      </Typography>
      <Box
        sx={{
          flex: 1,
          width: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 0, sm: 1 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function Bienvenida() {
  const [bienvenida, setBienvenida] = React.useState('');
  const [cargando, setCargando] = React.useState(true);
  const { notify, SnackbarOutlet } = useSnackbarFeedback();
  const bienvenidaRenderizada = React.useMemo(
    () => sanitizeHtml((bienvenida ?? '').replace(/\n/g, '<br />')),
    [bienvenida],
  );

  const enviar = async (textoBienvenida: string) => {
    try {
      const response = await apiFetch('/home/bienvenida', {
        method: 'PUT',
        body: JSON.stringify({ textoBienvenida }),
      });

      if (!response.ok) {
        let backendMessage = 'Error al actualizar el texto de bienvenida';
        try {
          const body = await response.json();
          if (body?.message) backendMessage = String(body.message);
        } catch {
          // ignore json parse errors
        }
        throw new Error(backendMessage);
      }

      setBienvenida(textoBienvenida);
      notify('Texto de bienvenida actualizado', 'success');
    } catch (error) {
      console.error(error);
      notify(error instanceof Error ? error.message : 'No se pudo actualizar la bienvenida', 'error');
    }
  };

  const obtenerTextoBienvenida = async () => {
    try {
      const response = await apiFetch('/home/bienvenida', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al obtener el texto de bienvenida');
      }

      const data = await response.json();

      if (data && data.textoBienvenida) {
        setBienvenida(data.textoBienvenida);
      } else {
        console.log('No se encontró texto de bienvenida en la respuesta');
      }

      setCargando(false);
    } catch (error) {
      console.error('Error en obtenerTextoBienvenida:', error);
      setCargando(false);
    }
  };

  React.useEffect(() => {
    obtenerTextoBienvenida();
  }, []);

  if (cargando) {
    return (
      <LayoutBienvenida>
        <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Cargando />
        </Container>
      </LayoutBienvenida>
    );
  }

  return (
    <>
      <LayoutBienvenida>
        <Container maxWidth="sm" sx={{ width: '100%', px: { xs: 2, sm: 3 } }}>
          <Card
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 640,
              mx: 'auto',
              p: { xs: 2.5, sm: 3 },
              maxHeight: { xs: 'calc(100vh - 250px)', sm: 'calc(100vh - 280px)' },
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxSizing: 'border-box',
            }}
          >
            <Stack spacing={3} alignItems="stretch">
              <Typography
                component="div"
                variant="body1"
                textAlign="center"
                sx={{
                  fontFamily: 'var(--font-primary)',
                  fontWeight: 400,
                  color: 'text.primary',
                  lineHeight: 1.6,
                  overflowWrap: 'anywhere',
                }}
                dangerouslySetInnerHTML={{ __html: bienvenidaRenderizada }}
              />
              <Box sx={{ width: '100%', minWidth: 0 }}>
                <BotonAgregar
                  onAdd={enviar}
                  label="Bienvenida"
                  showPhotoOption={false}
                  agregarEditar="Guardar"
                  initialText={bienvenida}
                />
              </Box>
            </Stack>
          </Card>
        </Container>
      </LayoutBienvenida>
      <SnackbarOutlet />
    </>
  );
}
