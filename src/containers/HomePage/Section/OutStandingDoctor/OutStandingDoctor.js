/** @format */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Slider from 'react-slick';
import computeImageUrl from '../../../../utils/imageUtils';
import userAvatar from '../../../../assets/images/user.svg';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { getAllDoctors } from '../../../../services/userService';
class OutStandingDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arrDoctors: [],
    };
  }

  componentDidMount() {
    this.fetchDoctors();
  }

  fetchDoctors = async () => {
    try {
      const res = await getAllDoctors();
      const raw = res?.data || res;
      const list = raw?.data || raw || [];

      const normalized = (list || []).map((doc) => {
        const user = doc.user || {};
        return {
          id: doc.id,
          fullName: user.fullName,
          image: user.image,
          title: doc.title,
          specialtyName: doc.specialty?.name,
          clinicName: doc.clinic?.name,
        };
      });

      this.setState({ arrDoctors: normalized });
    } catch (e) {
      console.error('fetchDoctors error:', e);
      this.setState({ arrDoctors: [] });
    }
  };

  handleViewDetailDoctor = (doctor) => {
    if (this.props.history) {
      this.props.history.push(`/detail-doctor/${doctor.id}`);
    }
  };

  render() {
    let arrDoctors = this.state.arrDoctors;
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
                  const displayName = item.fullName || 'Bác sĩ';
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
                          <div>{displayName}</div>
                          <div>
                            Chuyên khoa :{' '}
                            {item.specialtyName ? item.specialtyName : ''}
                          </div>
                          {item.clinicName && <div>{item.clinicName}</div>}
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(OutStandingDoctor)
);
