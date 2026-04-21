const express = require('express');
const jwt = require('jsonwebtoken');
const UsuarioMd = require('../models/model.usuario');
const BienvenidaMd = require('../models/model.bienvenida');
const TokenMd = require('../models/model.token');
const MenuesMd = require('../models/model.menues');
const TemaMd = require('../models/model.tema'); // Asegúrate de importar correctamente el modelo TemaMd
const { QueryTypes } = require('sequelize');
const EstadisticaMd = require('../models/model.estadisticas');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

function eliminarAcentos(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


// Ruta para autenticar usuario y generar token JWT
router.post('/login', async (req, res) => {
  const { usuario, contraseña } = req.body;
  console.log('Recibiendo solicitud con usuario:', usuario);

  try {
    const user = await UsuarioMd.findOne({ where: { username: usuario } });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const validContraseña = (contraseña === user.password);

    if (!validContraseña) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    await user.update({ token });

    // Enviar token al cliente
    return res.json({ message: 'Autenticación exitosa', token });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para actualizar el texto de bienvenida
router.put('/home/bienvenida', async (req, res) => {
  const { textoBienvenida } = req.body;

  try {
    let bienvenida = await BienvenidaMd.findOne();

    if (!bienvenida) {
      bienvenida = await BienvenidaMd.create({ textoBienvenida });
    } else {
      bienvenida.textoBienvenida = textoBienvenida;
      await bienvenida.save();
    }

    return res.json({ message: 'Texto de bienvenida actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar bienvenida:', error);
    return res.status(500).json({ message: 'Error del servidor', error });
  }
});

// Ruta para obtener el texto de bienvenida
router.get('/home/bienvenida', async (req, res) => {
  try {
    const bienvenida = await BienvenidaMd.findOne();

    if (!bienvenida) {
      return res.status(404).json({ message: 'No se encontró el texto de bienvenida' });
    }

    return res.json(bienvenida);
  } catch (error) {
    console.error('Error al obtener bienvenida:', error);
    return res.status(500).json({ message: 'Error del servidor', error });
  }
});

// Ruta para obtener el token
router.get('/home/token', async (req, res) => {
  try {
    const token = await TokenMd.findOne();

    if (!token) {
      return res.status(404).json({ message: 'No se encontró el token' });
    }

    return res.json({ id: token.id, token: token.token });
  } catch (error) {
    console.error('Error al obtener token:', error);
    return res.status(500).json({ message: 'Error del servidor', error });
  }
});

// Ruta para actualizar el token
router.put('/home/token', async (req, res) => {
  const { token } = req.body;

  try {
    let tokenRow = await TokenMd.findOne();

    if (!tokenRow) {
      tokenRow = await TokenMd.create({ token });
    } else {
      tokenRow.token = token;
      await tokenRow.save();
    }

    return res.json({ message: 'Token actualizado correctamente', token: tokenRow.token });
  } catch (error) {
    console.error('Error al actualizar token:', error);
    return res.status(500).json({ message: 'Error del servidor', error });
  }
});

// Ruta para actualizar un menú por su ID
router.put('/home/menues/:id', async (req, res) => {
  const { id } = req.params;
  const { eliminado, titulo } = req.body;
  

  try {
    let menuRow = await MenuesMd.findByPk(id);

    if (!menuRow) {
      return res.status(404).json({ message: 'Menú no encontrado' });
    }

    // Actualizar el menú con las propiedades proporcionadas
    if (titulo) menuRow.titulo = eliminarAcentos(titulo).replace(/\s+/g, "");
   
    if (eliminado !== undefined) menuRow.eliminado = eliminado;
       // Si se proporciona el campo eliminado y es distinto del valor actual
       if (eliminado !== undefined) {
        menuRow.eliminado = eliminado;
  
        // Si el menú se marca como eliminado, marcar también los temas asociados
        if (eliminado === 1) {
          await TemaMd.update(
            { eliminado: 1 },
            { where: { idmenu: id } } // Actualiza todos los temas asociados al menú
          );
        } else {
          // Si el menú se reactiva (eliminado = 0), puedes decidir si también reactivar los temas
          await TemaMd.update(
            { eliminado: 0 },
            { where: { idmenu: id } } // Reactiva todos los temas asociados al menú si es necesario
          );
        }
      }

    await menuRow.save();
    return res.json({ message: 'Menú actualizado correctamente', menu: menuRow });
  } catch (error) {
    console.error('Error al actualizar menú:', error);
    return res.status(500).json({ message: 'Error del servidor', error });
  }
});

// Ruta para obtener todos los menús activos con temas asociados
router.get('/home/menues', async (req, res) => {
  try {
    const menuesConTemas = await MenuesMd.findAll({
      where: { eliminado: 0 },
      include: { model: TemaMd, as: 'tema' },
    });


    const formateoMenu = menuesConTemas.map(menu => {

      const temas = menu.tema ? menu.tema.map(tema => ({
        id: tema.id,
        titulo: tema.tema,
        comando_tema: tema.comando_tema
      })) : [];
      
      return {
        id: menu.id,
        titulo: menu.titulo,
        eliminado: menu.eliminado,
        temas: temas
      };
    });


    return res.json(formateoMenu);
  } catch (error) {
    return res.status(500).json({ message: 'Error del servidor', error });
  }
});


// Ruta para crear un nuevo menú
router.post('/home/menues', async (req, res) => {
  let { titulo } = req.body; 
  //recibo el titulo como lo envie el front y lo adapto a los requisitos de telegram
  titulo = eliminarAcentos(titulo).replace(/\s+/g, ""); 
  try {
    const nuevoMenu = await MenuesMd.create({ titulo, eliminado: false });

    return res.json({ message: 'Menú creado correctamente', menu: nuevoMenu });
  } catch (error) {
    console.error('Error al crear menú:', error);
    return res.status(500).json({ message: 'Error del servidor', error });
  }
});

router.get('/usuarios/cantidad', async (req, res) => {
  try {
    // Obtener la cantidad total de usuarios
    const cantidadUsuarios = await UsuarioMd.count();

    return res.json({ cantidad: cantidadUsuarios });
  } catch (error) {
    console.error('Error al obtener la cantidad de usuarios:', error);
    return res.status(500).json({ message: 'Error del servidor', error });
  }
});
/** Nombre de la columna DATE en la tabla `estadisticas` (ver SHOW COLUMNS). */
function nombreColumnaFechaEstadisticas() {
  const c = (process.env.ESTADISTICAS_FECHA_COLUMN || 'fecha_de_creacion').trim();
  return /^[a-zA-Z0-9_]+$/.test(c) ? c : 'fecha_de_creacion';
}

/**
 * Agregado por `texto`. Con `desde` y `hasta` (YYYY-MM-DD) filtra por la columna de fecha en BD.
 */
async function obtenerEstadisticasAgregadas(req, res) {
  try {
    const { desde, hasta } = req.query;
    const desdeStr = typeof desde === 'string' ? desde.trim() : '';
    const hastaStr = typeof hasta === 'string' ? hasta.trim() : '';

    const colFecha = nombreColumnaFechaEstadisticas();

    let sql = `
      SELECT \`texto\`, COUNT(*) AS \`visualizaciones\`
      FROM \`estadisticas\`
    `;
    const replacements = {};

    if (desdeStr && hastaStr) {
      const inicio = new Date(`${desdeStr}T00:00:00.000Z`);
      const fin = new Date(`${hastaStr}T23:59:59.999Z`);
      if (!Number.isNaN(inicio.getTime()) && !Number.isNaN(fin.getTime())) {
        const t0 = inicio <= fin ? inicio : fin;
        const t1 = inicio <= fin ? fin : inicio;
        sql += ` WHERE \`${colFecha}\` >= :desde AND \`${colFecha}\` <= :hasta `;
        replacements.desde = t0;
        replacements.hasta = t1;
      }
    }

    sql += ' GROUP BY `texto` ORDER BY `visualizaciones` DESC';

    const estadisticas = await EstadisticaMd.sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({ message: 'Error del servidor', error });
  }
}

router.get('/estadisticas', obtenerEstadisticasAgregadas);
router.get('/estadisticas/', obtenerEstadisticasAgregadas);







module.exports = router;
