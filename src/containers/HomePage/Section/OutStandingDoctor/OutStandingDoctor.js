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
import {
  getDetailInforDoctor,
  getAllSpecialty,
} from '../../../../services/userService';
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
      // enrich doctors with specialty name (use doctor id -> Doctor_Infor.specialtyId)
      this.enrichDoctorsWithSpecialty(this.props.topDoctorsRedux);
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
      if (res && res.data && res.data.errCode === 0) {
        this.setState({ specialties: res.data.data });
      } else if (res && Array.isArray(res.data)) {
        this.setState({ specialties: res.data });
      } else if (Array.isArray(res)) {
        this.setState({ specialties: res });
      }
    } catch (e) {
      console.error('loadAllSpecialties error:', e);
    }
  };

  enrichDoctorsWithSpecialty = async (doctors) => {
    if (!doctors || doctors.length === 0) {
      this.setState({ arrDoctors: [] });
      return;
    }

    try {
      // fetch details for each doctor in parallel
      const detailPromises = doctors.map((d) => getDetailInforDoctor(d.id));
      const responses = await Promise.all(detailPromises);

      const specialties = this.state.specialties || [];

      const enriched = doctors.map((doc, idx) => {
        const res = responses[idx];
        let specialtyName = '';
        try {
          if (
            res &&
            (res.errCode === 0 || (res.data && res.data.errCode === 0))
          ) {
            const payload = res.data ? res.data.data || res.data : res.data;
            const info =
              (payload && payload.Doctor_Infor) ||
              (res.data && res.data.Doctor_Infor) ||
              null;
            const specialtyId =
              info && info.specialtyId ? info.specialtyId : null;
            if (specialtyId) {
              const found = specialties.find(
                (s) =>
                  s.id === specialtyId ||
                  s.id === +specialtyId ||
                  String(s.id) === String(specialtyId)
              );
              if (found) {
                specialtyName =
                  found.name || found.nameVi || found.nameEn || '';
              }
            }
          }
        } catch (e) {
          // ignore per-doctor errors
        }

        return {
          ...doc,
          specialtyName: specialtyName,
        };
      });

      this.setState({ arrDoctors: enriched });
    } catch (e) {
      this.setState({ arrDoctors: doctors });
    }
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
              <FormattedMessage id="homepage.more-infor" />
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
