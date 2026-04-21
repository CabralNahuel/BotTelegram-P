import { Box } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

const DispositivosC: React.FC = () => {
  const [cantidadUsuarios, setCantidadUsuarios] = useState(0);

  useEffect(() => {
    const obtenerCantidadUsuarios = async () => {
      try {
        const respuesta = await apiFetch('/usuarios/cantidad', {
          method: 'GET',
        });

        if (!respuesta.ok) {
          throw new Error(`HTTP error! Status: ${respuesta.status}`);
        }

        const data = await respuesta.json(); // Parsear la respuesta como JSON
        setCantidadUsuarios(data.cantidad); // Acceder a la cantidad desde los datos de la respuesta
      } catch (error) {
        console.error('Error al obtener la cantidad de usuarios:', error);
      }
    };

    obtenerCantidadUsuarios();
  }, []);

  return (
    <Box display={'flex'} alignItems={'center'} flexDirection={'column'}>
      <h3 >Usuarios Registrados</h3>
      <Box>
        <Box >
          <span >Total:</span>
          <span >{cantidadUsuarios}</span>
        </Box>
      </Box>
    </Box>
  );
};

export default DispositivosC;
