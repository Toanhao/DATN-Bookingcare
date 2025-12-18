/** @format */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Slider from 'react-slick';
import { getAllClinic } from '../../../../services/userService';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

class MedicalFacility extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataClinics: [],
    };
  }

  async componentDidMount() {
    try {
      // axios interceptor trả thẳng response.data
      let res = await getAllClinic();
      if (Array.isArray(res)) {
        this.setState({ dataClinics: res });
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  }

  handleViewDetailClinic = (clinic) => {
    if (this.props.history) {
      this.props.history.push(`/detail-clinic/${clinic.id}`);
    }
  };
  render() {
    let { dataClinics } = this.state;
    return (
      <div className="section-share section-medical-facility">
        <div className="section-container">
          <div className="section-header">
            <span className="title-section">
              <FormattedMessage id="homepage.facilities" />
            </span>
            <Link className="btn-section" to="/all-directory?tab=clinic">
              <FormattedMessage id="homepage.more-Infor" />
            </Link>
          </div>
          <div className="section-body section-medical-facility">
            <Slider {...this.props.settings}>
              {dataClinics &&
                dataClinics.length > 0 &&
                dataClinics.map((item, index) => {
                  return (
                    <div
                      className="section-customize"
                      key={index}
                      onClick={() => this.handleViewDetailClinic(item)}
                    >
                      <div className="customize-border">
                        <div className="outer-bg">
                          <div
                            className="bg-image section-medical-facility"
                            style={{ backgroundImage: `url(${item.image})` }}
                          />
                        </div>
                        <div className="position text-center">
                          <div className="specialty-name">{item.name}</div>
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
    isLoggedIn: state.user.isLoggedIn,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MedicalFacility)
);
