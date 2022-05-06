const Ligas = require('../models/ligas.model');

function listarLigas(req, res) {
    if (req.user.rol == 'Usuario') return res.status(500).send({ message: 'No tienes acceso a esta informacion' });

    Ligas.find((err, listaLigas) => {
        if (err) return res.status(500).send({ message: 'error al listar' });
        if (!listaLigas) return res.status(500).send({ message: 'No hay ligas aun' });

        return res.status(200).send({ Ligas: listaLigas });
    });
}


function listarrLigasIdCreador(req, res) {
    if (req.user.rol == 'Usuario') {
        Ligas.find({ UsuarioCreador: req.user.sub }, (err, listaLigasId) => {
            if (err) return res.status(500).send({ message: 'error al listar' });
            if (!listaLigasId) return res.status(500).send({ message: 'No hay ligas aun' });

            return res.status(200).send({ Ligas: listaLigasId });
        });
    } else if (req.user.rol == 'ADMIN') {
        Ligas.findById({ _id: req.params.idLiga }, (err, listaLigasId) => {
            if (err) return res.status(500).send({ message: 'error al listar' });
            if (!listaLigasId) return res.status(500).send({ message: 'No hay ligas aun' });

            return res.status(200).send({ Ligas: listaLigasId });
        });
    }
}


function crearLigaNueva(req, res) {
    var parametros = req.body;
    var ligaModel = new Ligas();
    var UsuarioCreador;

    if (parametros.nombreLiga) {
        ligaModel.nombreLiga = parametros.nombreLiga;
        if (req.user.rol == 'Usuario') {
            UsuarioCreador = req.user.sub;
            ligaModel.UsuarioCreador = req.user.sub;
        } else if (req.user.rol == 'ADMIN') {
            if (req.params.UsuarioCreador == null) {
                return res.status(500).send({ message: 'No ha enviado el id del usuario' })
            } else {
                UsuarioCreador = req.params.UsuarioCreador
                ligaModel.UsuarioCreador = UsuarioCreador;
            }

        }


        Ligas.find({ nombreLiga: parametros.nombreLiga, UsuarioCreador: UsuarioCreador }, (err, ligaEncontrada) => {
            if (ligaEncontrada == 0) {
                ligaModel.save((err, ligaGuardada) => {
                    if (err) return res.status(500).send({ message: 'Ocurrio un error al guardar la ligaGuardada.' });
                    if (!ligaGuardada) return res.status(500).send({ message: 'No se pudo guardar la ligaGuardada.' });

                    return res.status(200).send({ Liga: ligaGuardada })
                });
            } else {
                return res.status(500).send({ message: 'Ya has creado una liga con este nombre' })
            }
        });
    } else {
        return res.status(500).send({ message: 'llene los campos' })
    }
}



function editarLiga(req, res) {
    var parametros = req.body;
    var liga = req.params.idLiga;



    if (parametros.nombreLiga) {
        if (req.user.rol == 'Usuario') {
            Ligas.findOne({ nombreLiga: parametros.nombreLiga, UsuarioCreador: req.user.sub }, (err, ligaEncotradas) => {
                if (ligaEncotradas != null && parametros.nombreLiga != ligaEncotradas.nombreLiga) {
                    return res.status(500).send({ message: 'Ya  has creado una liga con este nombre, prueba con  otro' });
                } else {
                    Ligas.findByIdAndUpdate({ _id: liga, UsuarioCreador: req.user.sub }, parametros, { new: true }, (err, ligaEditada) => {
                        if (err) return res.status(500).send({ message: 'Ocurrio un error al tratar de editar la liga' });
                        if (!ligaEditada) return res.status(500).send({ message: 'No se pudo editar los datos' });

                        return res.status(200).send({ ligaEditada: ligaEditada })
                    })

                }
            });
        } else if (req.user.rol == 'ADMIN') {
            Ligas.findOne({ nombreLiga: parametros.nombreLiga }, (err, ligaEncotradas) => {
                if (ligaEncotradas == null && liga == ligaEncotradas._id) {
                    Ligas.findByIdAndUpdate({ _id: liga }, parametros, { new: true }, (err, ligaEditada) => {
                        if (err) return res.status(500).send({ message: 'Ocurrio un error al tratar de editar la liga' });
                        if (!ligaEditada) return res.status(500).send({ message: 'No se pudo editar los datos' });

                        return res.status(200).send({ ligaEditada: ligaEditada })
                    })
                } else {
                    return res.status(500).send({ message: 'Ya  has creado una liga con este nombre, prueba con  otro' });
                }
            });
        }


    } else {
        return res.status(500).send({ message: 'Debe llenar los campos correspondientes' });
    }
}



function eliminarLiga(req, res) {
    var liga = req.params.idLiga;
    if (req.user.rol == 'Usuario') {
        Ligas.findByIdAndDelete({ _id: liga, UsuarioCreador: req.user.sub }, (err, ligaEliminada) => {
            if (err) return res.status(500).send({ message: 'Ocurrio un error al tratar de eliminar la liga' });
            if (!ligaEliminada) return res.status(500).send({ message: 'No se pudo eliminar los datos' });

            return res.status(200).send({ ligaEliminada: ligaEliminada })
        })
    } else if (req.user.rol == 'ADMIN') {
        Ligas.findByIdAndDelete({ _id: liga }, (err, ligaEliminada) => {
            if (err) return res.status(500).send({ message: 'Ocurrio un error al tratar de eliminar la liga' });
            if (!ligaEliminada) return res.status(500).send({ message: 'No se pudo eliminar los datos' });

            return res.status(200).send({ ligaEliminada: ligaEliminada })
        })
    }
}


module.exports = {
    listarLigas,
    listarrLigasIdCreador,
    crearLigaNueva,
    editarLiga,
    eliminarLiga
}