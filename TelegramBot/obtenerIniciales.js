function obtenerIniciales(texto) {
    const palabras = texto.split(' ');
    let resultado = '';

    palabras.forEach((palabra, index) => {
        if (index === 0) {
            resultado += palabra.charAt(0).toLowerCase();
        } else {
            resultado += palabra.charAt(0).toUpperCase();
        }
    });

    return resultado;
}


module.exports = { obtenerIniciales };
