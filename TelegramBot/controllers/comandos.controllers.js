const ComandoMd = require("../models/model.comando.js");
const MensajesMd = require("../models/model.mensajes.js");
const temaMd = require("../models/model.tema.js");
const UsuarioMd = require("../models/model.usuario.js");
const BienvenidaMd = require("../models/model.bienvenida.js")
const EstadisticaMd = require("../models/model.estadisticas.js");

const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

function dividirTextoParaTelegram(texto, maxLength = TELEGRAM_MAX_MESSAGE_LENGTH) {
  if (!texto || texto.length <= maxLength) {
    return [texto || ""];
  }

  const partes = [];
  let restante = texto;

  while (restante.length > maxLength) {
    let corte = restante.lastIndexOf("\n\n", maxLength);
    if (corte <= 0) corte = restante.lastIndexOf("\n", maxLength);
    if (corte <= 0) corte = restante.lastIndexOf(" ", maxLength);
    if (corte <= 0) corte = maxLength;

    const chunk = restante.slice(0, corte).trim();
    if (chunk) {
      partes.push(chunk);
    }

    restante = restante.slice(corte).trimStart();
  }

  if (restante) {
    partes.push(restante);
  }

  return partes.length ? partes : [texto.slice(0, maxLength)];
}

async function responderTextoLargo(ctx, texto, opciones = {}) {
  const chunks = dividirTextoParaTelegram(texto);

  for (let i = 0; i < chunks.length; i += 1) {
    const esUltimo = i === chunks.length - 1;
    const opcionesChunk = esUltimo
      ? opciones
      : { ...opciones, reply_markup: undefined };

    await ctx.reply(chunks[i], opcionesChunk);
  }
}



async function mostrarHistorial(usuarioId) {
  try {
    // Buscar al usuario por su ID en la base de datos
    const usuario = await UsuarioMd.findByPk(usuarioId);

    if (usuario) {
      // Si se encuentra el usuario, obtener su historial
      const historial = usuario.historial || [];
      console.log(
        `Historial de navegación del usuario ${usuarioId}:`,
        historial
      );
    } else {
      console.log(`No se encontró historial para el usuario ${usuarioId}`);
    }
  } catch (error) {
    console.error("Error al mostrar el historial:", error);
  }
}

async function setearComandos(bot) {
  try {
    // Obtener todos los comandos de la base de datos
    const commands = await ComandoMd.findAll({
      where: {
        eliminado: 0
      }
    });

    // Configurar cada comando individualmente
    const comandosFormateados = commands.map((command) => {
      let titulo = command.titulo
      titulo= titulo.toLowerCase(); // Convertir a minúsculas para cumplir con los requisitos de Telegram

      // Verificar que el comando cumpla con los requisitos de Telegram
      if (/^[a-z0-9_]{1,32}$/.test(titulo)) {
        return {
          command: titulo,
          description: command.titulo,
        };
      } else {
        console.error(`Comando inválido: ${titulo}`);
        return null;
      }
    }).filter(command => command !== null); // Filtrar comandos inválidos

    if (comandosFormateados.length > 0) {
      console.log(
        "Comandos personalizados configurados con éxito:",
        comandosFormateados
      );
      // Configurar los comandos personalizados
      await bot.api.setMyCommands(comandosFormateados);
      console.log("Comandos configurados correctamente.");
    } else {
      console.error("No hay comandos válidos para configurar.");
    }
  } catch (error) {
    console.error("Error al configurar los comandos personalizados:", error);
  }
}

async function comandoStart(ctx, historialUsuario) {
  {
    try {
      const usuarioId = ctx.from.id;
      // Inicializar el historial de navegación del usuario si no existe
      if (!historialUsuario[usuarioId]) {
        historialUsuario[usuarioId] = [];
      }

      // Reiniciar el historial de navegación
      historialUsuario[usuarioId] = [];
      // Obtener todos los comandos de la base de datos
      const commands = await ComandoMd.findAll({
        where: {
          eliminado: 0
        }
      });

      const bienve = await BienvenidaMd.findAll({
        attributes: ['textoBienvenida']
      });
      let textoBienvenidaEnDb = bienve[0].dataValues.textoBienvenida;

      // Formatear la lista de comandos
      let response = `${textoBienvenidaEnDb}\n`;
      commands.forEach((cmd) => {
        response += `/${cmd.titulo}\n`;
      });

      // Enviar la lista de comandos al chat
      await responderTextoLargo(ctx, response, {
        parse_mode: 'HTML'
      });

      // Mostrar el historial de navegación por consola
      mostrarHistorial(usuarioId, historialUsuario);
    } catch (error) {
      console.error("Error al obtener los comandos:", error);
      await ctx.reply("Ocurrió un error al obtener los comandos.");
    }
  }
}

