/** @format */

import React, { Component } from 'react';
import Select from 'react-select';
import { connect } from 'react-redux';
import './ManagePatient.scss';
import DatePicker from '../../../components/Input/DatePicker';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';
import ExaminationDetailModal from './ExaminationDetailModal';
import {
  getDoctorBookings,
  getBookingDetails,
  createMedicalRecord,
  createPrescription,
  createBill,
  payBill,
  getMedicines,
} from '../../../services/userService';

class ManagePatient extends Component {
  state = {
    currentDate: new Date(),
    activeTab: 'pending',
    loading: false,
    bookingsPending: [],
    bookingsHistory: [],
    showModal: false,
    showDetailModal: false,
    selectedDetailBooking: null,
    step: 1,
    isHistoryMode: false,
    selectedBooking: null,
    bookingDetail: null,
    diagnosis: '',
    conclusion: '',
    note: '',
    createdMedicalRecord: null,
    medicines: [],
    items: [{ medicineId: '', quantity: 1, usage: '', duration: 1 }],
    prescriptionNote: '',
    prescription: null,
    bill: null,
    payMethod: 'Tiền mặt',
  };

  componentDidMount() {
    this.loadBookings();
  }

  getDoctorId = () => {
    const { user } = this.props;
    return user?.doctorData?.id || user?.id;
  };

