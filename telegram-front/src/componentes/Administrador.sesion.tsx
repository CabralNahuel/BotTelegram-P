import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { cerrarSesion } from '../assets/store.redux';

const TIEMPO_INACTIVIDAD = 300000; // 5 minuto en milisegundos

const AdministradorSesion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const temporizadorInactividad = useRef<ReturnType<typeof setTimeout> | null>(null);

  const manejarCerrarSesion = useCallback(() => {
    dispatch(cerrarSesion());
    if (temporizadorInactividad.current) {
      clearTimeout(temporizadorInactividad.current);
    }
  }, [dispatch]);

  const reiniciarTemporizadorInactividad = useCallback(() => {
    if (temporizadorInactividad.current) {
      clearTimeout(temporizadorInactividad.current);
    }
    temporizadorInactividad.current = setTimeout(manejarCerrarSesion, TIEMPO_INACTIVIDAD);
  }, [manejarCerrarSesion]);

  useEffect(() => {
    const manejarActividad = () => {
      reiniciarTemporizadorInactividad();
    };

    window.addEventListener('mousemove', manejarActividad);
    window.addEventListener('mousedown', manejarActividad);
    window.addEventListener('keypress', manejarActividad);

    reiniciarTemporizadorInactividad();

    return () => {
      window.removeEventListener('mousemove', manejarActividad);
      window.removeEventListener('mousedown', manejarActividad);
      window.removeEventListener('keypress', manejarActividad);

      if (temporizadorInactividad.current) {
        clearTimeout(temporizadorInactividad.current);
      }
    };
  }, [reiniciarTemporizadorInactividad]);

  return <>{children}</>;
};

export default AdministradorSesion;
