const Usuarios = require('../models/usuarios.model');

const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const fs = require('fs');
//METODO PARA OBTNER TODA LA LISTA DE USUARIOS (ADMINISTRADORES Y CLIENTES)

function crearAdminPorDefecto() {
    var usuarioModelo = new Usuarios();
    Usuarios.findOne({ usuario: 'ADMIN' }, (err, usuarioEncontrado) => {

        if (!usuarioEncontrado) {
            usuarioModelo.usuario = 'ADMIN'
            usuarioModelo.nombre = 'ADMIN'
            usuarioModelo.rol = 'ADMIN'
            usuarioModelo.imagen = null

            bcrypt.hash('deportes123', null, null, (err, passwordEncriptada) => {
                usuarioModelo.password = passwordEncriptada
                usuarioModelo.save(() => {

                })
            })
        } else {
            console.log('no me cree')
        }
    })
}



function ObtenerUsuarios(req, res) {

    if (req.user.rol == 'Usuario') {
        return res.status(500).send({ mensaje: 'No tienes acceso a esta informacion' })
    } else {
        Usuarios.find((err, usuariosObtenidos) => {
            if (err) return res.send({ mensaje: "error:" + err })
            if (!usuariosObtenidos) return res.status(500).send({ mensaje: 'No hay usuarios en la base de datos' });

            return res.send({ usuarios: usuariosObtenidos })
        })
    }
}


//METODO PARA AGREGAR CLIENTES

function RegistrarClientes(req, res) {
    var parametros = req.body;
    var usuarioModelo = new Usuarios();

    if (parametros.nombre && parametros.usuario && parametros.password) {
        usuarioModelo.nombre = parametros.nombre;
        usuarioModelo.usuario = parametros.usuario;
        usuarioModelo.rol = 'Usuario';
        if (parametros.rol == 'Usuario') return res.status(500).send({ mensaje: 'No puedes elegir el rol, siempre sera "Usuario"' });
        Usuarios.find({ usuario: parametros.usuario }, (err, usuarioEcontrado) => {
            if (usuarioEcontrado == 0) {

                bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                    usuarioModelo.password = passwordEncriptada;

                    usuarioModelo.save((err, usuarioGuardado) => {
                        if (err) return res.status(500).send({ message: 'Error en la peticion' });
                        if (!usuarioGuardado) return res.status(404).send({ message: 'No se encontraron usuarios' });

                        return res.status(200).send({ usuario: usuarioGuardado });
                    });
                });
            } else {
                return res.status(500).send({ mensaje: 'Este usuario ya esta siendo utilizado, pruebe usando otro' });
            }

        })
    } else {
        return res.status(500).send({ mensaje: 'Llene todos los campos requeridos' });
    }

}

//METODO PARA PODER AGREGAR ADMINISTRADORES

function RegistrarAdministradores(req, res) {
    var parametros = req.body;
    var usuarioModelo = new Usuarios();

    console.log(req.user.rol)
    if (req.user.rol == 'Usuario' || req.user.rol == 'ADMIN') {
        return res.status(500).send({ mensaje: 'No tienes permisos para realizar esta accion' });
    } else {
        if (parametros.nombre && parametros.apellido && parametros.usuario && parametros.password) {
            usuarioModelo.nombre = parametros.nombre;
            usuarioModelo.apellido = parametros.apellido;
            usuarioModelo.usuario = parametros.usuario;
            usuarioModelo.rol = 'ADMIN';
            // if(parametros.rol != 'ROL_ALUMNO' || parametros.rol == '') return res.status(500).send({mensaje: 'No puedes elegir el rol, siempre sera "alumno"'});
            Usuarios.find({ usuario: parametros.usuario }, (err, usuarioEcontrado) => {
                if (usuarioEcontrado == 0) {

                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModelo.password = passwordEncriptada;

                        usuarioModelo.save((err, usuarioGuardado) => {
                            if (err) return res.status(500).send({ message: 'Error en la peticion' });
                            if (!usuarioGuardado) return res.status(404).send({ message: 'No se encontraron usuarios' });

                            return res.status(200).send({ usuario: usuarioGuardado });
                        });
                    });
                } else {
                    return res.status(500).send({ mensaje: 'Este usuario ya esta siendo utilizado, pruebe usando otro' });
                }

            })
        } else {
            return res.status(500).send({ mensaje: 'llene los campos' })
        }
    }
}


//METODO PARA PODER INICIAR SESION
function Login(req, res) {
    var parametros = req.body;
    Usuarios.findOne({ usuario: parametros.usuario }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (usuarioEncontrado) {
            // COMPARO CONTRASENA SIN ENCRIPTAR CON LA ENCRIPTADA
            bcrypt.compare(parametros.password, usuarioEncontrado.password,
                (err, verificacionPassword) => {//TRUE OR FALSE
                    // VERIFICO SI EL PASSWORD COINCIDE EN BASE DE DATOS
                    if (verificacionPassword) {
                        // SI EL PARAMETRO OBTENERTOKEN ES TRUE, CREA EL TOKEN
                        if (parametros.obtenerToken === 'true') {
                            return res.status(200)
                                .send({ token: jwt.crearToken(usuarioEncontrado) })
                        } else {
                            usuarioEncontrado.password = undefined;
                            return res.status(200)
                                .send({ usuario: usuarioEncontrado })
                        }


                    } else {
                        return res.status(500)
                            .send({ mensaje: 'Las contrasena no coincide' });
                    }
                })

        } else {
            return res.status(500)
                .send({ mensaje: 'Error, el correo no se encuentra registrado.' })
        }
    })
}


