/** @format */

import { Component } from 'react';
import { connect } from 'react-redux';
import './DetailSpecialty.scss';
import HomeHeader from '../../../HomePage/HomeHeader/HomeHeader';
import ProfileDoctor from '../../../Patient/Doctor/ProfileDoctor';
import DoctorSchedule from '../../../Patient/Doctor/DoctorSchedule';
import DoctorExtraInfor from '../../../Patient/Doctor/DoctorExtraInfor';
import { getAllDetailSpecialtyById } from '../../../../services/userService';
import _ from 'lodash';
import HomeFooter from '../../../HomePage/HomeFooter/HomeFooter';

class DetailSpecialty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arrDoctorId: [],
      dataDetailSpecialty: {},
    };
  }

  async componentDidMount() {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      let id = this.props.match.params.id;
      let res = await getAllDetailSpecialtyById({
        id: id,
      });

      if (res && res.success === true) {
        let data = res.data;
        let arrDoctorId = [];
        if (data && !_.isEmpty(res.data)) {
          let arr = data.doctors;
          if (arr && arr.length > 0) {
            arr.map((item) => {
              return arrDoctorId.push(item.id);
            });
          }
        }

        this.setState({
          dataDetailSpecialty: res.data,
          arrDoctorId: arrDoctorId,
        });
      }
    }
  }


  render() {
    let { arrDoctorId, dataDetailSpecialty } = this.state;
    // console.log('check state: ', this.state )
    return (
      <div className="detail-specialty-container">
        <HomeHeader />
        <div className="detail-specialty-body">
          <div className="description-specialty">
            {dataDetailSpecialty && !_.isEmpty(dataDetailSpecialty) && (
              <div
                dangerouslySetInnerHTML={{
                  __html: dataDetailSpecialty.description,
                }}
              ></div>
            )}
          </div>

          {arrDoctorId &&
            arrDoctorId.length > 0 &&
            arrDoctorId.map((item, index) => {
              return (
                <div className="each-doctor" key={index}>
                  <div className="dt-content-left">
                    <div className="profile-doctor">
                      <ProfileDoctor
                        doctorId={item}
                        isShowDescriptionDoctor={true}
                        isShowLinkDetail={true}
                        isShowPrice={false}
                        //dataTime ={dataTime}
                      />
                    </div>
                  </div>
                  <div className="dt-content-right">
                    <div className="doctor-schedule">
                      <DoctorSchedule doctorIdFromParent={item} />
                    </div>
                    <div className="doctor-extra-Info">
                      <DoctorExtraInfor doctorIdFromParent={item} />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <HomeFooter />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailSpecialty);
