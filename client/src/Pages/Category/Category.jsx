import classNames from 'classnames/bind';
import styles from './Category.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import { Select } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { FilterOutlined } from '@ant-design/icons';
import useFetch from '../../hooks/useFetch';
import CardBody from '../../Components/CardBody/CardBody';
import Loading from '../../Components/Loading/Loading';
import slide_1 from '../../assets/images/slideShow/slideshow_1.jpg';
const cx = classNames.bind(styles);

function Category() {
    const [title, setTitle] = useState('');
    const [priceFilter, setPriceFilter] = useState('0');
    const [discountFilter, setDiscountFilter] = useState('0');
    const { id } = useParams();

    const url =
        id === 'all'
            ? `/api/get-all-product${priceFilter !== '0' ? `?price=${priceFilter}` : ''}${
                  discountFilter !== '0' ? `${priceFilter !== '0' ? '&' : '?'}discount=${discountFilter}` : ''
              }`
            : `/api/get-product-by-category?category=${id}${priceFilter !== '0' ? `&price=${priceFilter}` : ''}${
                  discountFilter !== '0' ? `&discount=${discountFilter}` : ''
              }`;

    const { data, error, loading, reFetch } = useFetch(url);

    useEffect(() => {
        const nameCategory = localStorage.getItem('nameCategory');
        setTitle(nameCategory);
        document.title = `${nameCategory} - Đẹp nhất 2025 `;
    }, [id]);

    const handlePriceChange = (value) => {
        setPriceFilter(value);
    };

    const handleDiscountChange = (value) => {
        setDiscountFilter(value);
    };

    // Re-fetch when filters change
    useEffect(() => {
        if (data) {
            reFetch();
        }
    }, [priceFilter, discountFilter]);

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>
            <main className={cx('container')}>
                <div className={cx('banner')}>
                    <img src={slide_1} alt="" />
                </div>

                <div className={cx('inner')}>
                    <h2>{title}</h2>

                    <div className={cx('filter')}>
                        <div className={cx('filter-title')}>
                            <FilterOutlined /> Bộ lọc
                        </div>
                        <div>
                            <Select
                                defaultValue="0"
                                style={{ width: 300, marginRight: 10 }}
                                onChange={handlePriceChange}
                                options={[
                                    { value: '0', label: 'Tất cả mức giá' },
                                    { value: '1', label: 'Dưới 1.000.000 VNĐ' },
                                    { value: '2', label: 'Từ 1.000.000 – 5.000.000 VNĐ' },
                                    { value: '3', label: 'Từ 5.000.000 – 20.000.000 VNĐ' },
                                    { value: '4', label: 'Trên 20.000.000 VNĐ' },
                                ]}
                            />
                            <Select
                                defaultValue="0"
                                style={{ width: 300, marginRight: 10 }}
                                onChange={handleDiscountChange}
                                options={[
                                    { value: '0', label: 'Tất cả sản phẩm (có & không giảm giá)' },
                                    { value: 'all', label: 'Sản phẩm đang giảm giá' },
                                    { value: '1', label: 'Giảm từ 10% – 25%' },
                                    { value: '2', label: 'Giảm từ 25% – 50%' },
                                    { value: '3', label: 'Giảm từ 50% trở lên' },
                                ]}
                            />
                        </div>
                    </div>
                    {loading ? (
                        <Loading />
                    ) : (
                        <div className={cx('list-product')}>
                            {data && data.length > 0 ? (
                                data.map((product) => <CardBody key={product?._id} item={product} />)
                            ) : (
                                <div className={cx('no-result')}>
                                    <p>Không tìm thấy kết quả phù hợp với bộ lọc đã chọn.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Category;
