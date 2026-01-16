import classNames from 'classnames/bind';
import styles from './CartUser.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { Popconfirm, message } from 'antd';

import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/userStore';
import { requestDeleteProductCart, requestUpdateProductCart } from '../../config/request';
import { useEffect } from 'react';
import icon_counterfeit from '../../assets/images/icon/counterfeit.png';

const cx = classNames.bind(styles);

function CartUser() {
    const { dataCart, getCart } = useStore();

    useEffect(() => {
        document.title = 'Giỏ hàng';
    }, []);

    const handleDeleteProductCart = async (productId) => {
        try {
            const data = {
                productId,
            };
            await requestDeleteProductCart(data);
            message.success('Xóa sản phẩm khỏi giỏ hàng thành công');
            await getCart();
        } catch (error) {
            console.error(error);
            message.error('Xóa sản phẩm thất bại');
        }
    };

    const onIncreaseQuantity = async (cartItem, product) => {
        if (cartItem.quantity >= product.stock) {
            alert(`Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho`);
            return;
        }

        const data = {
            productId: product._id,
            quantity: cartItem.quantity + 1,
        };

        await requestUpdateProductCart(data);
        await getCart();
    };

    const onDecreaseQuantity = async (product, productId) => {
        if (product.quantity === 1) return;
        const data = {
            productId,
            quantity: product.quantity - 1,
        };
        await requestUpdateProductCart(data);
        await getCart();
    };
    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <div className={cx('container')}>
                <h1 className={cx('page-title')}>Giỏ hàng của bạn</h1>
                <div className={cx('divider')}></div>
                {dataCart?.cartItems?.length > 0 ? (
                    <div className={cx('cart-content')}>
                        <div className={cx('cart-items')}>
                            <div className={cx('cart-items-count')}>
                                Có <span>{dataCart?.cartItems?.length}</span> sản phẩm trong giỏ hàng
                            </div>
                            {dataCart?.cartItems?.map((item) => (
                                <div key={item.product._id} className={cx('cart-item')}>
                                    <div className={cx('item-image')}>
                                        <img src={item.product.images.split(',')[0]} />
                                    </div>
                                    <div className={cx('item-details')}>
                                        <h3 className={cx('item-name')}>{item.product.name}</h3>
                                        <div className={cx('item-price')}>
                                            <span className={cx('current-price')}>
                                                {(item?.product?.discount
                                                    ? item?.product?.price -
                                                      (item?.product?.discount * item?.product?.price) / 100
                                                    : item?.product?.price
                                                )?.toLocaleString()}
                                                đ
                                            </span>
                                            {item?.product?.discount > 0 && (
                                                <span className={cx('original-price')}>
                                                    {item?.product?.price?.toLocaleString()}đ
                                                </span>
                                            )}
                                        </div>
                                        <div className={cx('item-quantity')}>
                                            <button
                                                onClick={() => onDecreaseQuantity(item.item, item.product._id)}
                                                className={cx('quantity-btn', 'decrease')}
                                                disabled={item.item.quantity === 1}
                                            >
                                                -
                                            </button>

                                            <input type="text" value={item.item.quantity} readOnly />
                                            <button
                                                onClick={() => onIncreaseQuantity(item.item, item.product)}
                                                className={cx('quantity-btn', 'increase')}
                                                disabled={item.item.quantity >= item.product.stock}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className={cx('item-actions')}>
                                        <Popconfirm
                                            title="Bạn chắc chắn muốn xóa sản phẩm này?"
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            onConfirm={() => handleDeleteProductCart(item.product._id)}
                                        >
                                            <button className={cx('remove-btn')}>×</button>
                                        </Popconfirm>
                                        <div className={cx('item-total')}>
                                            {(
                                                (item?.product?.discount
                                                    ? item.product.price -
                                                      (item.product.discount * item.product.price) / 100
                                                    : item.product.price) * item.item.quantity
                                            ).toLocaleString()}
                                            đ
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={cx('order-summary')}>
                            <h3 className={cx('summary-title')}>Thông tin đơn hàng</h3>
                            <div className={cx('summary-divider')}></div>

                            <div className={cx('summary-row')}>
                                <span>Tổng tiền:</span>
                                <span className={cx('total-price')}>{dataCart?.totalPrice?.toLocaleString()}đ</span>
                            </div>
                            <Link to="/checkout">
                                <button className={cx('checkout-btn')}>THANH TOÁN</button>
                            </Link>

                            <Link to="/" className={cx('continue-shopping')}>
                                <span>←</span> Tiếp tục mua hàng
                            </Link>

                            <div className={cx('shipping-info')}>
                                <div className={cx('info-item')}>
                                    <span className={cx('check-icon')}>✓</span>
                                    <div>
                                        <strong>Không rủi ro. Đặt hàng trước, thanh toán sau tại nhà.</strong> Miễn phí
                                        giao hàng & lắp đặt
                                        <span>tại tất cả quận huyện thuộc Hà Nội (*)</span>
                                    </div>
                                </div>

                                <div className={cx('info-item')}>
                                    <span className={cx('check-icon')}>✓</span>
                                    <div>
                                        <span>Đơn hàng của quý khách sẽ được </span>
                                        <strong>giao hàng trong vòng 3 ngày</strong>
                                        <span>
                                            , vui lòng đợi nhân viên tư vấn xác nhận lịch giao hàng trước khi thực hiện
                                            chuyển khoản đơn hàng
                                        </span>
                                    </div>
                                </div>

                                <div className={cx('info-item')}>
                                    <span className={cx('check-icon')}>✓</span>
                                    <div>
                                        <strong>Miễn phí 1 đổi 1 - Bảo hành 2 năm - Bảo trì trọn đời (**)</strong>
                                    </div>
                                </div>

                                <div className={cx('info-item')}>
                                    <span className={cx('check-icon')}>✓</span>
                                    <div>
                                        <span>
                                            Tất cả sản phẩm được thiết kế bởi các chuyên gia thiết kế nội thất đến từ{' '}
                                        </span>
                                        <strong>Việt Nam</strong>
                                    </div>
                                </div>

                                <div className={cx('info-item')}>
                                    <span className={cx('check-icon')}>✓</span>
                                    <div>
                                        <strong>Chất lượng Quốc Tế đảm bảo theo tiêu chuẩn</strong>
                                        <span> cho người dùng tại Việt Nam</span>
                                    </div>
                                </div>

                                <div className={cx('info-item')}>
                                    <span className={cx('check-icon')}>✓</span>
                                    <div>
                                        <span>Sản xuất tại nhà máy với gần </span>
                                        <strong>40 năm kinh nghiệm</strong>
                                    </div>
                                </div>

                                <div className={cx('notes')}></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={cx('empty-cart')}>
                        <img src={icon_counterfeit} />
                    </div>
                )}
            </div>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default CartUser;
