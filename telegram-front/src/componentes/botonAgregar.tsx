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
}

const BotonAgregar: React.FC<BotonAgregarProps> = ({ onAdd, label, showPhotoOption = false, agregarEditar, mostrarEstilos = false }) => {
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | undefined>(undefined);
  const [isHovered, setIsHovered] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

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
    if (e.key === 'Enter' && !e.shiftKey) {
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
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'row', alignItems: mostrarEstilos ? 'center' : 'baseline', width: '100%', minWidth: 0, gap: 1,marginBottom:'2rem'}}>
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
          sx={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            minHeight: '4vh',
            width: "100%",
            minWidth: 0,
            maxWidth: "100%",
            boxSizing: 'border-box',
            overflowX: 'hidden',
            overflowY: 'auto',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            '&:focus': {
              outline: 'none',
              borderColor: 'var(--color1)'
            },
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 'auto',
          }}
          onInput={handleTextChange} // Actualiza el estado con el contenido del editor
          onPaste={handlePaste} // Intercepta el evento de pegado
          onKeyDown={handleEditorKeyDown}
        />
      </Box>

      <Box sx={{ flex: '0 1 30%', minWidth: 0, display: 'flex', alignItems: 'stretch', flexDirection: 'column', justifyContent: 'center', gap: 1, mt: mostrarEstilos ? 0 : 2 }}>
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
          sx={{ fontFamily: 'var(--font-secondary)', background: 'var(--color1)', width: '100%', maxHeight: "48px" }}
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
