import { Component } from 'react';
import { connect } from 'react-redux';
import { postConfirmBooking } from '../../services/userService';
import HomeHeader from '../HomePage/HomeHeader/HomeHeader';
import './ConfirmBooking.scss';

class ConfirmBooking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statusConfirm: false,
      errCode: 0,
      message: '',
    };
  }

  async componentDidMount() {
    if (this.props.location && this.props.location.search) {
      let urlParams = new URLSearchParams(this.props.location.search);
      let token = urlParams.get('token');
      
      if (!token) {
        this.setState({
          statusConfirm: true,
          errCode: -1,
          message: 'Token không hợp lệ',
        });
        return;
      }

      try {
        let res = await postConfirmBooking(token);

        if (res && res.booking) {
          this.setState({
            statusConfirm: true,
            errCode: 0,
            message: res?.message || 'Xác nhận lịch hẹn thành công!',
          });
        } else {
          this.setState({
            statusConfirm: true,
            errCode: -1,
            message: res?.message || 'Lịch hẹn không tồn tại hoặc đã xác nhận!',
          });
        }
      } catch (error) {
        this.setState({
          statusConfirm: true,
          errCode: -1,
          message: 'Lỗi xác nhận lịch hẹn. Vui lòng thử lại!',
        });
        console.error('Error confirming appointment:', error);
      }
    }
  }

  render() {
    let { statusConfirm, errCode, message } = this.state;

    return (
      <>
        <HomeHeader />
        <div className="confirm-booking-container">
          {statusConfirm === false ? (
            <div className="loading-message">Đang xử lý...</div>
          ) : (
            <div>
              {+errCode === 0 ? (
                <div className="success-message">✅ {message}</div>
              ) : (
                <div className="error-message">❌ {message}</div>
              )}
            </div>
          )}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmBooking);
