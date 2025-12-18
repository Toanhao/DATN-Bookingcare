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
        // Map dữ liệu từ backend mới sang format cũ
        const doctor = res.data;
        const mappedDoctor = {
          ...doctor.user,
          image: doctor.user?.image || '',
          Doctor_Info: {
            description: doctor.title || '',
            descriptionHTML: doctor.bio || '',
            descriptionMarkdown: doctor.bio || '',
            clinicId: doctor.clinicId,
            specialtyId: doctor.specialtyId,
          },
          positionData: {
            valueVi: 'Bác sĩ',
            valueEn: 'Doctor',
          },
        };
        this.setState({ detailDoctor: mappedDoctor });
      }
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {}

  render() {
    let { detailDoctor } = this.state;
    let { language } = this.props;
    let name = `${detailDoctor.lastName} ${detailDoctor.firstName}`;
    let nameVi = '';
    let nameEn = '';
    if (detailDoctor && detailDoctor.positionData) {
      nameVi = `${detailDoctor.positionData.valueVi}, ${name}`;
      nameEn = `${detailDoctor.positionData.valueEn}, ${name}`;
    }
    return (
      <>
        <HomeHeader isShowBanner={false} />
        <div className="doctor-detail-container">
          <div className="intro-doctor">
            <div
              className="content-left"
              style={{
                backgroundImage: `url(${
                  detailDoctor && detailDoctor.image ? detailDoctor.image : ''
                })`,
              }}
            ></div>
            <div className="content-right">
              <div className="up">
                {language === LANGUAGES.VI ? nameVi : nameEn}
              </div>
              <div className="down">
                {detailDoctor &&
                  detailDoctor.Doctor_Info &&
                  detailDoctor.Doctor_Info.description && (
                    <span>{detailDoctor.Doctor_Info.description}</span>
                  )}
              </div>
            </div>
          </div>
          <div className="schedule-doctor">
            <div className="content-left">
              <DoctorSchedule doctorIdFromParent={this.state.currentDoctorId} />
            </div>
            <div className="content-right">
              <DoctorExtraInfor
                doctorIdFromParent={this.state.currentDoctorId}
              />
            </div>
          </div>

          <div className="detail-Infor-doctor">
            {detailDoctor &&
              detailDoctor.Doctor_Info &&
              detailDoctor.Doctor_Info.descriptionHTML && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: detailDoctor.Doctor_Info.descriptionHTML,
                  }}
                ></div>
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