//METODO PARA PODER MODIFICAR USUARIOS (ADMNISTRADORES Y CLIENTES)

function EditarUsuarios(req, res) {
    var idUsu = req.params.idUsuario;
    var parametros = req.body;

    if (req.user.rol == 'Usuario') {
        if (parametros.rol) {
            return res.status(500).send({ message: 'No puedes modificar tu rol' })
        } else {
            Usuarios.findByIdAndUpdate({ _id: req.user.sub }, parametros, { new: true }, (err, usuarioActualizado) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion' });
                if (!usuarioActualizado) return res.status(404).send({ message: 'No se encontraron usuarios' });

                return res.status(200).send({ usuario: usuarioActualizado });
            });
        }

    } else {
        Usuarios.findById(idUsu, (err, usuarioEcontrado) => {
            if (err) return res.status(500).send({ message: 'Ocurrio un error en la peticion de usuario' });
            if (!usuarioEcontrado) return res.status(500).send({ message: 'Este usuaio no existe' });

            if (usuarioEcontrado.rol == 'ADMIN') {
                return res.status(500).send({ message: 'No puedes editar a otros administradores' })
            } else {
                Usuarios.findByIdAndUpdate({ _id: idUsu }, parametros, { new: true }, (err, usuarioActualizado) => {
                    if (err) return res.status(500).send({ message: 'Error en la peticion' });
                    if (!usuarioActualizado) return res.status(404).send({ message: 'No puedes modificar a otro admnistrador' });

                    return res.status(200).send({ usuarios: usuarioActualizado });
                });
            }
        })

    }

}


//METODO PARA ELIMINAR USUARIOS (ADMINISTRADORES Y CLIENTES)
function EliminarUsuarios(req, res) {
    var idUsu = req.params.idUsuario;

    if (req.user.rol == 'Usuario') {
        Usuarios.findByIdAndDelete({ _id: req.user.sub }, { new: true }, (err, usuarioEliminado) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion' });
            if (!usuarioEliminado) return res.status(404).send({ message: 'No se encontraron usuarios' });

            return res.status(200).send({ usuario: usuarioEliminado });
        })
    } else if (req.user.rol == 'ADMIN') {
        Usuarios.findById(idUsu, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion' });
            if (!usuarioEncontrado) return res.status(404).send({ message: 'No se encontraron usuarios' });

            if (idUsu == req.user.sub) {
                Usuarios.findByIdAndDelete(idUsu, { new: true }, (err, usuarioEliminado) => {
                    if (err) return res.status(500).send({ message: 'Error en la peticion' });
                    if (!usuarioEliminado) return res.status(404).send({ message: 'No se encontraron usuarios' });

                    return res.status(200).send({ usuarios: usuarioEliminado });
                })
            } else {
                if (usuarioEncontrado.rol == 'ADMIN') {
                    return res.status(500).send({ mensaje: 'No puedes eliminar a otro administrador' });
                } else {
                    Usuarios.findByIdAndDelete(idUsu, { new: true }, (err, usuarioEliminado) => {
                        if (err) return res.status(500).send({ message: 'Error en la peticion' });
                        if (!usuarioEliminado) return res.status(404).send({ message: 'No se encontraron usuarios' });

                        return res.status(200).send({ usuarios: usuarioEliminado });
                    })
                }
            }


        })
    } else {
        return res.status(500).send({ mensaje: 'error' })
    }


}

//METODO PARA FILTRAR POR NOMBRE

function BuscarUsuarios(req, res) {
    var busqueda = req.params.dBusqueda;

    Usuarios.find({ usuario: { $regex: busqueda, $options: 'i' } }, (err, usuarioEcontrado) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        if (!usuarioEcontrado) return res.status(404).send({ message: 'No se encontraron usuarios' });

        return res.status(200).send({ usuarios: usuarioEcontrado });
    })


}

//METODO PARA BUSCAR POR APELLIDO

function BuscarUsuariosA(req, res) {
    var busqueda = req.params.dBusqueda;

    Usuarios.find({ apellido: { $regex: busqueda, $options: 'i' } }, (err, usuarioEcontrado) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        if (!usuarioEcontrado) return res.status(404).send({ message: 'No se encontraron usuarios' });

        return res.status(200).send({ usuarios: usuarioEcontrado });
    })


}


//METODO PARA BUSCAR POR ROL
function BuscarUsuariosR(req, res) {
    var busqueda = req.params.dBusqueda;

    Usuarios.find({ rol: { $regex: busqueda, $options: 'i' } }, (err, usuarioEcontrado) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        if (!usuarioEcontrado) return res.status(404).send({ message: 'No se encontraron usuarios' });

        return res.status(200).send({ usuarios: usuarioEcontrado });
    })


}

//METODO PARA BUSCAR POR NOMBRE
function BuscarUsuariosId(req, res) {
    var idUsu = req.params.idUsuario;

    Usuarios.findById(idUsu, (err, usuarioEcontrado) => {

        if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
        if (!usuarioEcontrado) return res.status(404).send({ mensaje: 'Error al obtener los datos' });

        return res.status(200).send({ usuarios: usuarioEcontrado });
    })
}

module.exports = {
    ObtenerUsuarios,
    RegistrarClientes,
    RegistrarAdministradores,
    EditarUsuarios,
    EliminarUsuarios,
    BuscarUsuarios,
    BuscarUsuariosA,
    BuscarUsuariosR,
    BuscarUsuariosId,
    Login,
    crearAdminPorDefecto
}