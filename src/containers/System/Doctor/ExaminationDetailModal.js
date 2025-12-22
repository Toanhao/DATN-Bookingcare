/** @format */

import React, { Component } from 'react';
import './ExaminationDetailModal.scss';

class ExaminationDetailModal extends Component {
  formatCurrency = (amount) => {
    return amount
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(amount)
      : '---';
  };

  getDisplayValue = (value, fallback = '---') => value || fallback;

  renderPrescriptionItems = () => {
    const { bookingDetail } = this.props;
    const items = bookingDetail?.medicalRecord?.prescription?.items;

    if (!items || items.length === 0) {
      return <p className="no-data">Không có dữ liệu</p>;
    }

    return (
      <div className="table-responsive">
        <table className="detail-table">
          <thead>
            <tr>
              <th>Tên thuốc</th>
              <th>Số lượng</th>
              <th>Cách dùng</th>
              <th>Số ngày</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.medicine?.name || 'N/A'}</td>
                <td>{item.quantity}</td>
                <td>{item.usage}</td>
                <td>{item.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  render() {
    const { isOpen, onClose, bookingDetail } = this.props;

    if (!isOpen || !bookingDetail) return null;

    const patient = bookingDetail?.patient?.user;
    const medicalRecord = bookingDetail?.medicalRecord;
    const prescription = medicalRecord?.prescription;
    const bill = medicalRecord?.bill;
    const schedule = bookingDetail?.schedule;
    const doctor = schedule?.doctor?.user;
    const workDate = schedule?.workDate
      ? new Date(schedule.workDate).toLocaleDateString('vi-VN')
      : '---';

    return (
      <div className="exam-detail-overlay">
        <div className="exam-detail-modal">
          <div className="edm-header">
            <h2>Chi tiết khám bệnh</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="edm-body">
            {/* Thông tin bệnh nhân & lịch khám */}
            <div className="section">
              <h3 className="section-title">
                <i className="fas fa-user-circle"></i> Thông tin khám
              </h3>
              <table className="info-table">
                <tbody>
                  <tr>
                    <td className="label">Họ tên bệnh nhân</td>
                    <td className="value">{this.getDisplayValue(patient?.fullName)}</td>
                    <td className="label">Ngày khám</td>
                    <td className="value">{workDate}</td>
                  </tr>
                  <tr>
                    <td className="label">SĐT</td>
                    <td className="value">{this.getDisplayValue(patient?.phoneNumber)}</td>
                    <td className="label">Giờ khám</td>
                    <td className="value">{this.getDisplayValue(schedule?.timeSlot?.label)}</td>
                  </tr>
                  <tr>
                    <td className="label">Email</td>
                    <td className="value">{this.getDisplayValue(patient?.email)}</td>
                    <td className="label">Lý do khám</td>
                    <td className="value">{this.getDisplayValue(bookingDetail?.reason)}</td>
                  </tr>
                  <tr>
                    <td className="label">Giới tính</td>
                    <td className="value">{this.getDisplayValue(patient?.gender)}</td>
                    <td className="label">Bác sĩ</td>
                    <td className="value">{this.getDisplayValue(doctor?.fullName)}</td>
                  </tr>
                  <tr>
                    <td className="label">Địa chỉ</td>
                    <td className="value">{this.getDisplayValue(patient?.address)}</td>
                    <td className="label">Chuyên khoa</td>
                    <td className="value">{this.getDisplayValue(schedule?.doctor?.specialty?.name)}</td>
                  </tr>
                  <tr>
                    <td className="label">Phòng khám</td>
                    <td className="value">{this.getDisplayValue(schedule?.doctor?.clinic?.name)}</td>
                    <td className="label">Phí khám</td>
                    <td className="value">{this.formatCurrency(schedule?.doctor?.fee)}</td>
                  </tr>
                  <tr>
                    <td className="label">STT</td>
                    <td className="value">{this.getDisplayValue(bookingDetail?.queueNumber)}</td>
                    <td className="label">Trạng thái</td>
                    <td className="value">
                      <span
                        className={`status-badge status-${bookingDetail?.status?.toLowerCase()}`}
                      >
                        {this.getDisplayValue(bookingDetail?.status)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Hồ sơ bệnh án */}
            {medicalRecord && (
              <div className="section">
                <h3 className="section-title">
                  <i className="fas fa-file-medical"></i> Hồ sơ bệnh án
                </h3>
                <div className="record-box">
                  <div className="record-field">
                    <label>Chẩn đoán</label>
                    <p>{this.getDisplayValue(medicalRecord.diagnosis)}</p>
                  </div>
                  <div className="record-field">
                    <label>Kết luận</label>
                    <p>{this.getDisplayValue(medicalRecord.conclusion)}</p>
                  </div>
                  <div className="record-field">
                    <label>Ghi chú</label>
                    <p>{this.getDisplayValue(medicalRecord.note)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Đơn thuốc */}
            {prescription && (
              <div className="section">
                <h3 className="section-title">
                  <i className="fas fa-prescription-bottle"></i> Đơn thuốc
                </h3>
                <div className="prescription-items">
                  {this.renderPrescriptionItems()}
                </div>
                                {prescription.note && (
                  <div className="prescription-note">
                    <strong>Ghi chú:</strong> {prescription.note}
                  </div>
                )}
              </div>
            )}

            {/* Hóa đơn */}
            {bill && (
              <div className="section">
                <h3 className="section-title">
                  <i className="fas fa-receipt"></i> Hóa đơn
                </h3>
                <div className="bill-box">
                  <div className="bill-item">
                    <span>Phí khám (không bao gồm thuốc)</span>
                    <strong>{this.formatCurrency(bill.total)}</strong>
                  </div>
                  <div className="bill-item">
                    <span>Phương thức thanh toán</span>
                    <strong>{this.getDisplayValue(bill.method)}</strong>
                  </div>
                  <div className="bill-item">
                    <span>Trạng thái</span>
                    <strong>
                      <span className={`status-badge status-${bill.status?.toLowerCase()}`}>
                        {this.getDisplayValue(bill.status)}
                      </span>
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="edm-footer">
            <button className="close" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ExaminationDetailModal;
