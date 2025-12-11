import { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


class About extends Component {
    render() {
        return (
          <div className="section-share section-about">
            <div className="section-about-header title-section">
              <FormattedMessage id="homepage.about" />
            </div>
            <div className="section-about-content">
              <div className="content-left">
                <iframe
                  width="100%"
                  height="400px"
                  src="https://www.youtube.com/embed/OASGscJQXp0?si=k5eBw5c-STqeJ_g4"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="content-right">
                <p>
                  BookingCare là nền tảng nền tảng đặt lịch khám giúp bệnh nhân
                  có thể dễ dàng lựa chọn bác sĩ chuyên khoa phù hợp từ mạng
                  lưới bác sĩ giỏi, với thông tin đã xác thực và cách thức đặt
                  lịch nhanh chóng, thuận tiện, BookingCare đã chính thức đi vào
                  hoạt động từ tháng 7/2016. Hiện tại, BookingCare tập trung
                  phục vụ khách hàng khu vực miền Bắc (từ Hà Tĩnh trở ra), với
                  mạng lưới bác sĩ, cơ sở y tế tập trung ở Hà Nội.
                </p>
              </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(About);
