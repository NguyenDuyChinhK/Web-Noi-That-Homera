const modelProduct = require('../models/products.model');
const modelCategory = require('../models/category.model');
const modelPreviewProduct = require('../models/previewProduct.model');
const modelUser = require('../models/users.model');

const { BadRequestError } = require('../core/error.response');
const { Created, OK } = require('../core/success.response');

const dayjs = require('dayjs');

class controllerProducts {
    async createProduct(req, res) {
        const { name, price, discount, description, category, size, stock, images } = req.body;
        if (!name || !price || !discount || !description || !category || !size || !stock || !images) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const product = await modelProduct.create({
            name,
            price,
            discount,
            description,
            category,
            size,
            stock,
            images,
        });
        new Created({
            message: 'Tạo sản phẩm thành công',
            statusCode: 201,
            metadata: product,
        }).send(res);
    }

    async getProductNew(req, res) {
        // Lấy sản phẩm tạo trong 3 ngày trước
        const threeDaysAgo = dayjs().subtract(3, 'day').toDate();

        const product = await modelProduct
            .find({
                createdAt: { $gte: threeDaysAgo },
            })
            .sort({ createdAt: -1 })
            .limit(10);
        const data = product.map((p) => ({
            ...p.toObject(),
            isNew: true,
        }));

        new OK({
            message: 'Lấy sản phẩm tạo trong 3 ngày gần đây',
            statusCode: 200,
            metadata: data,
        }).send(res);
    }

    async getProductById(req, res) {
        const { id } = req.query;
        const product = await modelProduct.findById(id);
        const relatedProducts = await modelProduct.find({
            category: product.category,
            _id: { $ne: id },
        });
        const previewProduct = await modelPreviewProduct.find({ productId: id });
        const dataPreviewProduct = await Promise.all(
            previewProduct.map(async (item) => {
                const user = await modelUser.findById(item.userId);
                return { ...item.toObject(), user: user.fullName };
            }),
        );
        new OK({
            message: 'Lấy sản phẩm thành công',
            statusCode: 200,
            metadata: { product, relatedProducts, previewProduct: dataPreviewProduct },
        }).send(res);
    }

    async getProductByCategory(req, res) {
        const { category, price, discount } = req.query;

        let products = await modelProduct.find({ category });

        if (discount && discount !== '0') {
            products = products.filter((p) => {
                if (discount === 'all') return p.discount > 0;
                if (discount === '1') return p.discount >= 10 && p.discount < 25;
                if (discount === '2') return p.discount >= 25 && p.discount < 50;
                if (discount === '3') return p.discount >= 50;
                return true;
            });
        }

        if (price && price !== '0') {
            products = products.filter((product) => {
                const actualPrice = product.price * (1 - (product.discount || 0) / 100);

                switch (price) {
                    case '1':
                        return actualPrice < 1_000_000;
                    case '2':
                        return actualPrice >= 1_000_000 && actualPrice <= 5_000_000;
                    case '3':
                        return actualPrice > 5_000_000 && actualPrice <= 20_000_000;
                    case '4':
                        return actualPrice > 20_000_000;
                    default:
                        return true;
                }
            });
        }

        new OK({
            message: 'Lấy sản phẩm thành công',
            statusCode: 200,
            metadata: products,
        }).send(res);
    }

    async getAllProduct(req, res) {
        const { price, discount } = req.query;

        let products = await modelProduct.find();

        if (discount && discount !== '0') {
            products = products.filter((p) => {
                if (discount === 'all') return p.discount > 0;
                if (discount === '1') return p.discount >= 10 && p.discount < 25;
                if (discount === '2') return p.discount >= 25 && p.discount < 50;
                if (discount === '3') return p.discount >= 50;
                return true;
            });
        }

        if (price && price !== '0') {
            products = products.filter((product) => {
                const actualPrice = product.price * (1 - (product.discount || 0) / 100);

                switch (price) {
                    case '1':
                        return actualPrice < 1_000_000;
                    case '2':
                        return actualPrice >= 1_000_000 && actualPrice <= 5_000_000;
                    case '3':
                        return actualPrice > 5_000_000 && actualPrice <= 20_000_000;
                    case '4':
                        return actualPrice > 20_000_000;
                    default:
                        return true;
                }
            });
        }

        new OK({
            message: 'Lấy tất cả sản phẩm thành công',
            statusCode: 200,
            metadata: products,
        }).send(res);
    }

    async updateProduct(req, res) {
        const { id, name, price, discount, description, category, size, stock, images } = req.body;
        const product = await modelProduct.findByIdAndUpdate(
            id,
            { name, price, discount, description, category, size, stock, images },
            { new: true },
        );
        new OK({
            message: 'Cập nhật sản phẩm thành công',
            statusCode: 200,
            metadata: product,
        }).send(res);
    }

    async deleteProduct(req, res) {
        const { id } = req.query;
        const product = await modelProduct.findByIdAndDelete(id);
        if (!product) {
            throw new BadRequestError('Sản phẩm không tồn tại');
        }
        new OK({
            message: 'Xóa sản phẩm thành công',
            statusCode: 200,
            metadata: product,
        }).send(res);
    }

    async getProductManufactured(req, res) {
        const product = await modelProduct.find({ discount: { $gte: 10 } });
        new OK({
            message: 'Lấy sản phẩm sản xuất thành công',
            statusCode: 200,
            metadata: product,
        }).send(res);
    }

    async searchProduct(req, res, next) {
        const { valueSearch } = req.query;

        const data = await modelProduct.find({
            name: { $regex: valueSearch, $options: 'i' }, // Thêm $options: "i"
        });

        new OK({
            message: 'Lấy sản phẩm tìm kiếm',
            statusCode: 200,
            metadata: data,
        }).send(res);
    }
}

module.exports = new controllerProducts();
