const modelCart = require('../models/cartUser.model');
const modelProduct = require('../models/products.model');

const { BadRequestError } = require('../core/error.response');
const { Created, OK } = require('../core/success.response');

function calculateItemPrice(price, quantity, discount = 0) {
    const total = price * quantity;
    return discount > 0 ? Math.round(total * (1 - discount / 100)) : total;
}

class controllerCartUser {
    async addToCart(req, res) {
        const { id } = req.user;
        const { productId, quantity } = req.body;

        if (!id || !productId || !quantity) {
            throw new BadRequestError('Thiếu dữ liệu');
        }

        const product = await modelProduct.findById(productId);
        if (!product) {
            throw new BadRequestError('Sản phẩm không tồn tại');
        }

        const findCartUser = await modelCart.findOne({ userId: id });

        if (findCartUser) {
            const findProduct = findCartUser.product.find((item) => item.productId.toString() === productId);

            if (findProduct) {
                findProduct.quantity += quantity;
            } else {
                findCartUser.product.push({ productId, quantity });
            }

            let totalPrice = 0;

            for (const item of findCartUser.product) {
                const p = await modelProduct.findById(item.productId);
                totalPrice += calculateItemPrice(p.price, item.quantity, p.discount);
            }

            findCartUser.totalPrice = totalPrice;
            await findCartUser.save();

            return new OK({
                message: 'Thêm sản phẩm vào giỏ hàng thành công',
                metadata: findCartUser,
            }).send(res);
        }

        const itemPrice = calculateItemPrice(product.price, quantity, product.discount);

        const cart = await modelCart.create({
            userId: id,
            product: [{ productId, quantity }],
            totalPrice: itemPrice,
        });

        new Created({
            message: 'Thêm sản phẩm vào giỏ hàng thành công',
            metadata: cart,
        }).send(res);
    }

    async getCart(req, res) {
        const { id } = req.user;
        const cart = await modelCart.findOne({ userId: id });

        if (!cart) {
            return new OK({
                message: 'Giỏ hàng trống',
                metadata: { cartItems: [], totalPrice: 0 },
            }).send(res);
        }

        const cartItems = await Promise.all(
            cart.product.map(async (item) => {
                const product = await modelProduct.findById(item.productId);
                return { item, product };
            }),
        );

        new OK({
            message: 'Lấy giỏ hàng thành công',
            metadata: { cartItems, totalPrice: cart.totalPrice },
        }).send(res);
    }

    async updateProductCart(req, res) {
        const { id } = req.user;
        const { productId, quantity } = req.body;

        if (quantity < 1) {
            throw new BadRequestError('Số lượng không hợp lệ');
        }

        const cart = await modelCart.findOne({ userId: id });
        if (!cart) {
            throw new BadRequestError('Giỏ hàng không tồn tại');
        }

        const item = cart.product.find((p) => p.productId.toString() === productId);
        if (!item) {
            throw new BadRequestError('Sản phẩm không tồn tại trong giỏ');
        }

        const product = await modelProduct.findById(productId);
        if (!product) {
            throw new BadRequestError('Sản phẩm không tồn tại');
        }

        const oldPrice = calculateItemPrice(product.price, item.quantity, product.discount);
        const newPrice = calculateItemPrice(product.price, quantity, product.discount);

        item.quantity = quantity;
        cart.totalPrice = cart.totalPrice - oldPrice + newPrice;

        if (cart.totalPrice < 0) cart.totalPrice = 0;

        await cart.save();

        new OK({
            message: 'Cập nhật số lượng thành công',
            metadata: cart,
        }).send(res);
    }

    async deleteProductCart(req, res) {
        const { id } = req.user;
        const { productId } = req.body;

        const cart = await modelCart.findOne({ userId: id });
        if (!cart) {
            throw new BadRequestError('Giỏ hàng không tồn tại');
        }

        const index = cart.product.findIndex((item) => item.productId.toString() === productId);
        if (index === -1) {
            throw new BadRequestError('Sản phẩm không tồn tại trong giỏ');
        }

        const product = await modelProduct.findById(productId);
        const removedItem = cart.product[index];

        const removedPrice = calculateItemPrice(product.price, removedItem.quantity, product.discount);

        cart.product.splice(index, 1);
        cart.totalPrice -= removedPrice;
        if (cart.totalPrice < 0) cart.totalPrice = 0;

        await cart.save();

        new OK({
            message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
            metadata: cart,
        }).send(res);
    }

    async updateInfoCart(req, res) {
        const { id } = req.user;
        const { fullName, phone, address, note } = req.body;

        const cart = await modelCart.findOne({ userId: id });
        if (!cart) {
            throw new BadRequestError('Giỏ hàng không tồn tại');
        }

        cart.fullName = fullName;
        cart.phone = phone;
        cart.address = address;
        cart.note = note;

        await cart.save();

        new OK({
            message: 'Cập nhật thông tin giỏ hàng thành công',
            metadata: cart,
        }).send(res);
    }
}

module.exports = new controllerCartUser();
