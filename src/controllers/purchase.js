"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */

const Purchase = require('../models/purchase')
const Product = require('../models/product')

module.exports = {

    list: async (req, res) => {
        /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "List Purchases"
            #swagger.description = `
                You can send query with endpoint for search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            `
        */
        const data = await res.getModelList(Purchase, {}, ['userId', 'firmId', 'brandId', 'productId'])

        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(Purchase),
            data,
          });
    },

    create: async (req, res) => {
        /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Create Purchase"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "userId": "65343223gg4e9681f937f107",
                    "firmId": "65343222b67e9681f937f304",
                    "brandId": "65343222b67e9681f937f107",
                    "productId": "65343222b67e9681f937f422",
                    "quantity": 1,
                    "price": 9.99
                }
            }
        */
       // Amount hesaplama
    req.body.amount = req.body.price * req.body.quantity;

    // Set userId from logined user:
    req.body.userId = req.user._id;

    let product = await Product.findOne({ _id: req.body.productId });

    // Eğer productId ve brandId eşleşiyorsa stok miktarını arttır
    if (product.brandId.toString() === req.body.brandId) {
        await Product.updateOne({ _id: req.body.productId }, { $inc: { quantity: +req.body.quantity } });
    } else {
        // Eğer brandId farklıysa, yeni bir ürün oluştur
        const newProduct = await Product.create({
            name: product.name,
            brandId: req.body.brandId,
            quantity: req.body.quantity,
            categoryId: product.categoryId
        });
        req.body.productId = newProduct._id;
    }

    const data = await Purchase.create(req.body);

    res.status(201).send({
        error: false,
        data
    });
},

    read: async (req, res) => {
        /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Get Single Purchase"
        */
        const data = await Purchase.findOne({ _id: req.params.id }).populate(['userId', 'firmId', 'brandId', 'productId']);

        res.status(200).send({
            error: false,
            data,
          });
    },

    update: async (req, res) => {
        /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Update Purchase"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "userId": "65343223gg4e9681f937f107",
                    "firmId": "65343222b67e9681f937f304",
                    "brandId": "65343222b67e9681f937f107",
                    "productId": "65343222b67e9681f937f422",
                    "quantity": 1,
                    "price": 9.99
                }
            }
        */
        const currentPurchase = await Purchase.findOne({ _id: req.params.id });
    
        if (!currentPurchase) {
            return res.status(404).send({
                error: true,
                message: "Purchase not found"
            });
        }
    
        // Amount hesaplama
        if (req.body.price && req.body.quantity) {
            req.body.amount = req.body.price * req.body.quantity;
        }
    
        let product = await Product.findOne({ _id: currentPurchase.productId });
    
        // Eğer productId veya brandId değişmişse, eski ürünün stok bilgisini geri almak ve yeni ürünün stok bilgisini güncellemek gerekiyor
        if (req.body.productId !== currentPurchase.productId.toString() || req.body.brandId !== product.brandId.toString()) {
    
            // Eski üründen quantity düş:
            await Product.updateOne({ _id: currentPurchase.productId }, { $inc: { quantity: -currentPurchase.quantity } });
    
            if (req.body.productId !== currentPurchase.productId.toString()) {
                // Yeni ürüne quantity ekle:
                await Product.updateOne({ _id: req.body.productId }, { $inc: { quantity: +req.body.quantity } });
            } else if (req.body.brandId !== product.brandId.toString()) {
                // Eğer brandId farklıysa, yeni bir ürün oluştur
                const newProduct = await Product.create({
                    name: product.name,
                    brandId: req.body.brandId,
                    quantity: req.body.quantity,
                    categoryId: product.categoryId
                });
                req.body.productId = newProduct._id;
            }
        } else if (req.body?.quantity) {
            // Eğer productId veya brandId değişmediyse, sadece stok miktarını güncelle
            const difference = req.body.quantity - currentPurchase.quantity;
            await Product.updateOne({ _id: currentPurchase.productId }, { $inc: { quantity: +difference } });
        }
    
        // Purchase kaydını güncelle
        const data = await Purchase.updateOne({ _id: req.params.id }, req.body, { runValidators: true });
    
        res.status(202).send({
            error: false,
            data,
            new: await Purchase.findOne({ _id: req.params.id }).populate(['userId', 'firmId', 'brandId', 'productId'])
        });
    },
    
    

    delete: async (req, res) => {
        /*
            #swagger.tags = ["Purchases"]
            #swagger.summary = "Get Single Purchase"
        */

        // Mevcut işlemdeki adet bilgisi al:
        const currentPurchase = await Purchase.findOne({ _id: req.params.id })

        // Delete:
        const data = await Purchase.deleteOne({ _id: req.params.id })

        // Product quantity'den adeti eksilt:
        const updateProduct = await Product.updateOne({ _id: currentPurchase.productId }, { $inc: { quantity: -currentPurchase.quantity } })

        res.status(data.deletedCount ? 204 : 404).send({
            error: !data.deletedCount,
            data
        })
    }
}