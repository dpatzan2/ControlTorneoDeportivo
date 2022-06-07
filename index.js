const mongoose = require('mongoose');
const app = require('./app')
const usuariosControlleri = require('./src/Controllers/usuarios.controller');
const Usuarios = require('./src/models/usuarios.model');
const bcrypt = require('bcrypt-nodejs');


mongoose.Promise = global.Promise;


mongoose.connect('mongodb+srv://dpatzan:YPsg2W84@cluster0.30co9.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true}).then(() =>{
    console.log("Se encuentra conectado a la base de datos");

    const port = process.env.PORT

    app.listen(process.env.PORT || 3000, function() {
        console.log(port)
        usuariosControlleri.crearAdminPorDefecto();
              
    })
}).catch(error => console.log(error))
   



