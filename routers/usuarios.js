const {Usuario} = require('../modelos/usuario');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) => {
    const usuarioList = await Usuario.find().select('-passwordHash');;

    if(!usuarioList){
        res.status(500).json({success: false})
    }

    res.send(usuarioList);
})
router.get('/:id', async(req,res)=>{
    const usuario = await Usuario.findById(req.params.id).select('-passwordHash');

    if(!usuario) {
        res.status(500).json({message: 'No se ha encontrado el usuario con el ID indicado.'})
    } 
    res.status(200).send(usuario);
})
 
router.post('/', async (req,res)=>{
    let usuario = new Usuario({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    usuario = await usuario.save();

    if(!usuario)
    return res.status(400).send('No se pudo guardar el usuario!')

    res.send(usuario);
})

router.post('/login', async (req,res) => {
    const usuario = await Usuario.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!usuario) {
        return res.status(400).send('Usuario incorrecto');
    }

    if(usuario && bcrypt.compareSync(req.body.password, usuario.passwordHash)) {
        const token = jwt.sign(
            {
                usuarioId: usuario.id,
                isAdmin: usuario.isAdmin
            },
            secret,
            {expiresIn : '1d'}
        )
       
        res.status(200).send({usuario: usuario.email , token: token}) 
    } else {
       res.status(400).send('la contraseña es incorrecta!');
    }  
})

router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('No se pudo crear el usuario!')

    res.send(user);
})

router.delete('/:id', (req, res)=>{
    Usuario.findByIdAndRemove(req.params.id).then(usuario =>{
        if(usuario) {
            return res.status(200).json({success: true, message: 'El usuario fue borrado!'})
        } else {
            return res.status(404).json({success: false , message: "usuario no encontrado!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get(`/get/count`, async (req, res) =>{
    const usuarioCount = await Usuario.countDocuments((count) => count)

    if(!usuarioCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        usuarioCount: usuarioCount
    });
})
module.exports=router;