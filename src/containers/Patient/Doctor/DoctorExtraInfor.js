/** @format */

import React, { Component } from 'react';
import './DoctorExtraInfor.scss';
import { connect } from 'react-redux';
import { LANGUAGES } from '../../../utils';
import { FormattedMessage } from 'react-intl';
import NumberFormat from 'react-number-format';
import { Link } from 'react-router-dom';
import { getDetailInforDoctor } from '../../../services/userService';

class DoctorExtraInfor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      extraInfor: {},
    };
  }

  async componentDidMount() {
    // Nếu có data từ parent, dùng luôn (tránh duplicate API call)
    if (this.props.detailDoctorFromParent) {
      this.updateExtraInfor(this.props.detailDoctorFromParent);
    } 
    // Nếu không có data nhưng có doctorId, tự gọi API
    else if (this.props.doctorIdFromParent) {
      let res = await getDetailInforDoctor(this.props.doctorIdFromParent);
      if (res && res.errCode === 0 && res.data) {
        this.updateExtraInfor(res.data);
      }
    }
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.language !== prevProps.language) {
    }

    if (this.props.detailDoctorFromParent !== prevProps.detailDoctorFromParent) {
      this.updateExtraInfor(this.props.detailDoctorFromParent);
    }

    // Nếu doctorId thay đổi và không có detailDoctorFromParent, tự gọi API
    if (
      this.props.doctorIdFromParent !== prevProps.doctorIdFromParent &&
      !this.props.detailDoctorFromParent &&
      this.props.doctorIdFromParent
    ) {
      let res = await getDetailInforDoctor(this.props.doctorIdFromParent);
      if (res && res.errCode === 0 && res.data) {
        this.updateExtraInfor(res.data);
      }
    }
  }

  updateExtraInfor = (doctor) => {
    if (doctor && doctor.clinicId) {
      const mappedData = {
        clinicId: doctor.clinicId,
        clinicData: doctor.clinic || {},
        priceTypeData: {
          valueVi: doctor.fee ? `${doctor.fee.toLocaleString('vi-VN')}` : '0',
          valueEn: doctor.fee ? `${doctor.fee}` : '0',
        },
      };
      this.setState({ extraInfor: mappedData });
    }
  };

  showHideDetailInfor = (status) => {
    this.setState({
      isShowDetailInfor: status,
    });
  };

  render() {
    let { extraInfor } = this.state;
    let { language } = this.props;

    return (
      <div className="doctor-extra-Infor-container">
        <div className="content-up">
          <div className="text-address">
            <FormattedMessage id="patient.extra-Infor-doctor.text-address" />
          </div>

          <div className="name-clinic">
            {extraInfor &&
            extraInfor.clinicData &&
            extraInfor.clinicData.name &&
            extraInfor.clinicId ? (
              <Link to={`/detail-clinic/${extraInfor.clinicId}`}>
                {extraInfor.clinicData.name}
              </Link>
            ) : (
              ''
            )}
          </div>
          <div className="detail-address">
            {extraInfor &&
            extraInfor.clinicData &&
            extraInfor.clinicData.address
              ? extraInfor.clinicData.address
              : ''}
          </div>
        </div>

        <div className="content-down">
          <div className="short-Infor">
            <FormattedMessage id="patient.extra-Infor-doctor.price" />
            {extraInfor &&
              extraInfor.priceTypeData &&
              language === LANGUAGES.VI && (
                <NumberFormat
                  className="currency"
                  value={extraInfor.priceTypeData.valueVi}
                  displayType="text"
                  thousandSeparator={true}
                  suffix={'VND'}
                />
              )}

            {extraInfor &&
              extraInfor.priceTypeData &&
              language === LANGUAGES.EN && (
                <NumberFormat
                  className="currency"
                  value={extraInfor.priceTypeData.valueEn}
                  displayType="text"
                  thousandSeparator={true}
                  suffix={'$'}
                />
              )}
          </div>
        </div>
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(DoctorExtraInfor);
