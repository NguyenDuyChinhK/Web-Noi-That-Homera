import { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';

import {
    requestCreateProduct,
    requestDeleteProduct,
    requestGetAllCategory,
    requestGetAllProduct,
    requestUpdateProduct,
    requestUploadImage,
} from '../../../../config/request';

const { TextArea } = Input;

function ManagerProduct() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [categories, setCategories] = useState([]);
    z;
    useEffect(() => {
        const fetchCategories = async () => {
            const response = await requestGetAllCategory();
            setCategories(response.metadata);
        };
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await requestGetAllProduct();
            setProducts(response.metadata);
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu sản phẩm');
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSubmit = async (values) => {
        try {
            let imageUrls = [];

            const newImages = fileList.filter((file) => file.originFileObj);
            if (newImages.length > 0) {
                const formDataImage = new FormData();
                newImages.forEach((file) => {
                    formDataImage.append('images', file.originFileObj);
                });

                const resImages = await requestUploadImage(formDataImage);
                const existingImages = fileList.filter((file) => !file.originFileObj).map((file) => file.url);

                imageUrls = [...existingImages, ...resImages.images];
            } else {
                imageUrls = fileList.map((file) => file.url);
            }

            const dataSubmit = {
                ...values,
                images: imageUrls.join(','),
            };

            if (editingId) {
                dataSubmit.id = editingId;
                await requestUpdateProduct(dataSubmit);
                message.success('Cập nhật sản phẩm thành công');
            } else {
                await requestCreateProduct(dataSubmit);
                message.success('Thêm sản phẩm thành công');
            }

            setModalVisible(false);
            form.resetFields();
            setFileList([]);
            setEditingId(null);
            fetchProducts();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteProduct(id);
            message.success('Xóa sản phẩm thành công');
            fetchProducts();
        } catch (error) {
            message.error('Có lỗi khi xóa sản phẩm');
            console.error(error);
        }
    };

    const handleEdit = (record) => {
        setEditingId(record._id);
        form.setFieldsValue({
            name: record.name,
            price: record.price,
            discount: record.discount,
            description: record.description,
            category: record.categoryId,
            size: record.size,
            stock: record.stock,
        });

        if (record.images) {
            const imageFiles = record.images.split(',').map((url, index) => ({
                uid: `-${index}`,
                name: `image-${index}.jpg`,
                status: 'done',
                url,
            }));
            setFileList(imageFiles);
        }

        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setFileList([]);
        setModalVisible(true);
    };

    const uploadProps = {
        multiple: true,
        fileList,
        beforeUpload: () => false,
        onChange: (info) => setFileList(info.fileList),
        onRemove: (file) => {
            setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        },
    };

    const columns = [
        { title: 'Tên sản phẩm', dataIndex: 'name' },
        {
            title: 'Giá (VND)',
            dataIndex: 'price',
            render: (price) => new Intl.NumberFormat('vi-VN').format(price),
        },
        { title: 'Giảm giá (%)', dataIndex: 'discount' },
        { title: 'Danh mục', dataIndex: 'category' },
        { title: 'Tồn kho', dataIndex: 'stock' },
        {
            title: 'Hành động',
            render: (_, record) => (
                <Space>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDelete(record._id)}>
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                }}
            >
                <h2>Quản lý sản phẩm</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm sản phẩm
                </Button>
            </div>

            <Table columns={columns} dataSource={products} rowKey="_id" bordered />

            <Modal
                open={modalVisible}
                title={editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                footer={null}
                width={800}
                onCancel={() => setModalVisible(false)}
            >
                <Form layout="vertical" form={form} onFinish={handleSubmit}>
                    <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Giá" name="price" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="Giảm giá (%)" name="discount" rules={[{ required: true }]}>
                        <InputNumber min={0} max={100} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="Danh mục" name="category" rules={[{ required: true }]}>
                        <Select>
                            {categories.map((c) => (
                                <Select.Option key={c._id} value={c._id}>
                                    {c.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Kích thước" name="size" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Tồn kho" name="stock" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="Mô tả" name="description" rules={[{ required: true }]}>
                        <TextArea rows={7} placeholder="Nhập mô tả sản phẩm..." />
                    </Form.Item>

                    <Form.Item label="Hình ảnh" required>
                        <Upload listType="picture-card" {...uploadProps}>
                            <UploadOutlined />
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingId ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default ManagerProduct;
