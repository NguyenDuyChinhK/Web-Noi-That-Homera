import Slider from 'react-slick';
import classNames from 'classnames/bind';
import styles from './Slide.module.scss';
import slide_1 from '../../../assets/images/slideShow/slideshow_1.jpg';
import slide_2 from '../../../assets/images/slideShow/slideshow_2.jpg';
import slide_3 from '../../../assets/images/slideShow/slideshow_3.jpg';
const cx = classNames.bind(styles);
var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
};

function Slide() {
    return (
        <div className={cx('wrapper')}>
            <Slider {...settings}>
                <div>
                    <img src={slide_1} alt="" />
                </div>
                <div>
                    <img src={slide_2} alt="" />
                </div>

                <div>
                    <img src={slide_3} alt="" />
                </div>
            </Slider>
        </div>
    );
}

export default Slide;
