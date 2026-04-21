import './App.css';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { pbaTheme } from './theme/pbaTheme';
import store from './assets/store.redux';
import ProtejerRutas from './componentes/rutasPrivadas';
import Login from './pages/Login';
import HomePage from './pages/home';
import TemasN from './pages/temas';
import MensajesN from './pages/mensajes';
import Menus from './pages/menu';
import Token from './pages/token';
import Usuarios from './pages/usuarios';
import Datos from './pages/datos';
import AdministradorSesion from './componentes/Administrador.sesion';
import { ROUTER_BASENAME } from './const/router';

function App() {
  React.useEffect(() => {
    const handleGlobalEnter = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.defaultPrevented || event.isComposing) {
        return;
      }

      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const form = target.closest('form') as HTMLFormElement | null;
      if (form && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        form.requestSubmit();
        return;
      }

      // Deja el comportamiento nativo en campos de texto y editores sin formulario.
      if (
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        (target.tagName === 'INPUT' &&
          (target as HTMLInputElement).type !== 'button' &&
          (target as HTMLInputElement).type !== 'submit')
      ) {
        return;
      }

      const buttonLike = target.closest(
        'button, [role="button"], input[type="button"], input[type="submit"]',
      ) as HTMLElement | null;

      if (buttonLike) {
        buttonLike.click();
      }
    };

    document.addEventListener('keydown', handleGlobalEnter);
    return () => document.removeEventListener('keydown', handleGlobalEnter);
  }, []);

  return (
    <ThemeProvider theme={pbaTheme}>
      <CssBaseline />
    <Provider store={store}>
      <AdministradorSesion>
      <BrowserRouter basename={ROUTER_BASENAME}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<ProtejerRutas />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/menu" element={<Menus />} />
              <Route path="/menu/temas/:idMenu" element={<TemasN />} />
              <Route path="/menu/temas/:tema/:id" element={<MensajesN />} />
              <Route path="/token" element={<Token />} />
              <Route path="/usuario" element={<Usuarios />} />
              <Route path="/datos" element={<Datos />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </BrowserRouter>
      </AdministradorSesion>
    </Provider>
    </ThemeProvider>
  )}

export default App;