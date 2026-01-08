import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
import logobct from '../../assets/images/Logos/logo_bct.png';
import logodmca from '../../assets/images/Logos/dmca_protected_18_120.png';
const cx = classNames.bind(styles);

function Footer() {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('column')}>
                    <h3 className={cx('title')}>NỘI THẤT Homera</h3>
                    <p className={cx('description')}>
                        Chúng tôi đề cao sự bền vững và chất lượng vượt trội. Homera chuyên cung cấp nội thất được chế
                        tác từ các vật liệu chọn lọc, có nguồn gốc rõ ràng . Mỗi sản phẩm đều trải qua quy trình kiểm
                        soát chất lượng nghiêm ngặt, đảm bảo mang đến cho khách hàng Việt Nam những món đồ nội thất
                        không chỉ đẹp mà còn có tuổi thọ cao.
                    </p>
                    <div className={cx('certification')}>
                        <img src={logobct} alt="Đã thông báo Bộ Công Thương" />
                        <img src={logodmca} alt="Protected by DMCA" />
                    </div>
                </div>

                <div className={cx('column')}>
                    <h3 className={cx('title')}>DỊCH VỤ</h3>
                    <ul className={cx('service-list')}>
                        <li>
                            <a href="#">Chính Sách Bán Hàng</a>
                        </li>
                        <li>
                            <a href="#">Chính Sách Giao Hàng & Lắp Đặt</a>
                        </li>
                        <li>
                            <a href="#">Chính Sách Bảo Hành & Bảo Trì</a>
                        </li>
                        <li>
                            <a href="#">Chính Sách Đổi Trả</a>
                        </li>
                        <li>
                            <a href="#">Khách Hàng Thân Thiết – Homeramie</a>
                        </li>
                        <li>
                            <a href="#">Chính Sách Đối Tác Bán Hàng</a>
                        </li>
                    </ul>
                </div>

                <div className={cx('column')}>
                    <h3 className={cx('title')}>THÔNG TIN LIÊN HỆ</h3>
                    <div className={cx('contact-info')}>
                        <div className={cx('location')}>
                            <p className={cx('location-title')}>
                                <strong>[Khu Vực Hà Nội]</strong>
                            </p>
                            <p>xã Hữu Bằng, huyện Thạch Thất, thành phố Hà Nội.</p>
                            <p className={cx('hotline')}>Hotline: 0961 099 035 </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;
