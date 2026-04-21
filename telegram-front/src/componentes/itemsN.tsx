import * as React from 'react';
import { Box, TableCell, TableRow, IconButton, Dialog, DialogTitle, DialogActions, Button } from '@mui/material';
import { htmlToPlainText, sanitizeHtml } from '../utils/sanitizeHtml';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface ItemsNProps {
  fila: {
    id: number;
    titulo: string;
    etiqueta?: { negrita?: boolean; cursiva?: boolean }
  };
  ruteo: boolean;
  redireccion: string;
  editar: (fila: { id: number; titulo: string }) => void;
  redirigir: (ruta: string) => void;
  manejarEliminar: (id: number) => void;
  mostrarEliminar: boolean;
  textoEliminacionSegura: string;
}

const ItemsN: React.FC<ItemsNProps> = ({
  fila,
  ruteo,
  redireccion,
  editar,
  redirigir,
  manejarEliminar,
  mostrarEliminar,
  textoEliminacionSegura,
}) => {
  const [popUpEliminar, setPopUpEliminar] = React.useState(false);

  const handleDeleteClick = () => {
    setPopUpEliminar(true);
  };

  const confirmarEliminar = () => {
    manejarEliminar(fila.id);
    setPopUpEliminar(false);
  };

  const cancelarEliminar = () => {
    setPopUpEliminar(false);
  };

  return (
    <TableRow key={fila.id}>
      {/* el dangerous es para que levante los datos de la base de date en html y los muestre bien en el front */}
      <TableCell
        sx={{
          maxWidth: 0,
          width: '100%',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          verticalAlign: 'top',
        }}
      >
        <Box
          component="div"
          sx={{ overflowWrap: 'anywhere', wordBreak: 'break-word', maxWidth: '100%' }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(fila.titulo) }}
        />
      </TableCell>
      <TableCell align="right" sx={{ width: 1, whiteSpace: 'nowrap', verticalAlign: 'top' }}>
        <IconButton
          aria-label="editar"
          onClick={() => editar(fila)}
        >
          <EditIcon />
        </IconButton>

        {mostrarEliminar && (
          <IconButton
            aria-label="eliminar"
            color='error'
            onClick={handleDeleteClick}
          >
            <DeleteIcon />
          </IconButton>
        )}

        {ruteo && (
          <IconButton
            aria-label="verTemas"
            onClick={(event) => {
              event.stopPropagation(); // Evitar que el evento de clic se propague al TableRow
              redirigir(redireccion);
            }}
          >
            <AddIcon />
          </IconButton>
        )}

        <Dialog
          open={popUpEliminar}
          onClose={() => setPopUpEliminar(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle sx={{ height: "fit-content", overflowWrap: "break-word", textAlign: "center" }} id="alert-dialog-title">
            {textoEliminacionSegura} <br />
            {htmlToPlainText(fila.titulo)}
          </DialogTitle>
          <DialogActions>
            <Button onClick={cancelarEliminar} color="error">
              Cancelar
            </Button>
            <Button onClick={confirmarEliminar} color="primary" autoFocus>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </TableCell>
    </TableRow>

  );
};

export default ItemsN;
