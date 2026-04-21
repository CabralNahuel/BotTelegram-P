const { Router } = require('express');
const { obtenerMenuesConTemas, actualizarTema, eliminarTema, agregarTema, obtenerMensajesPorTema, agregarMensaje, eliminarMensaje,modificarMensaje } = require('../controllers/menu.controlador');

const router = Router();

router.get('/temas/:idMenu', obtenerMenuesConTemas);
router.get('/temas/:tema/:id', obtenerMensajesPorTema);
router.post('/tema/', agregarTema);

router.put('/temas/:item/:id', actualizarTema);
router.delete('/temas/:titulo/:id', eliminarTema); 

router.post('/temas/:tema/:idtema/:idmensaje', agregarMensaje);
router.delete('/temas/:tema/:idtema/:idmensaje', eliminarMensaje);
router.put('/temas/:tema/:idtema/:idmensaje', modificarMensaje);

module.exports = router;
