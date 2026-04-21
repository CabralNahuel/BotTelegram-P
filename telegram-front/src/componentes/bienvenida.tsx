import * as React from 'react';
import { Stack, Box, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import Cargando from './cargando';
import BotonAgregar from './botonAgregar';
import { apiFetch } from '../api/client';

export default function Bienvenida() {
  const [bienvenida, setBienvenida] = React.useState('');
  const [cargando, setCargando] = React.useState(true);

  const enviar = async (textoBienvenida: string) => {
    try {
      const response = await apiFetch('/home/bienvenida', {
        method: 'PUT',
        body: JSON.stringify({ textoBienvenida }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el texto de bienvenida');
      }

      setBienvenida(textoBienvenida);
    } catch (error) {
      console.error(error);
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
      <Box sx={{ display: 'grid', maxWidth: '550px' }}>
        <Cargando />
      </Box>
    );
  }

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        overflow: 'auto',
        paddingTop: 10,
        paddingBottom: 1,
        height: '100%',
        width: '80%',
        maxWidth: '100%',
        boxShadow: 'none',
        background: 'transparent',
      }}
    >
      <Stack spacing={4} textAlign="center" alignItems="stretch" width="100%" height="100%" justifyContent="space-between" gap={2}>
        <Box marginTop={'10rem'}>
          <Typography
            textAlign="center"
            sx={{ fontFamily: 'var(--font-secondary)', color: 'var(--color3)', overflowWrap: 'anywhere' }}
            fontWeight={400}
          >
            {bienvenida}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', width: '100%', minWidth: 0, gap: 2, alignItems: 'stretch' }}>
          <BotonAgregar onAdd={enviar} label="Bienvenida" showPhotoOption={false} agregarEditar="Editar" />
        </Box>
      </Stack>
    </Card>
  );
}
