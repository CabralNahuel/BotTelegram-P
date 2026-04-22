const MensajesMd = require('../models/model.mensajes');
const MenuesMd = require('../models/model.menues');
const TemaMd = require('../models/model.tema');
const { Op } = require('sequelize');

const MAX_MENSAJE_LENGTH = 50000;

function validarLongitudMensaje(mensaje) {
  return (mensaje || "").length <= MAX_MENSAJE_LENGTH;
}


const sacarEmoticones = (text) => {
  return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDDE6-\uDDFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF]|\uD83E[\uDD00-\uDDFF])/g, '');
}

function normalizarComandoTema(raw = '', fallbackTitulo = '') {
  const base = sacarEmoticones(String(raw || fallbackTitulo || ''))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^\/+/, '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .trim();
  return base || 'tema';
}

async function comandoTemaExiste(comando, excludeId = null) {
  const where = {
    [Op.and]: [
      TemaMd.sequelize.where(
        TemaMd.sequelize.fn('LOWER', TemaMd.sequelize.col('comando_tema')),
        comando.toLowerCase(),
      ),
      { eliminado: { [Op.ne]: 1 } },
    ],
  };
  if (excludeId !== null) {
    where[Op.and].push({ id: { [Op.ne]: excludeId } });
  }
  const existe = await TemaMd.findOne({ where });
  return Boolean(existe);
}

const obtenerMenuesConTemas = async (req, res) => {
  const { idMenu } = req.params;

  try {
    if (String(idMenu).toLowerCase() === 'global') {
      const temasGlobales = await TemaMd.findAll({
        where: { idmenu: null, eliminado: 0 },
        order: [['id', 'ASC']],
      });
      const temas = temasGlobales.map((tema) => ({
        id: tema.id,
        idmenu: null,
        titulo: tema.tema,
        comando_tema: tema.comando_tema,
        eliminado: tema.eliminado,
      }));
      return res.json({ idmenu: null, global: true, temas });
    }

    
    const menuConTemas = await MenuesMd.findOne({
      where: { id: idMenu, eliminado: 0 },
      include: { 
        model: TemaMd, 
        as: 'tema',
        where: { eliminado: 0 },
        required: false 
      }
    });

    if (!menuConTemas) {
      return res.status(404).json({ message: 'Menú no encontrado' });
    }

    const temas = menuConTemas.tema.map(tema => ({
      id: tema.id,
      idmenu: menuConTemas.id, // Incluir el id del menú
      titulo: tema.tema,
      comando_tema: tema.comando_tema,
      eliminado: tema.eliminado,
    }));
    return res.json({ idmenu: menuConTemas.id, temas });
  } catch (error) {
    console.error('Error del servidor:', error);
    return res.status(500).json({ message: 'Error del servidor', error });
  }
};

