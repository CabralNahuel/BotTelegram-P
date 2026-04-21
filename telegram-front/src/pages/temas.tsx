import React from 'react';
import { Box } from '@mui/material';
import ListaN from '../componentes/temasN';
import FooterLogo from '../componentes/footerLogo';
import { useParams } from 'react-router-dom'; // Importa el hook useParams

const TemasN: React.FC = () => {
  const { idMenu } = useParams<{ idMenu: string }>(); // Obtén el parámetro 'titulo' de la URL

  if (!idMenu) {
    return <Box>falta un titulo</Box>; // Manejar el caso donde el título no está disponible
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <ListaN
          idMenu={idMenu}
          ruteo={true}
          eliminar={true}
          insertarFoto={false}
          textoEliminar={`Se eliminarán los Mensajes`}
        />
      </Box>
      <FooterLogo />
    </Box>
  );
};

export default TemasN;
