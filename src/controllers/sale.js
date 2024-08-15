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
        if (currentProduct.stock >= req.body.quantity) {
            // Create sale:
            const data = await Sale.create(req.body);
    
            // Satıştan sonra product adetten eksilt:
            await Product.updateOne({ _id: currentProduct._id }, { $inc: { stock: -req.body.quantity } });
    
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
            #swagger.summary = "Update Sale"
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
    
        // `productId` veya `brandId`'de değişiklik yapılmaya çalışılıyorsa hata ver:
        if ((req.body.productId && req.body.productId !== currentSale.productId.toString()) || (req.body.brandId && req.body.brandId !== currentSale.brandId.toString())) {
            return res.status(400).send({
                error: true,
                message: "Changing the productId/brandId is not allowed."
            });
        }

        // Eğer `price` veya `quantity` değişiyorsa `amount`'u tekrar hesapla
        if (req.body.price && req.body.quantity) {
            req.body.amount = req.body.price * req.body.quantity;
        }
    
        // Quantity farkı hesaplama ve stok güncellemesi
        if (req.body?.quantity) {
            const difference = req.body.quantity - currentSale.quantity;
            const updateProduct = await Product.updateOne(
                { _id: currentSale.productId, stock: { $gte: difference } },
                { $inc: { stock: -difference } }
            );
            if (updateProduct.modifiedCount === 0) {
                res.errorStatusCode = 422;
                throw new Error("There is not enough product-quantity for this sale.");
            }
        }
    
        // Güncelleme işlemi
        const data = await Sale.updateOne({ _id: req.params.id }, req.body, { runValidators: true });
    
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
        const updateProduct = await Product.updateOne({ _id: currentSale.productId }, { $inc: { stock: +currentSale.quantity } })

        res.status(data.deletedCount ? 204 : 404).send({
            error: !data.deletedCount,
            data
        })
    }
}