const {Pedido} = require('../modelos/pedido');
const {OrderItem} = require('../modelos/order-item');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const pedidoList = await Pedido.find().populate('usuario', 'name').sort({'dateOrdered': -1});

    if(!pedidoList){
        res.status(500).json({success: false})
    }

    res.send(pedidoList);
})

router.get(`/:id`, async (req, res) => {
    const pedido = await Pedido.findById(req.params.id)
    .populate('usuario', 'name')
    .populate({
	path:'orderItems', populate: {
		path: 'producto', populate: 'categoria'}
	});

    if(!pedido){
        res.status(500).json({success: false})
    }

    res.send(pedido);
})

router.post('/', async (req,res)=>{
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem =>{
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            producto: orderItem.producto
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))

    
    const orderItemsIdsResolved =  await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('producto','price');
        const totalPrice = orderItem.producto.price * orderItem.quantity;
        return totalPrice
    }))

    const totalPrice= totalPrices.reduce((a,b) => a + b, 0);

    let pedido = new Pedido({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        usuario: req.body.usuario,
    })
    pedido = await pedido.save();

    if(!pedido)
    return res.status(400).send('the order cannot be created!')

    res.send(pedido);
});

router.put('/:id', async(req, res)=>{
    const pedido = await Pedido.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        {new: true}
    )
    if(!pedido)
    return res.status(404).send('El pedido no se pudo actualizar!')

    res.send(pedido);
})

router.delete('/:id', (req, res) => {
    Pedido.findByIdAndRemove(req.params.id).then(async pedido => {
        if(pedido){
            await pedido.orderItems.map(async orderItem => {
                await orderItem.findByIdAndRemove(orderItem)
            })
            
            return res.status(200).json({success: true, message:'El pedido fue borrada!'})
        }else{
            return res.status(404).json({success: false, message:'El pedido no funciona!'})
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err})
    }) 
})


router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Pedido.aggregate([
        {$group: {_id: null, totalsales: { $sum: '$totalPrice'}}}
    ])

    if(!totalSales){
        return res.status(400).send('El precio de la orden no se pudo generar')
    }

    res.send({totalsales: totalSales.pop().totalsales})

}) 

router.get(`/get/count`, async (req, res) => {
    const pedidoCount = await Pedido.countDocuments((count)=>count);

    if(!pedidoCount){
        res.status(500).json({success: false});
    }
 
    res.send({
        pedidoCount: pedidoCount,
    });
})

router.get(`/get/userorders/:usuarioid`, async (req, res) => {
    const userpedidoList = await Pedido.find({usuario: req.params.usuarioid}).populate({
        path:'orderItems', populate: {
            path: 'producto', populate: 'categoria'}
        }).sort({'dateOrdered': -1});

    if(!userpedidoList){
        res.status(500).json({success: false})
    }

    res.send(userpedidoList);
})
module.exports=router; 