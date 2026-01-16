import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Rate, Input, message, Radio, Popconfirm } from 'antd';
import style from './OrderUser.module.scss';
import classNames from 'classnames/bind';
import { requestCancelOrder, requestGetOrderUser, requestCreatePreviewProduct } from '../../../config/request';
import { StarOutlined, CloseCircleOutlined } from '@ant-design/icons';

const cx = classNames.bind(style);

function OrderUser() {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [selectedProductIndex, setSelectedProductIndex] = useState(0);
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { TextArea } = Input;

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await requestGetOrderUser();
            if (res.metadata && Array.isArray(res.metadata)) {
                setOrders(
                    res.metadata.map((order) => ({
                        _id: order.orderId,
                        createdAt: order.createdAt,
                        product: order.products || [],
                        fullName: order.fullName,
                        phone: order.phone,
                        address: order.address,
                        note: order.note,
                        status: order.status,
                        totalPrice: order.totalPrice,
                        paymentMethod: order.paymentMethod,
                    })),
                );
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            message.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchOrder();
    }, []);

    const showReviewModal = (order) => {
        setCurrentOrder(order);
        setSelectedProductIndex(0);
        setRating(5);
        setReviewComment('');
        setIsReviewModalOpen(true);
    };

    const handleReviewSubmit = async () => {
        const selectedProduct = currentOrder.product[selectedProductIndex];

        const data = {
            productId: selectedProduct.productId,
            content: reviewComment,
            rating,
        };

        await requestCreatePreviewProduct(data);
        message.success(`Đánh giá sản phẩm "${selectedProduct.name}" đã được gửi thành công!`);

        if (selectedProductIndex < currentOrder.product.length - 1) {
            setSelectedProductIndex(selectedProductIndex + 1);
            setRating(5);
            setReviewComment('');
        } else {
            setIsReviewModalOpen(false);
        }
    };

    const handleProductSelect = (index) => {
        setSelectedProductIndex(index);
        setRating(5);
        setReviewComment('');
    };

    const handleCancelOrder = async (orderId) => {
        try {
            await requestCancelOrder({ idOrder: orderId });
            fetchOrder();
            message.success(`Đơn hàng #${orderId} đã được huỷ thành công!`);
        } catch (error) {
            message.error(error.response.data.message);
        }
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: '_id',
            key: '_id',
            render: (id) => <span style={{ fontWeight: 600, color: '#1890ff' }}>#{id}</span>,
            width: 160,
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => {
                const formattedDate = new Date(date).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                });
                return <span>{formattedDate}</span>;
            },
            width: 140,
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
            render: (products) => (
                <div className={cx('order-products')}>
                    {products &&
                        products.map((item, index) => {
                            // Kiểm tra tất cả các khả năng của trường ảnh (images hoặc image)
                            const rawImages = item?.images || item?.image;
                            const imageList = typeof rawImages === 'string' ? rawImages.split(',') : rawImages;
                            const displayImage =
                                Array.isArray(imageList) && imageList.length > 0 ? imageList[0] : 'placehold.co';

                            return (
                                <div
                                    key={index}
                                    className={cx('order-product-item')}
                                    style={{ display: 'flex', marginBottom: '10px', gap: '10px' }}
                                >
                                    <img
                                        src={displayImage}
                                        alt={item.name}
                                        className={cx('product-thumbnail')}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            objectFit: 'cover',
                                            borderRadius: '4px',
                                        }}
                                        onError={(e) => {
                                            e.target.src = 'placehold.co';
                                        }}
                                    />
                                    <div>
                                        <div className={cx('product-name')} style={{ fontWeight: 500 }}>
                                            {item.name}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#666' }}>SL: {item.quantity}</div>
                                        <div style={{ fontWeight: 600, color: '#f56a00', marginTop: '4px' }}>
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(item.price)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => (
                <span style={{ fontWeight: 600, color: '#f56a00', fontSize: '15px' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                </span>
            ),
            width: 160,
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => {
                let icon = '💰';

                if (method === 'MOMO') {
                    icon = '📱';
                } else if (method === 'VNPAY') {
                    icon = '💳';
                }

                return (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>{icon}</span> {method}
                    </span>
                );
            },
            width: 120,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = '';
                let text = '';

                switch (status) {
                    case 'pending':
                        color = 'gold';
                        text = 'Chờ xác nhận';
                        break;
                    case 'confirmed':
                        color = 'blue';
                        text = 'Đã xác nhận';
                        break;
                    case 'shipped':
                        color = 'cyan';
                        text = 'Đang giao';
                        break;
                    case 'delivered':
                        color = 'green';
                        text = 'Đã giao';
                        break;
                    case 'cancelled':
                        color = 'red';
                        text = 'Đã huỷ';
                        break;
                    default:
                        color = 'default';
                        text = status;
                }

                return <Tag color={color}>{text}</Tag>;
            },
            width: 140,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => {
                if (record.status === 'delivered') {
                    return (
                        <Button type="primary" onClick={() => showReviewModal(record)} icon={<StarOutlined />}>
                            Đánh giá
                        </Button>
                    );
                } else if (record.status === 'pending') {
                    return (
                        <Popconfirm
                            title="Bạn chắc chắn muốn huỷ đơn hàng này?"
                            okText="Huỷ đơn"
                            cancelText="Đóng"
                            onConfirm={() => handleCancelOrder(record._id)}
                        >
                            <Button type="primary" danger icon={<CloseCircleOutlined />}>
                                Huỷ đơn hàng
                            </Button>
                        </Popconfirm>
                    );
                }
                return null;
            },
            width: 160,
            align: 'center',
        },
    ];

    return (
        <div className={cx('order-user-container')}>
            <Table columns={columns} dataSource={orders} rowKey="_id" pagination={{ pageSize: 5 }} loading={loading} />

            <Modal
                title="Đánh giá sản phẩm"
                open={isReviewModalOpen}
                onOk={handleReviewSubmit}
                onCancel={() => setIsReviewModalOpen(false)}
                okText={selectedProductIndex < currentOrder?.product.length - 1 ? 'Tiếp theo' : 'Gửi đánh giá'}
                cancelText="Đóng"
            >
                {currentOrder && (
                    <div className={cx('review-modal-content')}>
                        <h3 style={{ marginBottom: '16px' }}>
                            Mã đơn hàng: <span style={{ color: '#1890ff' }}>#{currentOrder._id}</span>
                        </h3>

                        <div className={cx('product-selection')} style={{ marginBottom: '20px' }}>
                            <h4 style={{ marginBottom: '12px' }}>Chọn sản phẩm để đánh giá:</h4>
                            <Radio.Group
                                onChange={(e) => handleProductSelect(e.target.value)}
                                value={selectedProductIndex}
                                style={{ width: '100%' }}
                            >
                                {currentOrder.product.map((item, index) => (
                                    <Radio
                                        key={index}
                                        value={index}
                                        className={cx('product-radio')}
                                        style={{ width: '100%', marginBottom: '8px' }}
                                    >
                                        <div
                                            className={cx('review-product-item')}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}
                                        >
                                            <img
                                                src={
                                                    item?.images
                                                        ? item.images.split(',')[0]
                                                        : item?.image || 'placehold.co'
                                                }
                                                alt={item.name}
                                                className={cx('product-thumbnail')}
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px',
                                                }}
                                                onError={(e) => {
                                                    e.target.src = 'placehold.co';
                                                }}
                                            />
                                            <div className={cx('review-product-info')}>
                                                <div className={cx('product-name')} style={{ fontWeight: 500 }}>
                                                    {item.name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                                    Số lượng: {item.quantity}
                                                </div>
                                            </div>
                                        </div>
                                    </Radio>
                                ))}
                            </Radio.Group>
                        </div>

                        {currentOrder.product.length > 0 && (
                            <div
                                className={cx('review-form')}
                                style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}
                            >
                                <h4 style={{ color: '#f56a00' }}>
                                    Đang đánh giá: {currentOrder.product[selectedProductIndex].name}
                                </h4>
                                <div className={cx('review-rating')} style={{ margin: '16px 0' }}>
                                    <div style={{ marginBottom: '8px' }}>Đánh giá của bạn:</div>
                                    <Rate value={rating} onChange={setRating} />
                                </div>
                                <div className={cx('review-comment')}>
                                    <div style={{ marginBottom: '8px' }}>Nhận xét:</div>
                                    <TextArea
                                        rows={4}
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default OrderUser;
