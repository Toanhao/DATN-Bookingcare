/** @format */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Slider from 'react-slick';
import * as actions from '../../../../store/actions';
import { LANGUAGES } from '../../../../utils';
import computeImageUrl from '../../../../utils/imageUtils';
import userAvatar from '../../../../assets/images/user.svg';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { getAllSpecialty } from '../../../../services/userService';
class OutStandingDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arrDoctors: [],
      specialties: [],
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.topDoctorsRedux !== this.props.topDoctorsRedux) {
      // Only enrich if specialties are already loaded
      if (this.state.specialties && this.state.specialties.length > 0) {
        this.enrichDoctorsWithSpecialty(this.props.topDoctorsRedux);
      }
    }
  }

  componentDidMount() {
    this.props.loadTopDoctors();
    // load specialties once so we can map specialtyId -> name
    this.loadAllSpecialties();
  }

  loadAllSpecialties = async () => {
    try {
      let res = await getAllSpecialty();
      // getAllSpecialty returns axios response; backend may wrap with errCode/data
      let specialtiesData = [];
      if (res && res.data && res.data.errCode === 0) {
        specialtiesData = res.data.data;
      } else if (res && Array.isArray(res.data)) {
        specialtiesData = res.data;
      } else if (Array.isArray(res)) {
        specialtiesData = res;
      }
      this.setState({ specialties: specialtiesData }, () => {
        // After specialties are loaded, re-enrich doctors if topDoctorsRedux is already available
        if (this.props.topDoctorsRedux && this.props.topDoctorsRedux.length > 0) {
          this.enrichDoctorsWithSpecialty(this.props.topDoctorsRedux);
        }
      });
    } catch (e) {
      console.error('loadAllSpecialties error:', e);
    }
  };

  enrichDoctorsWithSpecialty = (doctors) => {
    if (!doctors || doctors.length === 0) {
      this.setState({ arrDoctors: [] });
      return;
    }

    const specialties = this.state.specialties || [];

    const enriched = doctors.map((doc) => {
      let specialtyName = '';
      
      // Lấy specialtyId trực tiếp từ Doctor_Info (đã có sẵn trong topDoctorsRedux)
      const doctorInfo = doc.Doctor_Info || doc.Doctor_Infor;
      const specialtyId = doctorInfo && doctorInfo.specialtyId;
      
      if (specialtyId) {
        const found = specialties.find(
          (s) =>
            s.id === specialtyId ||
            s.id === +specialtyId ||
            String(s.id) === String(specialtyId)
        );
        if (found) {
          specialtyName = found.name || found.nameVi || found.nameEn || '';
        }
      }

      return {
        ...doc,
        specialtyName: specialtyName,
      };
    });

    this.setState({ arrDoctors: enriched });
  };

  handleViewDetailDoctor = (doctor) => {
    if (this.props.history) {
      this.props.history.push(`/detail-doctor/${doctor.id}`);
    }
  };

  render() {
    let arrDoctors = this.state.arrDoctors;
    let { language } = this.props;
    return (
      <div className="section-share section-outstanding-doctor">
        <div className="section-container">
          <div className="section-header">
            <span className="title-section">
              <FormattedMessage id="homepage.outstanding-doctor" />
            </span>
            <Link className="btn-section" to="/all-directory?tab=doctor">
              <FormattedMessage id="homepage.more-Infor" />
            </Link>
          </div>
          <div className="section-body section-outstanding-doctor">
            <Slider {...this.props.settings}>
              {arrDoctors &&
                arrDoctors.length > 0 &&
                arrDoctors.map((item, index) => {
                  const imageUrl = computeImageUrl(item.image) || userAvatar;
                  let nameVi = `${item.positionData.valueVi}, ${item.lastName} ${item.firstName} `;
                  let nameEn = `${item.positionData.valueEn}, ${item.lastName} ${item.firstName} `;
                  return (
                    <div
                      className="section-customize"
                      key={index}
                      onClick={() => this.handleViewDetailDoctor(item)}
                    >
                      <div className="customize-border">
                        <div className="outer-bg">
                          <div
                            className="bg-image section-outstanding-doctor"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                          />
                        </div>
                        <div className="position text-center">
                          <div>
                            {language === LANGUAGES.VI ? nameVi : nameEn}
                          </div>
                          <div>
                            Chuyên khoa :{' '}
                            {item.specialtyName ? item.specialtyName : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </Slider>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    isLoggedIn: state.user.isLoggedIn,
    topDoctorsRedux: state.admin.topDoctors,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadTopDoctors: () => dispatch(actions.fetchTopDoctor()),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OutStandingDoctor)
);
