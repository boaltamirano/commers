const {Producto}= require('../modelos/producto');
const express = require('express');
const router = express.Router();
const { Categoria } = require('../modelos/categoria');
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Tipo de imagen invalido');

        if(isValid) {
            uploadError = null;
        }
      cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
       const fileName = file.originalname.split(' ').join('-');
       const extension = FILE_TYPE_MAP[file.mimetype];
       cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
  });
  
  const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {

    let filter = {};

    if(req.query.categorias){
        filter = {categoria: req.query.categorias.split(',')}
    }

    const productoList = await Producto.find(filter).populate('categoria');

    if(!productoList){
        res.status(500).json({success: false})
    }

    res.send(productoList);
})

router.get(`/:id`, async (req, res) => {
    const producto = await Producto.findById(req.params.id).populate('categoria');

    if(!producto){
        res.status(500).json({success: false})
    }

    res.send(producto);
})


router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const categoria = await Categoria.findById(req.body.categoria);
    if(!categoria) return res.status(400).send('Categoria invalida');
    
    const file = req.file;
    if(!file) return res.status(400).send('Ingrese una imagen');
    
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let producto = new Producto({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, 
        brand: req.body.brand,
        price: req.body.price,
        categoria: req.body.categoria,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    producto = await producto.save();

    if(!producto) 
    return res.status(500).send('El producto no se pudo crear');
    res.send(producto);
});

router.put('/:id', uploadOptions.single('image'), async(req, res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Id invalido');
    }
    const categoria = await Categoria.findById(req.body.categoria);
    if(!categoria) return res.status(400).send('Categoria invalida');

    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(400).send('Producto Invalido!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }

    const updateProducto = await Producto.findByIdAndUpdate(
        req.params.id,{
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            categoria: req.body.categoria,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        {new: true}
    )
    if(!updateProducto)
    return res.status(500).send('El producto no se pudo actualizar!')

    res.send(updateProducto);
})

router.delete('/:id', (req, res) => {
    Producto.findByIdAndRemove(req.params.id).then(producto => {
        if(producto){
            return res.status(200).json({success: true, message:'El producto fue borrado!'})
        }else{
            return res.status(404).json({success: false, message:'El producto no funciona!'})
        }
    }).catch(err => {
        return res.status(500).json({success: false, error: err})
    })
})

router.get(`/get/count`, async (req, res) => {
    const productoCount = await Producto.countDocuments((count)=>count);

    if(!productoCount){
        res.status(500).json({success: false});
    }

    res.send({
        productoCount: productoCount,
    });
})

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const productos = await Producto.find({isFeatured: true}).limit(+count);

    if(!productos){
        res.status(500).json({success: false});
    }

    res.send({productos});
})

router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Producto Id no valido');
        }
        const files = req.files;
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`);
            });
        }

        const producto = await Producto.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            { new: true }
        );

        if (!producto)
            return res.status(500).send('La galeria no puede ser actualizada!');

        res.send(producto);
    }
);

module.exports=router;