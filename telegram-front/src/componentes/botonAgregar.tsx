import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { IconButton, Tooltip } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

interface BotonAgregarProps {
  onAdd: (nombre: string, photo?: File) => void;
  label: string;
  showPhotoOption?: boolean;
  agregarEditar: string;
  mostrarEstilos?: boolean;
  initialText?: string;
}

/** Alto inicial del área editable y del botón enviar (el editor puede crecer; el botón no). */
const EDITOR_ROW_HEIGHT_PX = 48;
/** Tope de crecimiento visual del editor antes de activar scroll interno. */
const EDITOR_MAX_HEIGHT_PX = 176;

const BotonAgregar: React.FC<BotonAgregarProps> = ({
  onAdd,
  label,
  showPhotoOption = false,
  agregarEditar,
  mostrarEstilos = false,
  initialText = '',
}) => {
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | undefined>(undefined);
  const [isHovered, setIsHovered] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!editorRef.current) return;
    const current = cleanHTML(editorRef.current.innerText);
    if (!hasUserTyped || current === '') {
      editorRef.current.innerText = initialText;
      setNuevoNombre(cleanHTML(initialText));
    }
  }, [initialText, hasUserTyped]);

  const cleanHTML = (html: string) => {
    return html.replace(/<div>/g, '').replace(/<\/div>/g, '').replace(/<br>/g, '').replace(/&nbsp;/g, ' ').trim();
    
  };

  const handleAdd = () => {
    if (editorRef.current) {
      const content = label==="Mensajes"?  cleanHTML(editorRef.current.innerHTML) : cleanHTML(editorRef.current.innerText);
      if (content !== '') {
        onAdd(content, selectedPhoto);
        setNuevoNombre('');
        setSelectedPhoto(undefined);
        editorRef.current.innerText = ''; // Limpiar el contenido del editor
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleAdd();
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isBienvenida = label.toLowerCase() === 'bienvenida';
    if (isBienvenida && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAdd();
      return;
    }
    if (!isBienvenida && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fotos = e.target.files;
    if (fotos && fotos.length > 0) {
      setSelectedPhoto(fotos[0]);
    }
  };

  const handleTextChange = () => {
    if (editorRef.current) {
      setHasUserTyped(true);
      setNuevoNombre(cleanHTML(editorRef.current.innerText)); // Actualizar el estado con el texto limpio del editor
    }
  };

  const handleBold = () => document.execCommand('bold');
  const handleItalic = () => document.execCommand('italic');
  const handleLink = () => {
    const url = prompt('Ingrese la URL del enlace:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
    handleTextChange(); // Actualizar el estado con el nuevo contenido
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        width: '100%',
        minWidth: 0,
        gap: 2,
        mb: { xs: 1, sm: 2 },
      }}
    >
      <Box sx={{ flex: '1 1 70%', minWidth: 0 }}>
        {mostrarEstilos && (
          <Box sx={{ p: 1, display: "flex", padding: "0", gap: 1 }}>
            <Button className='BotonAgregar__botonesDeEstilos' onClick={handleBold} variant="outlined">Negrita</Button>
            <Button className='BotonAgregar__botonesDeEstilos' onClick={handleItalic} variant="outlined">Cursiva</Button>
            <Button className='BotonAgregar__botonesDeEstilos' onClick={handleLink} variant="outlined">Link</Button>
          </Box>
        )}
        <Box
          ref={editorRef}
          contentEditable
          sx={(theme) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            px: 1.75,
            py: 1,
            minHeight: EDITOR_ROW_HEIGHT_PX,
            maxHeight: EDITOR_MAX_HEIGHT_PX,
            width: '100%',
            minWidth: 0,
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden',
            overflowY: 'auto',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.paper',
            '&:focus': {
              outline: 'none',
              borderColor: 'primary.main',
            },
          })}
          onInput={handleTextChange} // Actualiza el estado con el contenido del editor
          onPaste={handlePaste} // Intercepta el evento de pegado
          onKeyDown={handleEditorKeyDown}
        />
      </Box>

      <Box
        sx={{
          flex: '0 0 auto',
          minWidth: { xs: 88, sm: 100 },
          maxWidth: { xs: 120, sm: 140 },
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: 1,
          /* Con barra de estilos, alinear la columna del botón con el editor (no con la toolbar). */
          mt: mostrarEstilos ? '44px' : 0,
        }}
      >
        {showPhotoOption && (
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="add-photo"
              type="file"
              onChange={handlePhotoChange}
            />
            <label htmlFor="add-photo">
              <Tooltip title={selectedPhoto && isHovered ? selectedPhoto.name : ''} arrow>
                <IconButton
                  sx={{ color: selectedPhoto ? 'primary.main' : 'inherit' }}
                  onClick={() => setIsHovered(!isHovered)}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <AddPhotoAlternateIcon />
                </IconButton>
              </Tooltip>
            </label>
          </Box>
        )}
        <Button
          variant="contained"
          type="submit"
          sx={{
            fontFamily: 'var(--font-primary)',
            width: '100%',
            height: EDITOR_ROW_HEIGHT_PX,
            minHeight: EDITOR_ROW_HEIGHT_PX,
            maxHeight: EDITOR_ROW_HEIGHT_PX,
            alignSelf: 'stretch',
            flexShrink: 0,
            px: 1.5,
            py: 0,
            fontSize: '0.875rem',
          }}
          onClick={handleAdd}
          disabled={nuevoNombre.trim() === ''}
        >
          {agregarEditar}
        </Button>
      </Box>
    </Box>
  );
};

export default BotonAgregar;
