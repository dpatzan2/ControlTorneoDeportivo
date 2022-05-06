const express = require('express');
const equiposController = require('../Controllers/equipo.controller');
const md_autenticacion = require('../middlewares/autenticacion');


var api = express.Router();

//rutas para Usuarios
api.get('/listaEquipos/:idLiga?/:idCreador?', md_autenticacion.Auth, equiposController.listarEquiposLiga);
api.get('/listaEquipospdf/:idLiga?/:idCreador?', md_autenticacion.Auth, equiposController.listarEquiposLigaPDF);
api.post('/crearEquipo/:idLiga?/:idCreador?', md_autenticacion.Auth, equiposController.crearEquipo);
api.put('/editarEquipo/:idLiga?/:idEquipo?/:idCreador?', md_autenticacion.Auth, equiposController.editarEquipo);
api.delete('/eliminarEquipo/:idLiga?/:idEquipo?/:idCreador?', md_autenticacion.Auth, equiposController.eliminarEquipos);

module.exports = api;