import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Sesión en cliente: solo el nombre de usuario en localStorage.
 * La autorización real debe validarla el backend en cada API.
 * No borrar localStorage al cargar el módulo: permite persistir sesión al refrescar.
 */

// Definir el estado inicial
interface EstadoInicial {
  usuario: string | null;
}

function leerUsuarioLocal(): string | null {
  try {
    return localStorage.getItem('usuario');
  } catch {
    return null;
  }
}

const estadoInicial: EstadoInicial = {
  usuario: leerUsuarioLocal(),
};

// Crear un slice para manejar el estado del usuario
const usuarioSlice = createSlice({
  name: 'usuario',
  initialState: estadoInicial,
  reducers: {
    establecerUsuario(state, action: PayloadAction<string>) {
      state.usuario = action.payload;
      try {
        localStorage.setItem('usuario', action.payload);
      } catch {
        /* localStorage no disponible */
      }
    },
    cerrarSesion(state) {
      state.usuario = null;
      try {
        localStorage.removeItem('usuario');
      } catch {
        /* ignorar */
      }
    },
  },
});

// Exportar las acciones generadas por createSlice
export const { establecerUsuario, cerrarSesion } = usuarioSlice.actions;

// Crear el store usando configureStore
const store = configureStore({
  reducer: {
    usuario: usuarioSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
