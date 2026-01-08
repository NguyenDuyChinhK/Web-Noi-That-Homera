import classNames from 'classnames/bind';
import styles from './DetailProduct.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { Rate, Button, InputNumber, Divider, message, Tag, List, Avatar } from 'antd';
import { Comment } from '@ant-design/compatible';
import { MinusOutlined, PlusOutlined, CheckOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react';
import Loading from '../../Components/Loading/Loading';
import CardBody from '../../Components/CardBody/CardBody';
import { requestCreateCart } from '../../config/request';
import { useStore } from '../../hooks/userStore';
const cx = classNames.bind(styles);

function DetailProduct() {
    const { id } = useParams();
    const [quantity, setQuantity] = useState(1);
    const { data, loading, error } = useFetch(`/api/get-product-by-id?id=${id}`);
    const { data: reviewsData, loading: reviewsLoading } = useFetch('/api/get-preview-product-home');
    const [selectedImage, setSelectedImage] = useState(null);

    const navigate = useNavigate();

    const { getCart, dataUser } = useStore();

    const product = data?.product;
    const relatedProducts = data?.relatedProducts;
    const reviews = reviewsData?.filter((review) => review.productId === id) || [];

    const productRef = useRef(null);

    useEffect(() => {
        if (product) {
            document.title = `${product.name}`;
            setSelectedImage(product.images.split(',')[0]);
            productRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [product]);

    const handleQuantityChange = (value) => {
        if (value > product?.stock) {
            message.error('Số lượng sản phẩm không đủ');
            return;
        }
        setQuantity(value);
    };

    const handleAddToCart = async () => {
        await requestCreateCart({
            productId: product._id,
            quantity,
        });
        await getCart();
        message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    };

    const handleBuyNow = async () => {
        const data = {
            productId: product._id,
            quantity: 1,
        };
        await requestCreateCart(data);
        await getCart();
        navigate('/checkout');
        message.success('Đang chuyển đến trang thanh toán');
    };

    const calculateDiscountedPrice = (price, discount) => {
        if (!price || !discount) return price;
        return price - (price * discount) / 100;
    };

    const formatPrice = (price) => {
        return price ? new Intl.NumberFormat('vi-VN').format(price) + 'đ' : '';
    };

    if (error) return <div className={cx('error')}>Có lỗi xảy ra: {error}</div>;

    return (
        <div className={cx('wrapper')} ref={productRef}>
            <header>
                <Header />
            </header>
            {loading ? (
                <Loading />
            ) : (
                <main className={cx('product-detail')}>
                    <div className={cx('container')}>
                        <div className={cx('product-layout')}>
                            <div className={cx('product-images')}>
                                <div className={cx('thumbnail-list')}>
                                    {product?.images &&
                                        product.images.split(',').map((image, index) => (
                                            <div
                                                onClick={() => setSelectedImage(image)}
                                                key={index}
                                                className={cx('thumbnail-item', { active: image === selectedImage })}
                                            >
                                                <img src={image} alt={`${product.name} - ảnh ${index + 1}`} />
                                            </div>
                                        ))}
                                </div>
                                <div className={cx('main-image')}>
                                    {selectedImage && <img src={selectedImage} alt={product?.name} />}
                                </div>
                            </div>

                            <div className={cx('product-info')}>
                                <h1 className={cx('product-name')}>{product?.name}</h1>
                                <div className={cx('product-rating')}>
                                    <Rate disabled defaultValue={5} />
                                    <span className={cx('review-count')}>(3)</span>
                                    <div className={cx('sales')}>
                                        <span>Đã bán: {product?.soldCount || 0}</span>
                                    </div>
                                </div>
                                <div className={cx('product-price')}>
                                    {product?.discount > 0 && (
                                        <div className={cx('discount-badge')}>-{product.discount}%</div>
                                    )}
                                    <div className={cx('sale-price')}>
                                        {formatPrice(calculateDiscountedPrice(product?.price, product?.discount))}
                                    </div>
                                    {product?.discount > 0 && (
                                        <div className={cx('original-price')}>{formatPrice(product?.price)}</div>
                                    )}
                                </div>
                                {product?.size && product.size.length > 0 && (
                                    <div className={cx('product-dimensions')}>
                                        <span className={cx('label')}>Kích thước:</span>
                                        <span className={cx('dimensions-value')}>
                                            {product.size[0].replace(/,\s*/g, ' x ')}
                                        </span>
                                    </div>
                                )}
                                <Divider />
                                <div className={cx('stock-info')}>
                                    <span className={cx('label')}>Số lượng trong kho :</span>
                                    <span className={cx('stock-status', { 'in-stock': product?.stock > 0 })}>
                                        {product?.stock} sản phẩm
                                    </span>
                                    {product?.quantity > 0 && (
                                        <span className={cx('stock-count')}>({product.quantity} sản phẩm có sẵn)</span>
                                    )}
                                </div>
                                <div className={cx('product-actions')}>
                                    <div className={cx('quantity-selector')}>
                                        <Button
                                            icon={<MinusOutlined />}
                                            onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                                            disabled={product?.stock <= 0}
                                        />
                                        <InputNumber
                                            min={1}
                                            max={product?.stock}
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            disabled={product?.stock <= 0}
                                        />
                                        <Button
                                            icon={<PlusOutlined />}
                                            onClick={() => handleQuantityChange(Math.min(product?.stock, quantity + 1))}
                                            disabled={product?.stock <= 0}
                                        />
                                    </div>

                                    {!dataUser._id ? (
                                        <>
                                            <Link to="/login">
                                                <Button
                                                    type="primary"
                                                    icon={<ShoppingCartOutlined />}
                                                    size="large"
                                                    className={cx('buy-now')}
                                                >
                                                    Đăng nhập để thêm vào giỏ hàng
                                                </Button>
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                type="primary"
                                                icon={<ShoppingCartOutlined />}
                                                className={cx('add-to-cart')}
                                                onClick={handleAddToCart}
                                                disabled={product?.stock <= 0}
                                            >
                                                THÊM VÀO GIỎ
                                            </Button>

                                            <Button
                                                className={cx('buy-now')}
                                                onClick={handleBuyNow}
                                                disabled={product?.stock <= 0}
                                            >
                                                MUA NGAY
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className={cx('shipping-info')}>
                                    <div className={cx('info-item')}>
                                        <CheckOutlined />
                                        <span>Miễn phí giao hàng & lắp đặt tại tất cả quận huyện thuộc Hà Nội</span>
                                    </div>
                                    <div className={cx('info-item')}>
                                        <CheckOutlined />
                                        <span>Miễn phí 1 đổi 1 - Bảo hành 2 năm - Bảo trì trọn đời</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={cx('product-description')}>
                            <h2>Mô tả sản phẩm</h2>
                            <p dangerouslySetInnerHTML={{ __html: product?.description }} />
                        </div>

                        <div className={cx('product-reviews')}>
                            <h2>Đánh giá từ khách hàng</h2>
                            {reviewsLoading ? (
                                <Loading />
                            ) : reviews.length > 0 ? (
                                <List
                                    className={cx('review-list')}
                                    itemLayout="horizontal"
                                    dataSource={reviews}
                                    renderItem={(review) => (
                                        <List.Item>
                                            <Comment
                                                author={<a>{review.user.name}</a>}
                                                avatar={<Avatar icon={<UserOutlined />} />}
                                                content={
                                                    <div>
                                                        <Rate disabled value={review.rating || 5} />
                                                        <p>{review.content}</p>
                                                        {review.image && (
                                                            <div className={cx('review-image')}>
                                                                <img src={review.image} alt="Review" />
                                                            </div>
                                                        )}
                                                    </div>
                                                }
                                                datetime={
                                                    <span>
                                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <div className={cx('no-reviews')}>
                                    <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                                </div>
                            )}
                        </div>

                        <div className={cx('product-related')}>
                            <h2>Sản phẩm liên quan</h2>
                            <div className={cx('product-list')}>
                                {relatedProducts.map((product) => (
                                    <CardBody key={product._id} item={product} />
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            )}
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default DetailProduct;
