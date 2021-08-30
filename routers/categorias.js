const {Categoria} = require('../modelos/categoria');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const categoriaList = await Categoria.find();

    if(!categoriaList){
        res.status(500).json({success: false})
    }

    res.status(500).send(categoriaList);
})

router.post('/', async (req, res) => {
    let categoria = new Categoria({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    })
    categoria = await categoria.save();

    if(!categoria)
    return res.status(404).send('La categoria no se pudo crear!')

    res.send(categoria);
})

router.put('/:id', async(req, res)=>{
    const categoria = await Categoria.findByIdAndUpdate(
        req.params.id,{
            name: req.body.name,
            icon: req.body.icon, 
            color: req.body.color,
        },
        {new: true}
    )
    if(!categoria)
    return res.status(404).send('La categoria no se pudo actualizar!')

    res.send(categoria);
})

router.delete('/:id', (req, res) => {
    Categoria.findByIdAndRemove(req.params.id).then(categoria => {
        if(categoria){
            return res.status(200).json({success: true, message:'la categoria fue borrada!'})
        }else{
            return res.status(404).json({success: false, message:'la categoria no funciona!'})
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err})
    })
})

module.exports=router;