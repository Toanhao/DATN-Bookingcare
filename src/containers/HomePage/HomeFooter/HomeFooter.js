import React, { Component } from 'react';
import { connect } from 'react-redux';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './HomeFooter.scss';
class HomeFooter extends Component {
  render() {
    return (
      <div className="home-footer">
        <div className="footer-container">
          {/* Company Info Section */}
          <div className="footer-section">
            <h3>Booking Care</h3>
            <p>Platform đặt lịch khám trực tuyến hàng đầu tại Việt Nam</p>
            <p>Giúp bạn kết nối với các bác sĩ tốt nhất một cách dễ dàng</p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Liên kết nhanh</h4>
            <ul>
              <li>
                <a href="#home">Trang chủ</a>
              </li>
              <li>
                <a href="#about">Về chúng tôi</a>
              </li>
              <li>
                <a href="#doctors">Danh sách bác sĩ</a>
              </li>
              <li>
                <a href="#contact">Liên hệ</a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h4>Dịch vụ</h4>
            <ul>
              <li>
                <a href="#specialty">Chuyên khoa</a>
              </li>
              <li>
                <a href="#booking">Đặt lịch khám</a>
              </li>
              <li>
                <a href="#history">Lịch sử khám</a>
              </li>
              <li>
                <a href="#support">Hỗ trợ</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Liên hệ</h4>
            <p>
              <i className="fa fa-map-marker"></i>
              Địa chỉ: Hà Đông, Hà Nội, Việt Nam
            </p>
            <p>
              <i className="fa fa-phone"></i>
              Hotline: 1900-xxxx
            </p>
            <p>
              <i className="fa fa-envelope"></i>
              Email: toannobi2k3@gmail.com
            </p>
            <div className="social-links">
              <a
                className="social facebook"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                aria-label="Facebook"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  aria-hidden="true"
                >
                  <path
                    fill="#fff"
                    d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.2V12h2.2V9.5c0-2.2 1.3-3.4 3.3-3.4.95 0 1.95.17 1.95.17v2.15h-1.1c-1.08 0-1.41.67-1.41 1.36V12h2.4l-.38 2.9h-2.02v7A10 10 0 0 0 22 12z"
                  />
                </svg>
              </a>

              <a
                className="social tiktok"
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                title="TikTok"
                aria-label="TikTok"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 256 256"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M185.3 58.9c-11.4-6.5-19.8-17.4-22.9-30.4h-23.5v118.6c0 16.1-13.1 29.2-29.2 29.2s-29.2-13.1-29.2-29.2S93.6 118 109.7 118c2.6 0 5.2.4 7.6 1.1V93.7c-2.5-.3-5.1-.5-7.6-.5-30.8 0-55.7 25-55.7 55.7s25 55.7 55.7 55.7 55.7-25 55.7-55.7V80c10.9 7.6 24.1 11.9 38.2 11.9V66.8c-7.1-.2-14.2-2-20.7-5.3z"
                    fill="#25F4EE"
                  />

                  <path
                    d="M185.3 58.9c-11.4-6.5-19.8-17.4-22.9-30.4h-23.5v118.6c0 16.1-13.1 29.2-29.2 29.2-10.7 0-20.2-5.7-25.5-14.2-2.7-4.4-4.2-9.5-4.2-15 0-16.1 13.1-29.2 29.2-29.2 2.6 0 5.2.4 7.6 1.1V93.7c-2.5-.3-5.1-.5-7.6-.5-30.8 0-55.7 25-55.7 55.7 0 24.7 16.1 45.6 38.4 52.8 5.5 1.8 11.4 2.8 17.6 2.8 30.8 0 55.7-25 55.7-55.7V80c10.9 7.6 24.1 11.9 38.2 11.9V66.8c-7.1-.2-14.2-2-20.7-5.3z"
                    fill="#FF0050"
                    opacity="0.9"
                  />

                  <path
                    d="M162.4 28.5h-23.5v118.6c0 16.1-13.1 29.2-29.2 29.2s-29.2-13.1-29.2-29.2S93.6 118 109.7 118c2.6 0 5.2.4 7.6 1.1V93.7c-2.5-.3-5.1-.5-7.6-.5-30.8 0-55.7 25-55.7 55.7s25 55.7 55.7 55.7 55.7-25 55.7-55.7V80c10.9 7.6 24.1 11.9 38.2 11.9V66.8c-22.8-.7-41.2-19.4-41.2-41.5z"
                    fill="#ffffff"
                  />
                </svg>
              </a>

              <a
                className="social youtube"
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                aria-label="YouTube"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  aria-hidden="true"
                >
                  <path
                    fill="#fff"
                    d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 0 0 .9 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .9 5.8 3 3 0 0 0 2.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM10 15.5v-7l6 3.5-6 3.5z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>
            &copy; 2025 Booking Care. Bảo lưu mọi quyền. |{' '}
            <a href="#privacy">Chính sách bảo mật</a> |{' '}
            <a href="#terms">Điều khoản sử dụng</a>
          </p>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeFooter);