async function comandosDinamicos(ctx, historialUsuario, comando = "", bot) {
  try {
    const usuarioId = ctx.from.id;
    const comandoObtenido = comando || ctx.message.text;


    const dbCommand = await ComandoMd.findOne({
      where: { titulo: comandoObtenido.slice(1), eliminado: 0 },
    });
    const botones = [
      [
        {
          text: "Volver al menú anterior",
          callback_data: "volver_a_la_opcion_anterior",
        },
      ],
      [{ text: "Ir al menú principal", callback_data: "ir_al_menu" }],
    ];


    if (dbCommand) {
      const opciones = await temaMd.findAll({
        where: { idmenu: dbCommand.id, eliminado: 0 },
      });

      if (opciones.length > 0) {
        let response = `\n <b>Tocá la opción del tema que quieras conocer
</b>\n`;

        for (const opcion of opciones) {
          let opcionTema = opcion.tema;

          response += `${opciones.indexOf(opcion) + 1} ${opcionTema} /${opcion.comando_tema
            } \n\n`;
        }

        response += "\n¿Qué te gustaría hacer a continuación?";

        await responderTextoLargo(ctx, response, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: botones },
        });
        mostrarHistorial(usuarioId, historialUsuario);
        
        await guardarHistorialEnBaseDeDatos(usuarioId, comandoObtenido,false,comandoObtenido.slice(1),"menu",dbCommand.id);
      } else {
        await ctx.reply(`No hay opciones disponibles para ${comandoObtenido}.`);
      }
    } else {
      const dbTema = await temaMd.findOne({
        where: { comando_tema: comandoObtenido.slice(1), eliminado: 0 },
      });
      mostrarHistorial(usuarioId, historialUsuario);
      await guardarHistorialEnBaseDeDatos(usuarioId, comandoObtenido, false, dbTema.tema, "tema",dbTema.idmenu);



      if (dbTema) {
        const dbMensajes = await MensajesMd.findAll({
          where: { idtema: dbTema.id, eliminado: 0 },
        });

        let response = "";
        

        if (dbMensajes.length === 0) {
          response = "no hay datos cargados";
        } else {
          for (const mensaje of dbMensajes) {
            response += `${mensaje.mensaje}\n\n`;
          }
        }

        await responderTextoLargo(ctx, response, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: botones
          }
        });

      }

    }


   
  } catch (error) {
    console.error("Error en la búsqueda de comandos dinámicos:", error);
    await ctx.reply("Ocurrió un error en la búsqueda de comandos dinámicos.");
  }
}

async function manejarLlamada(ctx, historialUsuario, bot) {
  const data = ctx.callbackQuery.data;
  const chatId = ctx.callbackQuery.message.chat.id;
  const messageId = ctx.callbackQuery.message.message_id;
  const usuarioId = ctx.from.id;

  // Obtener el historial de navegación del usuario
  let historial = historialUsuario || [];

  if (data === "volver_a_la_opcion_anterior") {
    // Eliminar la respuesta actual
    if (historial.length > 0) {
      const previousCommand = historial[historial.length - 2]; // Obtener el anteúltimo comando del historial
      if (previousCommand) {
        // Ejecutar el comando automáticamente

        await comandosDinamicos(ctx, historialUsuario, previousCommand);
        if (messageId) {
          await bot.api.deleteMessage(chatId, messageId).catch((error) => {
            console.error("Error al eliminar el mensaje:", error);
          });
        }
      } else {
        console.error("No hay menú anterior en el historial.");
        await comandoStart(ctx, historialUsuario);
      }
    } else {
      console.error("No hay elementos en el historial para retroceder.");
      await comandoStart(ctx, historialUsuario);
    }
  } else if (data === "ir_al_menu") {
    // Ir al menú principal (comando /start)
    await comandoStart(ctx, historialUsuario);

    // Eliminar la respuesta actual si existe
    if (messageId) {
      await bot.api.deleteMessage(chatId, messageId).catch((error) => {
        console.error("Error al eliminar el mensaje:", error);
      });
    }
  }
  await guardarHistorialEnBaseDeDatos(usuarioId, historialUsuario[usuarioId], true);
  mostrarHistorial(usuarioId, historialUsuario);
}



async function guardarHistorialEnBaseDeDatos(usuarioId, comandoParaAgregar, retroceso, textoTemaOMenu = "", tema_menu = "",idmenu = "") {

  function mayusculaLaPrimeraLetra(text) {
    return text.replace(/(^|\s)\S/g, (match) => match.toUpperCase());
  }
   
  try { 
    // Buscar al usuario por su ID en la base de datos
    const usuario = await UsuarioMd.findByPk(usuarioId);
    
    if (!usuario) {
      console.log(`No se encontró usuario con ID ${usuarioId}`);
      return
    }
    // Obtener el historial actual del usuario
    let historialActual = usuario.historial || [];
    if (comandoParaAgregar && comandoParaAgregar != "") {
      
      await EstadisticaMd.create({
        usuarioId: usuarioId,
        comando: comandoParaAgregar,
        texto:mayusculaLaPrimeraLetra(textoTemaOMenu),
        fecha_de_creacion: new Date(),
      });


      const historialActualizado = [...historialActual, comandoParaAgregar];
      await usuario.update({ historial: historialActualizado });
      console.log("Historial actual:", usuario.historial);

    }

    else if (retroceso && historialActual.length > 1) {
      historialActual = historialActual.slice(0, -2);
      await usuario.update({ historial: historialActual });
      console.log("Historial actual:", usuario.historial);

    } else if (retroceso && historialActual.length > 1) {
    }

    else {
      historialActual = [];
      await usuario.update({ historial: historialActual });
      console.log("no hay Historial al cual retroceder");
    }



  } catch (error) {
    console.error("Error al guardar el historial en la base de datos:", error);
  }
}

module.exports = {
  setearComandos,
  comandoStart,
  comandosDinamicos,
  manejarLlamada,
};
