import { Component } from 'react';
import { connect } from 'react-redux';
import { postCancelBooking } from '../../services/userService';
import HomeHeader from '../HomePage/HomeHeader/HomeHeader';
import './CancelBooking.scss';

class CancelBooking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statusCancel: false,
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
          statusCancel: true,
          errCode: -1,
          message: 'Token không hợp lệ',
        });
        return;
      }

      try {
        let res = await postCancelBooking(token);

        if (res && res.booking) {
          this.setState({
            statusCancel: true,
            errCode: 0,
            message: res?.message || 'Huỷ lịch hẹn thành công!',
          });
        } else {
          this.setState({
            statusCancel: true,
            errCode: -1,
            message: res?.message || 'Lịch hẹn không tồn tại hoặc đã huỷ!',
          });
        }
      } catch (error) {
        this.setState({
          statusCancel: true,
          errCode: -1,
          message: 'Lỗi huỷ lịch hẹn. Vui lòng thử lại!',
        });
        console.error('Error canceling appointment:', error);
      }
    }
  }

  render() {
    let { statusCancel, errCode, message } = this.state;

    return (
      <>
        <HomeHeader />
        <div className="cancel-booking-container">
          {statusCancel === false ? (
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

export default connect(mapStateToProps, mapDispatchToProps)(CancelBooking);