const obtenerMensajesPorTema = async (req, res) => {
  const { id } = req.params;
  try {
    const mensajes = await MensajesMd.findAll({
      where: { idtema: id, eliminado: 0 },
    });
    return res.json({mensajes});
  } catch (error) {
    console.error('Error al obtener mensajes por tema:', error);
    throw new Error('Error al obtener mensajes por tema');
  }
};

    const actualizarTema = async (req, res) => {
      const { id } = req.params;
      const { titulo, comando_tema } = req.body;
      const comandoTemaBase = normalizarComandoTema(comando_tema, titulo);

    
      try {
        const temaActualizado = await TemaMd.findByPk(id);
    
        if (!temaActualizado) {
          return res.status(404).json({ message: 'Tema no encontrado' });
        }
        
        let comandoFinal = comandoTemaBase;
        let sufijo = 1;
        while (await comandoTemaExiste(comandoFinal, Number(id))) {
          comandoFinal = `${comandoTemaBase}_${sufijo}`;
          sufijo += 1;
        }

        temaActualizado.tema = titulo;
        temaActualizado.comando_tema = comandoFinal;
        await temaActualizado.save();
    
        return res.json({ message: 'Tema actualizado correctamente', tema: temaActualizado });
      } catch (error) {
        console.error('Error al actualizar el tema:', error);
        return res.status(500).json({ message: 'Error del servidor', error });
      }
    };

    const eliminarTema = async (req, res) => {
      const { id } = req.params;
      try {
        const tema = await TemaMd.findByPk(id);
        
        if (tema) {
          tema.eliminado = 1;
          await tema.save();
    
          // Marcar todos los mensajes asociados con este tema como eliminados
          await MensajesMd.update(
            { eliminado: 1 }, 
            { where: { idtema: id } }
          );
    
          res.json({ message: 'Tema y sus mensajes asociados marcados como eliminados' });
        } else {
          res.status(404).send('Tema no encontrado');
        }
      } catch (error) {
        console.error('Error al eliminar el tema:', error);
        res.status(500).send('Error del servidor');
      }
    };

    const agregarTema = async (req, res) => {
      let { titulo, comando_tema, idmenu } = req.body;
    
      try {
        const idmenuFinal =
          idmenu === null || idmenu === undefined || String(idmenu).toLowerCase() === 'global'
            ? null
            : Number(idmenu);
        const comandoTemaBase = normalizarComandoTema(comando_tema, titulo);
        let comandoFinal = comandoTemaBase;
        let sufijo = 1;
        while (await comandoTemaExiste(comandoFinal)) {
          comandoFinal = `${comandoTemaBase}_${sufijo}`;
          sufijo += 1;
        }
        // Crear el nuevo tema
        const nuevoTema = await TemaMd.create({ tema: titulo, comando_tema: comandoFinal, idmenu: idmenuFinal, eliminado: 0 });
        res.json(nuevoTema);
      } catch (error) {
        console.error('Error al agregar el nuevo tema:', error);
        res.status(500).send('Error del servidor');
      }
    };
    

    const agregarMensaje = async (req, res) => {
      const {idmensaje} = req.params
      const {  titulo } = req.body;
      const {etiqueta}=req.body;

      const fechaActual = new Date().toISOString().split('T')[0];

  let mensajeFormateado = titulo;

  if (etiqueta?.negrita) {
    mensajeFormateado = `<b>${mensajeFormateado}</b>`;
  }
  if (etiqueta?.cursiva) {
    mensajeFormateado = `<i>${mensajeFormateado}</i>`;
  }
  if (etiqueta?.link) {
    const { href, texto } = etiqueta.link;
    mensajeFormateado = `<a href="https://${href}">${texto}</a>`;
  }
  console.log("SOY EL MENSAJE FORMATEADO",mensajeFormateado)
      try {
        if (!validarLongitudMensaje(mensajeFormateado)) {
          return res.status(400).json({
            message: `El mensaje supera el máximo permitido de ${MAX_MENSAJE_LENGTH} caracteres.`,
            code: "MESSAGE_TOO_LONG",
            maxLength: MAX_MENSAJE_LENGTH,
            currentLength: mensajeFormateado.length,
          });
        }
        const nuevoMensaje = await MensajesMd.create({ idtema:idmensaje,mensaje:mensajeFormateado, eliminado: 0, actualizacion:fechaActual,etiqueta:etiqueta });
        console.log("soy el nuevo mensaje",nuevoMensaje.mensaje)
        res.json(nuevoMensaje);
      } catch (error) {
        console.error('Error al agregar el mensaje:', error);
        res.status(500).send('Error del servidor');
      }
    };
    
    const eliminarMensaje = async (req, res) => {
      const { idmensaje } = req.params;
      try {
        const mensaje = await MensajesMd.findByPk(idmensaje);
        if (mensaje) {
          mensaje.eliminado = 1;
          await mensaje.save();
    
          res.json({ message: 'Mensaje marcado como eliminado' });
        } else {
          res.status(404).send('Mensaje no encontrado');
        }
      } catch (error) {
        console.error('Error al eliminar el mensaje:', error);
        res.status(500).send('Error del servidor');
      }
    };
    const modificarMensaje = async (req, res) => {
      const { idmensaje } = req.params;
      const { titulo, etiqueta } = req.body;
    
      try {
        const mensajeActualizado = await MensajesMd.findByPk(idmensaje);
    
        if (!mensajeActualizado) {
          return res.status(404).json({ message: 'Mensaje no encontrado' });
        }
    
        // Inicializar el mensaje con el título
        let mensajeFormateado = titulo;
    
        // Formatear según las etiquetas
        if (etiqueta?.negrita) {
          mensajeFormateado = `<b>${mensajeFormateado}</b>`;
        }
        if (etiqueta?.cursiva) {
          mensajeFormateado = `<i>${mensajeFormateado}</i>`;
        }
        if (etiqueta?.link) {
          const { href, texto } = etiqueta.link;
          mensajeFormateado = `<a href="https://${href}">${texto}</a>`;
        }
    
        // Este bloque solo eliminará las etiquetas si existen en el mensaje,
        // pero no afectará el contenido del título.
        if (!etiqueta?.negrita) {
          mensajeFormateado = mensajeFormateado.replace(/<\/?b>/g, '');
        }
        if (!etiqueta?.cursiva) {
          mensajeFormateado = mensajeFormateado.replace(/<\/?i>/g, '');
        }
        if (!etiqueta?.link) {
          mensajeFormateado = mensajeFormateado.replace(/<a href="https?:\/\/.*?">/g, '').replace(/<\/a>/g, '');
        }

        if (!validarLongitudMensaje(mensajeFormateado)) {
          return res.status(400).json({
            message: `El mensaje supera el máximo permitido de ${MAX_MENSAJE_LENGTH} caracteres.`,
            code: "MESSAGE_TOO_LONG",
            maxLength: MAX_MENSAJE_LENGTH,
            currentLength: mensajeFormateado.length,
          });
        }
    
        // Actualizar el mensaje y la etiqueta
        mensajeActualizado.mensaje = mensajeFormateado;
        mensajeActualizado.etiqueta = etiqueta;
    
        await mensajeActualizado.save();
    
        return res.json({ message: 'Mensaje actualizado correctamente', mensaje: mensajeActualizado });
      } catch (error) {
        console.error('Error al actualizar el mensaje:', error);
        return res.status(500).json({ message: 'Error del servidor', error });
      }
    };
    

module.exports = {
  obtenerMenuesConTemas,
  actualizarTema,
  eliminarTema,
  agregarTema,
  obtenerMensajesPorTema,
  agregarMensaje,
  eliminarMensaje,
  modificarMensaje
};
