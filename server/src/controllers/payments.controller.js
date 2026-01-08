const modelPayments = require('../models/payments.model');
const modelCart = require('../models/cartUser.model');
const modelProduct = require('../models/products.model');

const { BadRequestError } = require('../core/error.response');
const { Created, OK } = require('../core/success.response');

const querystring = require('querystring');

const crypto = require('crypto');
const axios = require('axios');

const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

require('dotenv').config();

class controllerPayments {
    async createPayment(req, res) {
        const { id } = req.user;
        const { typePayment } = req.body;
        if (!typePayment) {
            throw new BadRequestError('Vui lòng chọn phương thức thanh toán');
        }
        const findCart = await modelCart.findOne({ userId: id });
        if (!findCart) {
            throw new BadRequestError('Không tìm thấy giỏ hàng');
        }
        if (!findCart.fullName || !findCart.phone || !findCart.address) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        // Kiểm tra tồn kho cho tất cả sản phẩm trong giỏ hàng
        const stockErrors = [];
        for (const item of findCart.product) {
            const product = await modelProduct.findById(item.productId);
            if (!product) {
                stockErrors.push(`Sản phẩm với ID ${item.productId} không tồn tại`);
                continue;
            }
            if (product.stock < item.quantity) {
                throw new BadRequestError('Sản phẩm không đủ hàng trong kho');
            }
        }

        // Nếu có lỗi về tồn kho, trả về lỗi
        if (stockErrors.length > 0) {
            throw new BadRequestError(stockErrors.join('; '));
        }

        if (typePayment === 'COD') {
            // Trừ số lượng sản phẩm trong kho
            for (const item of findCart.product) {
                await modelProduct.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: -item.quantity } },
                    { new: true },
                );
            }

            const payment = await modelPayments.create({
                userId: id,
                product: findCart.product,
                fullName: findCart.fullName,
                phone: findCart.phone,
                address: findCart.address,
                note: findCart.note,
                totalPrice: findCart.totalPrice,
                status: 'pending',
                paymentMethod: 'COD',
            });
            await modelCart.findByIdAndDelete(findCart._id);
            new Created({
                message: 'Tạo đơn hàng thành công',
                statusCode: 201,
                metadata: payment,
            }).send(res);
        }
        if (typePayment === 'VNPAY') {
            const vnpay = await new VNPay({
                // Thông tin cấu hình bắt buộc
                tmnCode: 'GS1I559X',
                secureSecret: 'WWS2Y89FTXLSQKVH54CERAMWNAJMNUB5',
                vnpayHost: 'https://sandbox.vnpayment.vn/merchantv2',
                // Cấu hình tùy chọn
                testMode: true, // Chế độ test
                hashAlgorithm: 'SHA512', // Thuật toán mã hóa
                enableLog: true, // Bật/tắt ghi log
                loggerFn: ignoreLogger, // Hàm xử lý log tùy chỉnh
            });

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const resVnpay = vnpay.buildPaymentUrl({
                vnp_Amount: findCart.totalPrice, //
                vnp_IpAddr: '127.0.0.1', //
                vnp_TxnRef: findCart._id, //
                vnp_OrderInfo: findCart._id, //
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:3000/api/check-payment-vnpay`, //
                vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
                vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
            });

            new Created({
                message: 'Tạo đơn hàng thành công',
                statusCode: 201,
                metadata: resVnpay,
            }).send(res);
        }
        if (typePayment === 'MOMO') {
            const { id } = req.user;
            const findCart = await modelCart.findOne({ userId: id });
            if (!findCart) {
                throw new BadRequestError('Giỏ hàng không tồn tại');
            }

            if (!findCart.address || !findCart.phone || !findCart.fullName) {
                throw new BadRequestError('Vui lòng cập nhật thông tin nhận hàng');
            }

            var partnerCode = 'MOMO';

            var accessKey = 'F8BBA842ECF85';
            var secretkey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
            var requestId = partnerCode + new Date().getTime();
            var orderId = requestId;
            var orderInfo = `thanh toan ${findCart._id}`; // nội dung giao dịch thanh toán
            var redirectUrl = 'http://localhost:3000/api/check-payment-momo'; // 8080
            var ipnUrl = 'http://localhost:3000/api/check-payment-momo';
            // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
            var amount = findCart.totalPrice;
            var requestType = 'captureWallet';
            var extraData = ''; //pass empty value if your merchant does not have stores

            var rawSignature =
                'accessKey=' +
                accessKey +
                '&amount=' +
                amount +
                '&extraData=' +
                extraData +
                '&ipnUrl=' +
                ipnUrl +
                '&orderId=' +
                orderId +
                '&orderInfo=' +
                orderInfo +
                '&partnerCode=' +
                partnerCode +
                '&redirectUrl=' +
                redirectUrl +
                '&requestId=' +
                requestId +
                '&requestType=' +
                requestType;
            //puts raw signature

            //signature
            var signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

            //json object send to MoMo endpoint
            const requestBody = JSON.stringify({
                partnerCode: partnerCode,
                accessKey: accessKey,
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
                ipnUrl: ipnUrl,
                extraData: extraData,
                requestType: requestType,
                signature: signature,
                lang: 'en',
            });

            const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            new Created({ message: 'Thanh toán thành công', metadata: response.data.payUrl }).send(res);
        }
    }

    async checkPaymentVnpay(req, res) {
        const { vnp_OrderInfo, vnp_ResponseCode } = req.query;
        try {
            if (vnp_ResponseCode === '00') {
                const findCart = await modelCart.findOne({ _id: vnp_OrderInfo });

                if (!findCart) {
                    return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
                }

                // Trừ số lượng sản phẩm trong kho
                for (const item of findCart.product) {
                    await modelProduct.findByIdAndUpdate(
                        item.productId,
                        { $inc: { stock: -item.quantity } },
                        { new: true },
                    );
                }

                const newPayment = new modelPayments({
                    fullName: findCart.fullName,
                    phone: findCart.phone,
                    address: findCart.address,
                    product: findCart.product,
                    total: findCart?.totalPrice,
                    paymentMethod: 'VNPAY',
                    userId: findCart.userId,
                    status: 'pending',
                    note: findCart.note,
                });
                await newPayment.save();
                await findCart.deleteOne();
                return res.redirect(`${process.env.DOMAIN_URL}/payments/${newPayment._id}`);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    }

    async checkPaymentMomo(req, res, next) {
        const { orderInfo, resultCode } = req.query;
        if (resultCode === '0') {
            const result = orderInfo.split(' ')[2];

            const findCart = await modelCart.findOne({ _id: result });

            if (!findCart) {
                return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
            }

            // Trừ số lượng sản phẩm trong kho
            for (const item of findCart.product) {
                await modelProduct.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: -item.quantity } },
                    { new: true },
                );
            }

            const newPayment = new modelPayments({
                fullName: findCart.fullName,
                phone: findCart.phone,
                address: findCart.address,
                product: findCart.product,
                total: findCart?.totalPrice,
                paymentMethod: 'MOMO',
                userId: findCart.userId,
                note: findCart.note,
                status: 'pending',
            });

            await newPayment.save();
            await findCart.deleteOne();
            return res.redirect(`${process.env.DOMAIN_URL}/payments/${newPayment._id}`);
        }
    }

    async getPaymentSuccess(req, res) {
        const { idPayment } = req.query;
        const { id } = req.user;
        const findPayment = await modelPayments.findOne({ _id: idPayment, userId: id });
        if (!findPayment) {
            throw new BadRequestError('Không tìm thấy đơn hàng');
        }

        const products = await Promise.all(
            findPayment.product.map(async (item) => {
                const product = await modelProduct.findOne({ _id: item.productId });
                const price = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
                return {
                    id: item.productId,
                    name: product.name,
                    price: price,
                    quantity: item.quantity,
                    image: product.images.split(',')[0],
                };
            }),
        );

        const data = {
            orderId: findPayment._id,
            fullName: findPayment.fullName,
            phone: findPayment.phone,
            address: findPayment.address,
            note: findPayment.note,
            paymentMethod: findPayment.paymentMethod,
            status: findPayment.status,
            products: products,
            totalPrice: findPayment.totalPrice,
        };

        new OK({
            message: 'Lấy thông tin đơn hàng thành công',
            statusCode: 200,
            metadata: data,
        }).send(res);
    }

    async getOrderUser(req, res) {
        try {
            const { id } = req.user;
            const orders = await modelPayments.find({ userId: id }).sort({ createdAt: -1 });

            const ordersWithProducts = await Promise.all(
                orders.map(async (order) => {
                    const productsDetails = await Promise.all(
                        order.product.map(async (item) => {
                            const product = await modelProduct.findOne({ _id: item.productId });
                            if (!product) return null;

                            const price =
                                product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;

                            return {
                                productId: item.productId,
                                name: product.name,
                                price: price,
                                quantity: item.quantity,
                                images: product.images,
                            };
                        }),
                    );

                    return {
                        orderId: order._id,
                        createdAt: order.createdAt,
                        fullName: order.fullName,
                        phone: order.phone,
                        address: order.address,
                        note: order.note,
                        status: order.status,
                        paymentMethod: order.paymentMethod,
                        totalPrice: order.totalPrice,
                        products: productsDetails.filter((p) => p !== null),
                    };
                }),
            );

            new OK({
                message: 'Lấy đơn hàng thành công',
                statusCode: 200,
                metadata: ordersWithProducts,
            }).send(res);
        } catch (error) {
            console.error('Error fetching user orders:', error);
            throw new BadRequestError('Có lỗi xảy ra khi lấy đơn hàng');
        }
    }

    async cancelOrder(req, res) {
        const { id } = req.user;
        const { idOrder } = req.body;
        const findOrder = await modelPayments.findOne({ _id: idOrder, userId: id });
        if (!findOrder) {
            throw new BadRequestError('Không tìm thấy đơn hàng');
        }

        // Hoàn lại số lượng sản phẩm vào kho khi hủy đơn
        if (findOrder.status !== 'cancelled' && findOrder.status !== 'delivered') {
            for (const item of findOrder.product) {
                await modelProduct.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }, { new: true });
            }
        }

        findOrder.status = 'cancelled';
        await findOrder.save();
        new OK({ message: 'Đơn hàng đã được hủy bỏ' }).send(res);
    }

    async getOrderAdmin(req, res) {
        const orders = await modelPayments.find().sort({ createdAt: -1 });
        const data = await Promise.all(
            orders.map(async (order) => {
                const products = await modelProduct.find({ _id: { $in: order.product.map((item) => item.productId) } });
                return { ...order._doc, products };
            }),
        );
        new OK({ message: 'Lấy đơn hàng thành công', metadata: data }).send(res);
    }

    async updateOrderStatus(req, res) {
        const { status, idOrder } = req.body;

        const findOrder = await modelPayments.findOne({ _id: idOrder });

        findOrder.status = status;
        await findOrder.save();

        if (status === 'delivered') {
            await Promise.all(
                findOrder.product.map(async (item) => {
                    const product = await modelProduct.findOne({ _id: item.productId });
                    product.soldCount += item.quantity;
                    await product.save();
                }),
            );
        }
        new OK({ message: 'Cập nhật trạng thái đơn hàng thành công' }).send(res);
    }
}

module.exports = new controllerPayments();
