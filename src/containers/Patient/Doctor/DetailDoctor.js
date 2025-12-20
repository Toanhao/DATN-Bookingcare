import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import HomeHeader from '../../HomePage/HomeHeader/HomeHeader';
import './DetailDoctor.scss';
import { getDetailInforDoctor } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import DoctorSchedule from './DoctorSchedule';
import DoctorExtraInfor from './DoctorExtraInfor';
import HomeFooter from '../../HomePage/HomeFooter/HomeFooter';
class DetailDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailDoctor: {},
      currentDoctorId: -1,
    };
  }

  async componentDidMount() {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      let id = this.props.match.params.id;
      this.setState({
        currentDoctorId: id,
      });
      let res = await getDetailInforDoctor(id);
      if (res && res.errCode === 0 && res.data) {
        this.setState({ detailDoctor: res.data });
      }
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {}

  render() {
    let { detailDoctor } = this.state;
    let { language } = this.props;
    
    // Extract data from new API structure
    const user = detailDoctor?.user || {};
    const clinic = detailDoctor?.clinic || {};
    const specialty = detailDoctor?.specialty || {};
    
    let name = user.fullName || '';
    let nameVi = `Bác sĩ ${name}`;
    let nameEn = `Doctor ${name}`;
    
    return (
      <>
        <HomeHeader isShowBanner={false} />
        <div className="doctor-detail-container">
          <div className="intro-doctor">
            <div
              className="content-left"
              style={{
                backgroundImage: `url(${user.image || ''})`,
              }}
            ></div>
            <div className="content-right">
              <div className="up">
                {language === LANGUAGES.VI ? nameVi : nameEn}
              </div>
              <div className="down">
                {detailDoctor.title && (
                  <span>{detailDoctor.title}</span>
                )}
              </div>
              {specialty.name && (
                <div className="specialty-info">
                  <i className="fas fa-stethoscope"></i>
                  <span> Chuyên khoa: {specialty.name}</span>
                </div>
              )}
              {clinic.name && (
                <div className="clinic-info">
                  <i className="fas fa-hospital"></i>
                  <span> Phòng khám: {clinic.name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="schedule-doctor">
            <div className="content-left">
              <DoctorSchedule doctorIdFromParent={this.state.currentDoctorId} />
            </div>
            <div className="content-right">
              <DoctorExtraInfor
                doctorIdFromParent={this.state.currentDoctorId}
                detailDoctorFromParent={detailDoctor}
              />
            </div>
          </div>

          <div className="detail-Infor-doctor">
            {detailDoctor.bio && (
              <div>
                <h3>Thông tin chi tiết</h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: detailDoctor.bio,
                  }}
                ></div>
              </div>
            )}
          </div>

          
          <HomeFooter />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    systemMenuPath: state.app.systemMenuPath,
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailDoctor);
