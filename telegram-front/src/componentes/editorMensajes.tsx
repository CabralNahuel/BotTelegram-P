import React, { useRef } from 'react';
import { Box, Button } from '@mui/material';
import { sanitizeHtml } from '../utils/sanitizeHtml';

interface EditorMensajeProps {
  texto: string;
  setTexto: (texto: string) => void;
  manejarAgregarMensaje: (titulo: string) => void;
}

const EditorMensaje: React.FC<EditorMensajeProps> = ({ texto, setTexto, manejarAgregarMensaje }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleTextChange = () => {
    if (editorRef.current) {
      const textoPlano = editorRef.current.innerText;
      setTexto(textoPlano);
    }
  };

  return (
    <Box
      display="flex"
      marginBottom="1vh"
      alignItems={{ xs: 'stretch', sm: 'center' }}
      gap={2}
      flexDirection={{ xs: 'column', sm: 'row' }}
      width="100%"
      minWidth={0}
      boxSizing="border-box"
    >
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
      <Button
        onClick={() => manejarAgregarMensaje(texto)}
        variant="contained"
        sx={{ marginTop: 1, background: "var(--color1)", width: { xs: '100%', sm: 'auto' } }}
      >
        Agregar Mensaje
      </Button>
    </Box>
  );
};

export default EditorMensaje;
