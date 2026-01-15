import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ManagerUser.module.scss';
import { Table, Switch, message, Typography, Space, Button } from 'antd';
import { requestGetAllUser, requestUpdateUser, requestUpdateUserAdmin, requestAuth } from '../../../../config/request';

const { Title } = Typography;
const cx = classNames.bind(styles);

function ManagerUser() {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState({});

    useEffect(() => {
        document.title = 'Quản lý tài khoản';
        fetchUsers();
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const res = await requestAuth();
            setCurrentUser(res.metadata);
        } catch (error) {
            console.error('Không lấy được thông tin user hiện tại');
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await requestGetAllUser();
            setUsers(response.metadata);
        } catch (error) {
            message.error('Không thể tải danh sách người dùng');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (checked, userId) => {
        setUpdateLoading((prev) => ({ ...prev, [userId]: true }));
        try {
            await requestUpdateUserAdmin({
                id: userId,
                isAdminUser: checked,
            });

            message.success('Cập nhật quyền thành công');
            fetchUsers();
        } catch (error) {
            const backendMessage = error.response?.data?.message || 'Cập nhật quyền thất bại';

            message.error(backendMessage);
        } finally {
            setUpdateLoading((prev) => ({ ...prev, [userId]: false }));
        }
    };

    const columns = [
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Quyền quản trị',
            render: (_, record) => {
                if (!currentUser) return null;

                const isSelf = currentUser._id === record._id;

                if (isSelf) {
                    return <span>—</span>; // hoặc "Bản thân"
                }

                return (
                    <Switch
                        checked={record.isAdmin}
                        onChange={(checked) => handleToggleAdmin(checked, record._id)}
                        loading={updateLoading[record._id]}
                        checkedChildren="Admin"
                        unCheckedChildren="User"
                    />
                );
            },
        },

        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (date ? new Date(date).toLocaleDateString() : ''),
        },
    ];

    return (
        <div className={cx('manager-user')}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div className={cx('header')}>
                    <Title level={4}>Quản lý người dùng</Title>
                </div>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng cộng ${total} người dùng`,
                    }}
                />
            </Space>
        </div>
    );
}

export default ManagerUser;
