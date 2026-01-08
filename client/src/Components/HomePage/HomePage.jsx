import classNames from 'classnames/bind';
import styles from './HomePage.module.scss';
import Slide from './Slide/Slide';
import ProductNew from './ProductNew/ProductNew';
import SuggestProduct from './SuggestProduct/SuggestProduct';
import ProductReview from './ProductReview/ProductReview';

const cx = classNames.bind(styles);

function HomePage() {
    return (
        <div className={cx('wrapper')}>
            <div>
                <Slide />
            </div>

            <div className={cx('inner')}>
                <div>
                    <div className={cx('header')}>
                        <h2>Sản phẩm mới</h2>
                    </div>
                    <ProductNew />
                </div>

                <div>
                    <SuggestProduct />
                </div>

                <div>
                    <ProductReview />
                </div>
            </div>
        </div>
    );
}

export default HomePage;
