import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Rate, Input, message, Radio } from 'antd';
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
                        product: order.products,
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
                    {products.map((item, index) => (
                        <div key={index} className={cx('order-product-item')}>
                            <img
                                src={item?.images?.split(',')[0]}
                                alt={item.name}
                                className={cx('product-thumbnail')}
                            />
                            <div>
                                <div className={cx('product-name')}>{item.name}</div>
                                <div style={{ fontSize: '13px', color: '#666' }}>SL: {item.quantity}</div>
                                <div style={{ fontWeight: 600, color: '#f56a00', marginTop: '4px' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                        item.price,
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
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
                        <Button
                            type="primary"
                            danger
                            onClick={() => handleCancelOrder(record._id)}
                            icon={<CloseCircleOutlined />}
                        >
                            Huỷ đơn hàng
                        </Button>
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
                okText="Gửi đánh giá"
                cancelText="Đóng"
            >
                {currentOrder && (
                    <div className={cx('review-modal-content')}>
                        <h3>Mã đơn hàng: #{currentOrder._id}</h3>

                        <div className={cx('product-selection')}>
                            <h4>Chọn sản phẩm để đánh giá:</h4>
                            <Radio.Group
                                onChange={(e) => handleProductSelect(e.target.value)}
                                value={selectedProductIndex}
                            >
                                {currentOrder.product.map((item, index) => (
                                    <Radio key={index} value={index} className={cx('product-radio')}>
                                        <div className={cx('review-product-item')}>
                                            <img
                                                src={item?.images?.split(',')[0]}
                                                alt={item.name}
                                                className={cx('product-thumbnail')}
                                            />
                                            <div className={cx('review-product-info')}>
                                                <div className={cx('product-name')}>{item.name}</div>
                                                <div>SL: {item.quantity}</div>
                                            </div>
                                        </div>
                                    </Radio>
                                ))}
                            </Radio.Group>
                        </div>

                        {currentOrder.product.length > 0 && (
                            <div className={cx('review-form')}>
                                <h4>Đánh giá sản phẩm: {currentOrder.product[selectedProductIndex].name}</h4>
                                <div className={cx('review-rating')}>
                                    <div>Đánh giá của bạn:</div>
                                    <Rate value={rating} onChange={setRating} />
                                </div>
                                <div className={cx('review-comment')}>
                                    <div>Nhận xét:</div>
                                    <TextArea
                                        rows={4}
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="Nhập nhận xét của bạn về sản phẩm..."
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
