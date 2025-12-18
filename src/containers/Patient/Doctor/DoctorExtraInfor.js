/** @format */

import React, { Component } from 'react';
import './DoctorExtraInfor.scss';
import { connect } from 'react-redux';
import { LANGUAGES } from '../../../utils';
import { getExtraInforDoctorById } from '../../../services/userService';
import { FormattedMessage } from 'react-intl';
import NumberFormat from 'react-number-format';
import { Link } from 'react-router-dom';

class DoctorExtraInfor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowDetailInfor: false,
      extraInfor: {},
    };
  }

  async componentDidMount() {
    if (this.props.doctorIdFromParent) {
      let res = await getExtraInforDoctorById(this.props.doctorIdFromParent);
      if (res && res.errCode === 0) {
        // Map dữ liệu từ backend mới sang format cũ
        const doctor = res.data;
        const mappedData = {
          clinicId: doctor.clinicId,
          clinicData: doctor.clinic || {},
          priceTypeData: {
            valueVi: doctor.fee ? `${doctor.fee.toLocaleString('vi-VN')}` : '0',
            valueEn: doctor.fee ? `${doctor.fee}` : '0',
          },
          paymentTypeData: {
            valueVi: 'Thanh toán sau khám',
            valueEn: 'Payment after examination',
          },
          note: doctor.title || '',
        };
        this.setState({ extraInfor: mappedData });
      }
    }
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.language !== prevProps.language) {
    }

    if (this.props.doctorIdFromParent !== prevProps.doctorIdFromParent) {
      let res = await getExtraInforDoctorById(this.props.doctorIdFromParent);
      if (res && res.errCode === 0) {
        // Map dữ liệu từ backend mới sang format cũ
        const doctor = res.data;
        const mappedData = {
          clinicId: doctor.clinicId,
          clinicData: doctor.clinic || {},
          priceTypeData: {
            valueVi: doctor.fee ? `${doctor.fee.toLocaleString('vi-VN')}` : '0',
            valueEn: doctor.fee ? `${doctor.fee}` : '0',
          },
          paymentTypeData: {
            valueVi: 'Thanh toán sau khám',
            valueEn: 'Payment after examination',
          },
          note: doctor.title || '',
        };
        this.setState({
          extraInfor: mappedData,
        });
      }
    }
  }

  showHideDetailInfor = (status) => {
    this.setState({
      isShowDetailInfor: status,
    });
  };

  render() {
    let { isShowDetailInfor, extraInfor } = this.state;
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
          {isShowDetailInfor === false && (
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

              <span
                className="detail"
                onClick={() => this.showHideDetailInfor(true)}
              >
                <FormattedMessage id="patient.extra-Infor-doctor.detail" />
              </span>
            </div>
          )}
          {isShowDetailInfor === true && (
            <>
              <div className="title-price">
                <FormattedMessage id="patient.extra-Infor-doctor.price" />
              </div>
              <div className="detail-Infor">
                <div className="price">
                  <span className="left">
                    <FormattedMessage id="patient.extra-Infor-doctor.price" />
                  </span>
                  <span className="right">
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
                  </span>
                </div>
                <div className="note">
                  {extraInfor && extraInfor.note ? extraInfor.note : ''}
                </div>
              </div>
              <div className="payment">
                <FormattedMessage id="patient.extra-Infor-doctor.payment" />

                {extraInfor &&
                extraInfor.paymentTypeData &&
                language === LANGUAGES.VI
                  ? extraInfor.paymentTypeData.valueVi
                  : ''}

                {extraInfor &&
                extraInfor.paymentTypeData &&
                language === LANGUAGES.EN
                  ? extraInfor.paymentTypeData.valueEn
                  : ''}
              </div>
              <div className="hide-price">
                <span onClick={() => this.showHideDetailInfor(false)}>
                  <FormattedMessage id="patient.extra-Infor-doctor.hide-price" />
                </span>
              </div>
            </>
          )}
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
