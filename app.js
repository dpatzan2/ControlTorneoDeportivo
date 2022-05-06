//importaciones
const express =require('express');
const cors = require('cors');
var app = express();

//importaciones rutas
const UsuariosRutas = require('./src/routes/usuarios.routes');
const LigasRoutes = require('./src/routes/ligas.routes');
const EquiposRoutes = require('./src/routes/equipos.routes');
const JornadasRoutes = require('./src/routes/jornadas.routes');
const PartidosRoutes = require('./src/routes/partidos.routes')

//middleware

app.use(express.urlencoded({extended: false}));
app.use(express.json());

//cabecera
app.use(cors());

//carga de rutas

app.use('/api', UsuariosRutas, LigasRoutes, EquiposRoutes, JornadasRoutes, PartidosRoutes);



module.exports = app;

