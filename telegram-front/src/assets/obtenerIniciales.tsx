const sacarEmoticones = (text: string) => {
    return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDDE6-\uDDFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF]|\uD83E[\uDD00-\uDDFF])/g, '');
}

function obtenerIniciales(texto: string): string {
    // Primero, eliminamos los emoticones del texto
    const textoSinEmoticones = sacarEmoticones(texto);

    // Filtramos solo las palabras que comienzan con letras
    const palabras: string[] = textoSinEmoticones.split(' ').filter((palabra: string) => /^[a-zA-Z]/.test(palabra));
    let resultado: string = '';

    palabras.forEach((palabra: string, index) => {
        if (index === 0) {
            resultado += palabra.charAt(0).toLowerCase();
        } else {
            resultado += palabra.charAt(0).toUpperCase();
        }
    });

    return resultado;
}

export { obtenerIniciales };