import React, { useState } from 'react';
import { Alert, Box, CircularProgress, Grid, Button, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Logo from '../assets/Logo/img';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { establecerUsuario } from '../assets/store.redux'; // Importa la acción establecerUsuario desde el store configurado
import { apiFetch } from '../api/client';

const Login: React.FC = () => {
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [usuario, setUsuarioLocal] = useState<string>('');
  const [contraseña, setContraseña] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const alternarVisibilidadContraseña = () => {
    setMostrarContraseña(!mostrarContraseña);
  };

  const ingresar = async () => {
    setError(null);
    setCargando(true);

    try {
      const loginPaths = ['/login'];
      let response: Response | null = null;
      let usedPath = '';

      for (const path of loginPaths) {
        const currentResponse = await apiFetch(path, {
          method: 'POST',
          body: JSON.stringify({ usuario, contraseña }),
        });

        response = currentResponse;
        usedPath = path;
        if (currentResponse.status !== 404) {
          break;
        }
      }

      if (!response) {
        throw new Error('No se pudo iniciar sesion.');
      }

      if (!response.ok) {
        let backendMessage = '';
        try {
          const errorBody = await response.json();
          backendMessage = errorBody?.message || '';
        } catch {
          // ignore parse errors
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error('Usuario o contrasena incorrectos.');
        }
        if (response.status === 404) {
          throw new Error(`No se encontro el endpoint de login en el backend (${usedPath}).`);
        }

        throw new Error(backendMessage || `Error al iniciar sesion (${response.status}).`);
      }

      dispatch(establecerUsuario(usuario));
      // Redireccionar a la página de inicio
      navigate('/home');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesion.';
      setError(message);
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    ingresar();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #141414 0%, #0A0A0A 70%, #000000 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(229, 9, 20, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(229, 9, 20, 0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 3, sm: 5 },
          justifyContent: 'center',
          alignItems: 'center',
          px: 2,
          py: { xs: 3, sm: 4 },
        }}
      >
      <Logo />
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: 'var(--pba-header-bg)',
          border: '1px solid var(--pba-gris-claro)',
          borderRadius: 2,
          boxShadow: 'var(--pba-sombra-boton)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          sx={{
            color: '#EDEDED',
            textAlign: 'center',
            mb: 3,
            fontFamily: 'var(--font-primary)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: '1rem',
            '&::after': {
              content: '"_"',
              color: 'var(--pba-primary)',
              animation: 'blink 1.2s infinite',
            },
            '@keyframes blink': {
              '0%, 50%': { opacity: 1 },
              '51%, 100%': { opacity: 0 },
            },
          }}
        >
          Telegram Bot Admin
        </Typography>
        <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
          {cargando && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                Conectando con el servidor. El backend está en un free tier y puede
                tardar hasta 30 segundos en despertar la primera vez.
              </Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              type="text"
              label="Usuario"
              fullWidth
              value={usuario}
              disabled={cargando}
              onChange={(e) => setUsuarioLocal(e.target.value)}
              InputProps={{
                style: { fontFamily: 'var(--font-secondary)' },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              type={mostrarContraseña ? 'text' : 'password'}
              label="Contraseña"
              fullWidth
              disabled={cargando}
              onChange={(e) => setContraseña(e.target.value)}
              InputProps={{
                endAdornment: (
                  <Button type="button" onClick={alternarVisibilidadContraseña} color="info">
                    {mostrarContraseña ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </Button>
                ),
                style: { fontFamily: 'var(--font-secondary)' },
              }}
            />
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Typography role="alert" sx={{ textAlign: 'center', color: 'var(--pba-rojo)', fontSize: '0.875rem' }}>
                {error}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              sx={{
                width: { xs: '100%', sm: 'auto' },
                minWidth: { sm: 200 },
                fontFamily: 'var(--font-primary)',
                fontWeight: 600,
              }}
              variant="contained"
              type="submit"
              color="primary"
              endIcon={cargando ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
              fullWidth
              disabled={cargando}
              onClick={ingresar}
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </Grid>
        </Grid>
      </Box>
      </Box>
    </Box>
  );
};

export default Login;
