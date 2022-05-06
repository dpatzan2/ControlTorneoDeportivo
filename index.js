const mongoose = require('mongoose');
const app = require('./app')
const usuariosControlleri = require('./src/Controllers/usuarios.controller');
const Usuarios = require('./src/models/usuarios.model');
const bcrypt = require('bcrypt-nodejs');


mongoose.Promise = global.Promise;


mongoose.connect('mongodb://localhost:27017/ControlTorneoDeportivo', { useNewUrlParser: true, useUnifiedTopology: true}).then(() =>{
    console.log("Se encuentra conectado a la base de datos");

    app.listen(3000, function() {
        console.log("hola mundo, voy a crear una app que hasta Mark Zuckerbeg me la va a querer comprar")
        usuariosControlleri.crearAdminPorDefecto();
              
    })
}).catch(error => console.log(error))




