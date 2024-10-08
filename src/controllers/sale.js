"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */

const Sale = require('../models/sale')
const Product = require('../models/product')

module.exports = {

    list: async (req, res) => {
        /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "List Sales"
            #swagger.description = `
                You can send query with endpoint for search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            `
        */
        const data = await res.getModelList(Sale, {}, ['userId', 'brandId', 'productId'])

        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(Sale),
            data,
          });
    },

    create: async (req, res) => {
        /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Create Sale"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "userId": "65343223gg4e9681f937f107",
                    "brandId": "65343222b67e9681f937f107",
                    "productId": "65343222b67e9681f937f422",
                    "quantity": 1,
                    "price": 9.99
                }
            }
        */
        req.body.amount = req.body.price * req.body.quantity;
    
        // Set userId from logged-in user:
        req.body.userId = req.user._id;
    
        // Mevcut ürünün bilgilerini al:
        const currentProduct = await Product.findOne({ _id: req.body.productId });
    
        if (!currentProduct) {
            res.errorStatusCode = 404;
            throw new Error('Product not found.');
        }
    
        // BrandId kontrolü:
        if (currentProduct.brandId.toString() !== req.body.brandId) {
            res.errorStatusCode = 422;
            throw new Error('The product with the specified brandId does not exist.');
        }
    
        // Stok kontrolü:
        if (currentProduct.quantity >= req.body.quantity) {
            // Create sale:
            const data = await Sale.create(req.body);
    
            // Satıştan sonra product adetten eksilt:
            await Product.updateOne({ _id: currentProduct._id }, { $inc: { quantity: -req.body.quantity } });
    
            res.status(201).send({
                error: false,
                data
            });
        } else {
            res.errorStatusCode = 422;
            throw new Error('There is not enough product-quantity for this sale.');
        }
    },

    read: async (req, res) => {
        /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Get Single Sale"
        */
        const data = await Sale.findOne({ _id: req.params.id }).populate(['userId', 'brandId', 'productId']);

        res.status(200).send({
            error: false,
            data,
          });
    },

    update: async (req, res) => {
        /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Create Sale"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "userId": "65343223gg4e9681f937f107",
                    "brandId": "65343222b67e9681f937f107",
                    "productId": "65343222b67e9681f937f422",
                    "quantity": 1,
                    "price": 9.99
                }
            }
        */
        const currentSale = await Sale.findOne({ _id: req.params.id });
        
        if (!currentSale) {
            return res.status(404).send({
                error: true,
                message: "Sale not found"
            });
        }
    
        let newProduct;
    
        // Yeni `productId` ve `brandId` kontrolü
        if (req.body.productId && req.body.productId !== currentSale.productId.toString()) {
            newProduct = await Product.findOne({ _id: req.body.productId });
    
            if (!newProduct) {
                return res.status(404).send({
                    error: true,
                    message: "Product not found"
                });
            }
    
            if (newProduct.brandId.toString() !== req.body.brandId) {
                return res.status(422).send({
                    error: true,
                    message: "The product with the specified brandId does not exist."
                });
            }
        } else {
            // Eğer `productId` aynı kalıyorsa fakat `brandId` değiştirilmeye çalışılıyorsa hata ver
        if (req.body.brandId && req.body.brandId !== currentSale.brandId.toString()) {
            return res.status(422).send({
                error: true,
                message: "Changing the brandId is not allowed if the productId remains the same."
            });
        }
        newProduct = await Product.findOne({ _id: currentSale.productId });
        }
    
        // Yeni ürünün stoğunu kontrol et
        if (newProduct.quantity < req.body.quantity) {
            return res.status(422).send({
                error: true,
                message: "There is not enough product-quantity for this sale."
            });
    }
    
        // Eğer `price` veya `quantity` değişiyorsa `amount`'u tekrar hesapla
        if (req.body.price || req.body.quantity) {
            const price = req.body.price || currentSale.price; 
            const quantity = req.body.quantity || currentSale.quantity;
            req.body.amount = price * quantity;
        }
    
        // Güncelleme işlemi
        const data = await Sale.updateOne({ _id: req.params.id }, req.body, { runValidators: true });

        // Eski product'ın stoğunu geri yükle ve yeni stoğu güncelle
        await Product.updateOne({ _id: currentSale.productId }, { $inc: { quantity: currentSale.quantity } });
        await Product.updateOne({ _id: newProduct._id }, { $inc: { quantity: -req.body.quantity } });
    
        res.status(202).send({
            error: false,
            data,
            new: await Sale.findOne({ _id: req.params.id }).populate(['userId', 'brandId', 'productId'])
        });
    },

    delete: async (req, res) => {
           /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Get Single Sale"
        */
       // Mevcut işlemdeki adet bilgisi al:
        const currentSale = await Sale.findOne({ _id: req.params.id })

        // Delete:
        const data = await Sale.deleteOne({ _id: req.params.id })

        // Product quantity'den adeti eksilt:
        const updateProduct = await Product.updateOne({ _id: currentSale.productId }, { $inc: { quantity: +currentSale.quantity } })

        res.status(data.deletedCount ? 204 : 404).send({
            error: !data.deletedCount,
            data
        })
    }
}