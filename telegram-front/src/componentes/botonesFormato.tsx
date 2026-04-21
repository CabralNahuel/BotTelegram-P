import React, { useState } from 'react';

const BotonFormato: React.FC = () => {
  const [texto, setTexto] = useState('');

  const agregarFormato = (tipo: 'bold' | 'link') => {
    const seleccion = window.getSelection();
    if (!seleccion || !seleccion.rangeCount) return;

    const rango = seleccion.getRangeAt(0);
    const textoSeleccionado = rango.toString();
    const esLink = /^(http|https):\/\/[^ "]+$/.test(textoSeleccionado);

    let nuevoTexto;
    if (tipo === 'bold') {
      nuevoTexto = `<b>${textoSeleccionado}</b>`;
    } else if (tipo === 'link' && esLink) {
      nuevoTexto = `<a href="${textoSeleccionado}" target="_blank">${textoSeleccionado}</a>`;
    } else {
      return; // Si no es un enlace válido, no hacer nada
    }

    const nodoSustituto = document.createTextNode(nuevoTexto);
    rango.deleteContents();
    rango.insertNode(nodoSustituto);
  };
texto
  return (
    <div>
      <div contentEditable={true} onInput={(e) => setTexto(e.currentTarget.innerHTML)} style={{ border: '1px solid #ccc', padding: '10px', minHeight: '100px' }}>
        {/* Área editable */}
      </div>
      <button onClick={() => agregarFormato('bold')}>Agregar Negrita</button>
      <button onClick={() => agregarFormato('link')}>Agregar Link</button>
    </div>
  );
};

export default BotonFormato;
