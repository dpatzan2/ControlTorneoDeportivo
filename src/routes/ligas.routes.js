const express = require('express');
const ligasController = require('../Controllers/ligas.controller');
const md_autenticacion = require('../middlewares/autenticacion');


var api = express.Router();

//rutas para Usuarios
api.get('/ligas', md_autenticacion.Auth,ligasController.listarLigas);
api.get('/ligasId/:idLiga?', md_autenticacion.Auth,ligasController.listarrLigasIdCreador);
api.post('/crearLiga/:UsuarioCreador?', md_autenticacion.Auth, ligasController.crearLigaNueva);
api.put('/editarLiga/:idLiga?', md_autenticacion.Auth, ligasController.editarLiga)
api.delete('/eliminarLiga/:idLiga?', md_autenticacion.Auth, ligasController.eliminarLiga)

module.exports = api;