  formatDateParam = (dateObj) => {
    const d = new Date(dateObj);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  loadBookings = async () => {
    try {
      this.setState({ loading: true });
      const doctorId = this.getDoctorId();
      if (!doctorId) {
        toast.error('Không xác định được bác sĩ đăng nhập');
        return;
      }
      const workDate = this.formatDateParam(this.state.currentDate);

      const [pending, history] = await Promise.all([
        getDoctorBookings({ doctorId, workDate, status: 'CONFIRMED' }),
        getDoctorBookings({ doctorId, status: 'DONE' }),
      ]);

      this.setState({
        bookingsPending: pending || [],
        bookingsHistory: history || [],
      });
    } catch (e) {
      toast.error(e?.message || 'Không tải được danh sách lịch khám');
    } finally {
      this.setState({ loading: false });
    }
  };

  onDateChange = (date) => {
    const picked = Array.isArray(date) ? date[0] : date;
    this.setState({ currentDate: picked }, this.loadBookings);
  };

  openExamination = async (booking) => {
    try {
      this.setState({ loading: true });
      const [detail, meds] = await Promise.all([
        getBookingDetails(booking.id),
        getMedicines(),
      ]);
      
      const record = detail?.medicalRecord;
      const prescription = record?.prescription;
      const bill = record?.bill;
      const isHistoryMode = booking?.status === 'DONE' || this.state.activeTab === 'history';
      
      const prefetchedItems = prescription?.items?.length
        ? prescription.items.map(({ medicineId, quantity, usage, duration }) => ({
            medicineId,
            quantity,
            usage,
            duration,
          }))
        : [{ medicineId: '', quantity: 1, usage: '', duration: 1 }];

      this.setState({
        showModal: true,
        step: 1,
        isHistoryMode,
        selectedBooking: booking,
        bookingDetail: detail,
        diagnosis: record?.diagnosis || '',
        conclusion: record?.conclusion || '',
        note: record?.note || '',
        createdMedicalRecord: record,
        medicines: meds || [],
        items: prefetchedItems,
        prescriptionNote: prescription?.note || '',
        prescription,
        bill,
        payMethod: bill?.method && bill.method !== 'UNDEFINED' ? bill.method : 'Tiền mặt',
      });
    } catch (e) {
      toast.error(e?.message || 'Không mở được hồ sơ khám');
    } finally {
      this.setState({ loading: false });
    }
  };

  closeModal = () => {
    this.setState({
      showModal: false,
      selectedBooking: null,
      bookingDetail: null,
      step: 1,
      isHistoryMode: false,
      diagnosis: '',
      conclusion: '',
      note: '',
      createdMedicalRecord: null,
      items: [{ medicineId: '', quantity: 1, usage: '', duration: 1 }],
      prescriptionNote: '',
      prescription: null,
      bill: null,
    });
  };

  openDetailModal = async (booking) => {
    try {
      this.setState({ loading: true });
      const detail = await getBookingDetails(booking.id);
      this.setState({
        showDetailModal: true,
        selectedDetailBooking: detail,
      });
    } catch (e) {
      toast.error(e?.message || 'Không mở được chi tiết khám');
    } finally {
      this.setState({ loading: false });
    }
  };

  closeDetailModal = () => {
    this.setState({
      showDetailModal: false,
      selectedDetailBooking: null,
    });
  };

  prevStep = () => {
    this.setState((s) => ({ step: Math.max(1, s.step - 1) }));
  };

  nextStep = () => {
    const { step } = this.state;
    switch (step) {
      case 1:
        this.setState({ step: 2 });
        break;
      case 2:
        this.goNextMedical();
        break;
      case 3:
        this.goNextPrescription();
        break;
      case 4:
        this.finalizeExamination();
        break;
      default:
        break;
    }
  };

  handleStepClick = (targetStep) => {
    if (targetStep <= this.state.step) {
      this.setState({ step: targetStep });
    }
  };

  goNextMedical = () => {
    const { diagnosis, conclusion, isHistoryMode, createdMedicalRecord } =
      this.state;
    if (isHistoryMode || createdMedicalRecord?.id) {
      this.setState({ step: 3 });
      return;
    }
    if (!diagnosis || !conclusion) {
      toast.warn('Vui lòng nhập chẩn đoán và kết luận');
      return;
    }
    this.setState({ step: 3 });
  };

  addItemRow = () => {
    this.setState((s) => ({
      items: [
        ...s.items,
        { medicineId: '', quantity: 1, usage: '', duration: 1 },
      ],
    }));
  };

  updateItem = (index, field, value) => {
    this.setState((s) => {
      const items = [...s.items];
      items[index] = { ...items[index], [field]: value };
      return { items };
    });
  };

  removeItem = (index) => {
    this.setState((s) => ({
      items: s.items.filter((_, i) => i !== index),
    }));
  };

  validatePrescription = () => {
    const { items, prescriptionNote } = this.state;
    if (items.length === 0) {
      toast.warn('Vui lòng nhập đầy đủ đơn thuốc');
      return false;
    }
    const valid = items.every(
      (i) => i.medicineId && i.quantity > 0 && i.duration > 0 && i.usage
    );
    if (!valid) {
      toast.warn('Vui lòng nhập đầy đủ đơn thuốc');
      return false;
    }
    if (!prescriptionNote.trim()) {
      toast.warn('Vui lòng nhập ghi chú đơn thuốc');
      return false;
    }
    return true;
  };

  goNextPrescription = () => {
    const { isHistoryMode, prescription } = this.state;
    if (isHistoryMode || prescription?.id) {
      this.setState({ step: 4 });
      return;
    }
    if (this.validatePrescription()) {
      this.setState({ step: 4 });
    }
  };

  finalizeExamination = async () => {
    const {
      selectedBooking,
      diagnosis,
      conclusion,
      note,
      prescriptionNote,
      items,
      createdMedicalRecord,
      prescription,
      bill,
      payMethod,
      isHistoryMode,
    } = this.state;

    if (isHistoryMode) return;

    const needsMedical = !createdMedicalRecord?.id;
    const needsPrescription = !prescription?.id;

    if (needsMedical && (!diagnosis || !conclusion)) {
      toast.warn('Vui lòng nhập chẩn đoán và kết luận');
      return;
    }
    if (needsPrescription && !this.validatePrescription()) {
      return;
    }

    try {
      this.setState({ loading: true });
      let record = createdMedicalRecord;
      if (!record?.id) {
        const res = await createMedicalRecord({
          bookingId: selectedBooking.id,
          diagnosis,
          conclusion,
          note,
        });
        record = res?.data || res;
        this.setState({ createdMedicalRecord: record });
      }

      let rx = prescription;
      if (!rx?.id) {
        const res = await createPrescription({
          medicalRecordId: record.id,
          note: prescriptionNote,
          items,
        });
        rx = res?.data || res;
        this.setState({ prescription: rx });
      }

      let currentBill = bill;
      if (!currentBill) {
        const res = await createBill({
          medicalRecordId: record.id,
          method: 'UNDEFINED',
        });
        currentBill = res?.data || res;
      }
      if (currentBill?.status !== 'PAID') {
        const payRes = await payBill({
          billId: currentBill.id,
          method: payMethod,
        });
        currentBill = payRes?.data || payRes;
      }

      this.setState({ bill: currentBill });
      toast.success('Khám bệnh hoàn tất và đã thanh toán');
      this.closeModal();
      await this.loadBookings();
    } catch (e) {
      toast.error(e?.errMessage || e?.message || 'Lỗi khi hoàn tất khám');
    } finally {
      this.setState({ loading: false });
    }
  };

  renderHeader() {
    return (
      <div className="mp-header">
        <div className="mp-title">Quản lý bệnh nhân</div>
        <div className="mp-controls">
          {this.state.activeTab === 'pending' && (
            <div className="mp-date">
              <span>Ngày khám:</span>
              <DatePicker
                onChange={this.onDateChange}
                className="form-control"
                value={this.state.currentDate}
                minDate="today"
              />
            </div>
          )}
          <div className="mp-tabs">
            <button
              className={this.state.activeTab === 'pending' ? 'active' : ''}
              onClick={() => this.setState({ activeTab: 'pending' })}
            >
              Chưa khám
            </button>
            <button
              className={this.state.activeTab === 'history' ? 'active' : ''}
              onClick={() => this.setState({ activeTab: 'history' })}
            >
              Lịch sử khám
            </button>
          </div>
        </div>
      </div>
    );
  }

  formatDateTime = (booking) => {
    const workDate = booking.schedule?.workDate
      ? new Date(booking.schedule.workDate).toLocaleDateString('vi-VN')
      : '---';
    const timeSlot = booking.schedule?.timeSlot?.label || '---';
    return `${workDate} ${timeSlot}`;
  };

  renderTable(rows, isPending) {
    if (!rows?.length) {
      return (
        <table className="mp-table">
          <thead>
            <tr>
              <th>STT Khám</th>
              <th>Bệnh nhân</th>
              <th>Ngày giờ khám</th>
              <th>Lý do khám</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                Không có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      );
    }

    const sortedRows = [...rows].sort((a, b) => {
      const dateA = new Date(a.schedule?.workDate || 0);
      const dateB = new Date(b.schedule?.workDate || 0);
      return dateB - dateA;
    });

    return (
      <table className="mp-table">
        <thead>
          <tr>
            <th>STT Khám</th>
            <th>Bệnh nhân</th>
            <th>Ngày giờ khám</th>
            <th>Lý do khám</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((b) => (
            <tr key={b.id}>
              <td>{b.queueNumber} / {b.schedule?.maxPatient}</td>
              <td>{b.patient?.user?.fullName}</td>
              <td>{this.formatDateTime(b)}</td>
              <td>{b.reason}</td>
                <td>
                  {isPending ? (
                    <button
                      className="btn-primary"
                      onClick={() => this.openExamination(b)}
                    >
                      Kết quả
                    </button>
                  ) : (
                    <button
                      className="btn-secondary"
                      onClick={() => this.openDetailModal(b)}
                    >
                      Chi tiết
                    </button>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  }

  getStepClassName = (stepNumber) => {
    const { step } = this.state;
    if (step === stepNumber) return 'step active';
    if (step > stepNumber) return 'step done';
    return 'step';
  };

  renderModal() {
    const {
      showModal,
      step,
      diagnosis,
      conclusion,
      note,
      medicines,
      items,
      createdMedicalRecord,
      bill,
      payMethod,
      bookingDetail,
      isHistoryMode,
      prescription,
      prescriptionNote,
    } = this.state;
    if (!showModal) return null;
    const hasMedicalRecord = Boolean(createdMedicalRecord?.id);
    const hasPrescription = Boolean(prescription?.id);
    const isReadOnlyMR = isHistoryMode || hasMedicalRecord;
    const isReadOnlyRx = isHistoryMode || hasPrescription;
    const totalFee = bill?.total ?? bookingDetail?.schedule?.doctor?.fee ?? 0;
    const patientUser = bookingDetail?.patient?.user;
    const timeLabel = bookingDetail?.schedule?.timeSlot?.label;
    const workDate = bookingDetail?.schedule?.workDate
      ? new Date(bookingDetail.schedule.workDate).toLocaleDateString()
      : '';
    return (
      <div className="mp-modal-overlay">
        <div className="mp-modal">
          <div className="mp-modal-header">
            <div className="mp-steps steps-4">
              <div
                className={this.getStepClassName(1)}
                onClick={() => this.handleStepClick(1)}
              >
                <span className="step-number">1</span>
                <span className="step-label">Thông tin</span>
              </div>
              <div
                className={this.getStepClassName(2)}
                onClick={() => this.handleStepClick(2)}
              >
                <span className="step-number">2</span>
                <span className="step-label">Khám bệnh</span>
              </div>
              <div
                className={this.getStepClassName(3)}
                onClick={() => this.handleStepClick(3)}
              >
                <span className="step-number">3</span>
                <span className="step-label">Đơn thuốc</span>
              </div>
              <div
                className={this.getStepClassName(4)}
                onClick={() => this.handleStepClick(4)}
              >
                <span className="step-number">4</span>
                <span className="step-label">Hóa đơn</span>
              </div>
            </div>
            <button className="close" onClick={this.closeModal}>
              ×
            </button>
          </div>

          <div className="mp-modal-body">
            {step === 1 && (
              <div className="step-1">
                <table className="info-table">
                  <tbody>
                    <tr>
                      <td className="label">Họ tên</td>
                      <td className="value">
                        {patientUser?.fullName || '---'}
                      </td>
                      <td className="label">Ngày khám</td>
                      <td className="value">{workDate || '---'}</td>
                    </tr>
                    <tr>
                      <td className="label">Số điện thoại</td>
                      <td className="value">
                        {patientUser?.phoneNumber || '---'}
                      </td>
                      <td className="label">Giờ khám</td>
                      <td className="value">{timeLabel || '---'}</td>
                    </tr>
                    <tr>
                      <td className="label">Email</td>
                      <td className="value">{patientUser?.email || '---'}</td>
                      <td className="label">Lý do khám</td>
                      <td className="value">
                        {bookingDetail?.reason || '---'}
                      </td>
                    </tr>
                    <tr>
                      <td className="label">Giới tính</td>
                      <td className="value">{patientUser?.gender || '---'}</td>
                      <td className="label">STT</td>
                      <td className="value">
                        {bookingDetail?.queueNumber || '---'}
                      </td>
                    </tr>
                    <tr>
                      <td className="label">Địa chỉ</td>
                      <td className="value">{patientUser?.address || '---'}</td>
                      <td className="label">Bác sĩ</td>
                      <td className="value">
                        {bookingDetail?.schedule?.doctor?.user?.fullName ||
                          '---'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {step === 2 && (
              <div className="step-1">
                <div className="form-row">
                  <label>Chẩn đoán</label>
                  <input
                    value={diagnosis}
                    disabled={isReadOnlyMR}
                    onChange={(e) =>
                      this.setState({ diagnosis: e.target.value })
                    }
                  />
                </div>
                <div className="form-row">
                  <label>Kết luận</label>
                  <input
                    value={conclusion}
                    disabled={isReadOnlyMR}
                    onChange={(e) =>
                      this.setState({ conclusion: e.target.value })
                    }
                  />
                </div>
                <div className="form-row">
                  <label>Ghi chú</label>
                  <textarea
                    value={note}
                    disabled={isReadOnlyMR}
                    onChange={(e) => this.setState({ note: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-2">
                <div className="items">
                  <div className="items-header">
                    <div className="col-name">Tên thuốc *</div>
                    <div className="col-qty">Số lượng *</div>
                    <div className="col-usage">Cách dùng *</div>
                    <div className="col-duration">Số ngày *</div>
                    <div className="col-action"></div>
                  </div>
                  {items.map((it, idx) => (
                    <div className="item-row" key={idx}>
                      <div className="item-grid">
                        <div className="col-name">
                          <Select
                            className="item-select"
                            classNamePrefix="rs"
                            isDisabled={isReadOnlyRx}
                            placeholder="-- Chọn thuốc --"
                            options={medicines.map((m) => ({
                              value: m.id,
                              label: m.name,
                            }))}
                            value={
                              it.medicineId
                                ? {
                                    value: it.medicineId,
                                    label:
                                      medicines.find(
                                        (m) => m.id === it.medicineId
                                      )?.name || '',
                                  }
                                : null
                            }
                            onChange={(opt) =>
                              this.updateItem(
                                idx,
                                'medicineId',
                                opt ? opt.value : ''
                              )
                            }
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            menuPlacement="auto"
                          />
                        </div>
                        <div className="col-qty">
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            disabled={isReadOnlyRx}
                            onChange={(e) =>
                              this.updateItem(
                                idx,
                                'quantity',
                                Number(e.target.value)
                              )
                            }
                            placeholder="30"
                          />
                        </div>
                        <div className="col-usage">
                          <input
                            value={it.usage}
                            disabled={isReadOnlyRx}
                            onChange={(e) =>
                              this.updateItem(idx, 'usage', e.target.value)
                            }
                            placeholder="Ví dụ: 2 viên/lần"
                          />
                        </div>
                        <div className="col-duration">
                          <input
                            type="number"
                            min={1}
                            value={it.duration}
                            disabled={isReadOnlyRx}
                            onChange={(e) =>
                              this.updateItem(
                                idx,
                                'duration',
                                Number(e.target.value)
                              )
                            }
                            placeholder="7"
                          />
                        </div>
                        <div className="col-action">
                          {!isReadOnlyRx && (
                            <button
                              className="btn-danger btn-small"
                              onClick={() => this.removeItem(idx)}
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!isReadOnlyRx && (
                  <div className="actions">
                    <button className="btn-secondary" onClick={this.addItemRow}>
                      Thêm thuốc
                    </button>
                  </div>
                )}
                <div className="form-row">
                  <label>Ghi chú đơn thuốc</label>
                  <textarea
                    value={prescriptionNote}
                    disabled={isReadOnlyRx}
                    onChange={(e) =>
                      this.setState({ prescriptionNote: e.target.value })
                    }
                    placeholder="Ví dụ: Uống sau ăn, tránh dị ứng ..."
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="step-2">
                <div className="form-row">
                  <label>Phương thức thanh toán</label>
                  <select
                    value={payMethod}
                    onChange={(e) =>
                      this.setState({ payMethod: e.target.value })
                    }
                    disabled={bill?.status === 'PAID' || isHistoryMode}
                  >
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="MOMO">Momo</option>
                    <option value="Chuyển khoản">Chuyển khoản</option>
                  </select>
                </div>
                <div className="info">
                  {createdMedicalRecord && (
                    <div>
                      <div>Mã hồ sơ: {createdMedicalRecord.id}</div>
                      <div>Chẩn đoán: {createdMedicalRecord.diagnosis}</div>
                      <div>Kết luận: {createdMedicalRecord.conclusion}</div>
                    </div>
                  )}
                  <div className="bill-box">
                    <div className="bill-row">
                      <span>Phí khám (không bao gồm thuốc)</span>
                      <strong>{totalFee?.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    {bill && (
                      <div className="bill-row">
                        <span>Hóa đơn</span>
                        <strong>
                          #{bill.id} - {bill.status}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mp-modal-footer">
            {step > 1 && (
              <button className="btn-prev" onClick={this.prevStep}>
                <i className="fas fa-arrow-left" /> Quay lại
              </button>
            )}

            {step < 4 && (
              <button className="btn-next" onClick={this.nextStep}>
                Tiếp tục <i className="fas fa-arrow-right" />
              </button>
            )}

            {step === 4 && (
              <button
                className="btn-confirm"
                onClick={this.finalizeExamination}
                disabled={bill?.status === 'PAID' || isHistoryMode}
              >
                <i className="fas fa-check-circle" />
                {bill?.status === 'PAID' ? ' Đã thanh toán' : ' Hoàn thành'}
              </button>
            )}

            <button className="btn-cancel" onClick={this.closeModal}>
              Hủy bỏ
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      activeTab,
      bookingsPending,
      bookingsHistory,
      loading,
      showDetailModal,
      selectedDetailBooking,
    } = this.state;
    return (
      <LoadingOverlay active={loading} spinner text="Đang xử lý...">
        <div className="manage-patient-container">
          {this.renderHeader()}
          <div className="mp-content">
            {activeTab === 'pending' && this.renderTable(bookingsPending, true)}
            {activeTab === 'history' &&
              this.renderTable(bookingsHistory, false)}
          </div>
          {this.renderModal()}
          <ExaminationDetailModal
            isOpen={showDetailModal}
            bookingDetail={selectedDetailBooking}
            onClose={this.closeDetailModal}
          />
        </div>
      </LoadingOverlay>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ManagePatient);
