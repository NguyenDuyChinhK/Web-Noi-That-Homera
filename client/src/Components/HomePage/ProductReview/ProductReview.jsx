import classNames from 'classnames/bind';
import styles from './ProductReview.module.scss';

import Slider from 'react-slick';

import { Rate } from 'antd';
import { useEffect, useState } from 'react';

import { requestGetPreviewProductHome } from '../../../config/request';

const cx = classNames.bind(styles);

var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
};

function ProductReview() {
    const [previewProduct, setPreviewProduct] = useState([]);

    useEffect(() => {
        const fetchPreviewProduct = async () => {
            const res = await requestGetPreviewProductHome();
            setPreviewProduct(res.metadata);
        };
        fetchPreviewProduct();
    }, []);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2>Đánh giá thực tế</h2>
            </div>
            <div>
                <Slider {...settings}>
                    {previewProduct.map((review) => (
                        <div className={cx('review')}>
                            <img src={review.product.image} alt="" />
                            <div className={cx('review-content')}>
                                <h3>{review.user.name}</h3>
                                <Rate disabled defaultValue={review.rating} />
                                <p>{review.content}</p>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
}

export default ProductReview;
