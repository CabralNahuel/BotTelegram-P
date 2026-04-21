const OpcionesMd = require("../models/model.tema");

async function buscarComandoPorTema(comandoTema) {
  try {
    // Buscar el comando en la base de datos
    const comandoEncontrado = await OpcionesMd.findOne({
      where: { comando_tema: comandoTema }
    });

    if (comandoEncontrado) {
      console.log("Comando tema encontrado:", comandoEncontrado.comando_tema);
    } else {
      console.log(`No se encontró ningún comando para ${comandoTema}.`);
    }
  } catch (error) {
    console.error("Error al buscar comando por tema:", error);
  }
}

module.exports = { buscarComandoPorTema };
