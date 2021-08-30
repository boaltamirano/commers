const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
require('dotenv/config');

app.use(cors());
app.options('*', cors());

//middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());

app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

//Routers

const categoriasRoutes = require('./routers/categorias');
const productosRoutes = require('./routers/productos');
const usuariosRoutes = require('./routers/usuarios');
const pedidosRoutes = require('./routers/pedidos');

const api = process.env.API_URL;

app.use(`${api}/categorias`, categoriasRoutes);
app.use(`${api}/productos`, productosRoutes);
app.use(`${api}/usuarios`, usuariosRoutes);
app.use(`${api}/pedidos`, pedidosRoutes);

//const Producto = require('./modelos/producto');

//Base de Datos
mongoose.connect(process.env.CONEXION_BD, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'E-Commers'
})
.then(() => {
    console.log('Conexion exitosa!!')
})
.catch((err) => {
    console.log(err)
})

//servidor
app.listen(3000, ()=>{
    console.log('server is runing http://localhost:3000');
})