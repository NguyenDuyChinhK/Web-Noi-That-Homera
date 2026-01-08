import classNames from 'classnames/bind';
import styles from './SuggestProduct.module.scss';
import CardBody from '../../CardBody/CardBody';

import { requestGetProductManufactured } from '../../../config/request';

import { useEffect, useState } from 'react';

const cx = classNames.bind(styles);

function SuggestProduct() {
    const [product, setProduct] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            const res = await requestGetProductManufactured();
            setProduct(res.metadata);
        };
        fetchProduct();
    }, []);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2>Sản phẩm được đề xuất</h2>
            </div>

            <div className={cx('product-list')}>
                {product.map((item) => (
                    <CardBody key={item._id} item={item} />
                ))}
            </div>
        </div>
    );
}

export default SuggestProduct;
