/** @format */

import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import './AllDirectory.scss';
import '../HomePage.scss';
import HomeHeader from '../HomeHeader/HomeHeader';
import HomeFooter from '../HomeFooter/HomeFooter';
import {
  getAllSpecialty,
  getAllClinic,
  getAllDoctors,
  getAllHandbook,
} from '../../../services/userService';
import DirectoryCard from './DirectoryCard';
import { withRouter } from 'react-router';

const AllDirectory = (props) => {
  const [tab, setTab] = useState('specialty');
  const [specialties, setSpecialties] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [handbooks, setHandbooks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // read query param tab
    const params = new URLSearchParams(
      props.location ? props.location.search : window.location.search
    );
    const t = params.get('tab') || 'specialty';
    setTab(t);
  }, [props.location]);

  useEffect(() => {
    // fetch data for all tabs in parallel
    const fetchAll = async () => {
      try {
        const [r1, r2, r3, r4] = await Promise.all([
          getAllSpecialty(),
          getAllClinic(),
          getAllDoctors(),
          getAllHandbook(),
        ]);
        const normalize = (res) => {
          if (!res) return [];
          if (res.data && res.data.errCode === 0) return res.data.data || [];
          if (res.data && Array.isArray(res.data)) return res.data;
          if (Array.isArray(res)) return res;
          if (res.data) return res.data;
          return [];
        };

        const data1 = normalize(r1);
        const data2 = normalize(r2);
        const data3 = normalize(r3);
        const data4 = normalize(r4);

        setSpecialties(data1 || []);
        setClinics(data2 || []);
        setHandbooks(data4 || []);

        // Chuẩn hóa dữ liệu bác sĩ theo BE hiện tại: Doctor kèm user, specialty, clinic
        const normalizeDoctors = (doctorsList) => {
          if (!doctorsList || doctorsList.length === 0) return [];

          return doctorsList.map((doc) => {
            const user = doc.user || {};
            const specialty = doc.specialty || {};
            const clinic = doc.clinic || {};

            return {
              id: doc.id,
              title: doc.title,
              specialtyId: doc.specialtyId,
              specialtyName: specialty.name || doc.specialtyName || '',
              clinicName: clinic.name || doc.clinicName || '',
              fullName: user.fullName || doc.fullName || '',
              image: user.image || doc.image || '',
            };
          });
        };

        const normalizedDoctors = normalizeDoctors(data3 || []);
        setDoctors(normalizedDoctors || []);
      } catch (e) {
        // ignore errors for now
      }
    };
    fetchAll();
  }, []);

  const goDetail = (type, item) => {
    if (!props.history) return;
    if (type === 'specialty')
      props.history.push(`/detail-specialty/${item.id}`);
    if (type === 'clinic') props.history.push(`/detail-clinic/${item.id}`);
    if (type === 'doctor') props.history.push(`/detail-doctor/${item.id}`);
    if (type === 'handbook') props.history.push(`/detail-handbook/${item.id}`);
  };

  const renderSpecialtyGrid = (items = specialties) => (
    <div className="grid">
      {items.map((s, i) => (
        <DirectoryCard
          key={i}
          type="specialty"
          item={s}
          onClick={goDetail}
          language={props.language}
        />
      ))}
    </div>
  );

  const renderClinicGrid = (items = clinics) => (
    <div className="grid">
      {items.map((c, i) => (
        <DirectoryCard
          key={i}
          type="clinic"
          item={c}
          onClick={goDetail}
          language={props.language}
        />
      ))}
    </div>
  );

  const renderDoctorGrid = (items = doctors) => (
    <div className="grid">
      {items.map((d, i) => (
        <DirectoryCard
          key={i}
          type="doctor"
          item={d}
          onClick={goDetail}
          language={props.language}
        />
      ))}
    </div>
  );

  const renderHandbookGrid = (items = handbooks) => (
    <div className="grid">
      {items.map((h, i) => (
        <DirectoryCard
          key={i}
          type="handbook"
          item={h}
          onClick={goDetail}
          language={props.language}
        />
      ))}
    </div>
  );

  const renderGrid = () => {
    if (tab === 'specialty') return renderSpecialtyGrid();
    if (tab === 'clinic') return renderClinicGrid();
    if (tab === 'doctor') return renderDoctorGrid();
    if (tab === 'handbook') return renderHandbookGrid();
    return renderSpecialtyGrid();
  };

  const titleMap = {
    specialty: 'Tất cả chuyên khoa',
    clinic: 'Tất cả cơ sở y tế',
    doctor: 'Tất cả bác sĩ',
    handbook: 'Tất cả bài viết',
  };

  const pageTitle = titleMap[tab] || titleMap.specialty;
  return (
    <div className="all-directory-root">
      <HomeHeader />
      <div className="container page-body">
        {tab === 'all' && (
          <div className="all-search">
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder={
                props.language === 'vi'
                  ? 'Tìm kiếm chuyên khoa, cơ sở, bác sĩ, bài viết'
                  : 'Search specialties, facilities, doctors, handbooks'
              }
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">
                {props.language === 'vi' ? 'Tất cả' : 'All'}
              </option>
              <option value="specialty">
                {props.language === 'vi' ? 'Chuyên khoa' : 'Specialty'}
              </option>
              <option value="clinic">
                {props.language === 'vi' ? 'Cơ sở y tế' : 'Facility'}
              </option>
              <option value="doctor">
                {props.language === 'vi' ? 'Bác sĩ' : 'Doctor'}
              </option>
              <option value="handbook">
                {props.language === 'vi' ? 'Bài viết' : 'Handbook'}
              </option>
            </select>
          </div>
        )}

        <h2 className="page-title">{pageTitle}</h2>

        <div className="tab-content">
          {tab === 'all' ? (
            <div className="all-sections">
              {filterType === 'all' || filterType === 'specialty' ? (
                <section>
                  <h3 className="section-title">
                    {props.language === 'vi' ? 'Chuyên khoa' : 'Specialties'}
                  </h3>
                  {renderSpecialtyGrid(
                    specialties.filter((s) =>
                      s.name.toLowerCase().includes(searchText.toLowerCase())
                    )
                  )}
                </section>
              ) : null}

              {filterType === 'all' || filterType === 'clinic' ? (
                <section>
                  <h3 className="section-title">
                    {props.language === 'vi' ? 'Cơ sở y tế' : 'Facilities'}
                  </h3>
                  {renderClinicGrid(
                    clinics.filter((c) =>
                      (c.name || '')
                        .toLowerCase()
                        .includes(searchText.toLowerCase())
                    )
                  )}
                </section>
              ) : null}

              {filterType === 'all' || filterType === 'doctor' ? (
                <section>
                  <h3 className="section-title">
                    {props.language === 'vi' ? 'Bác sĩ' : 'Doctors'}
                  </h3>
                  {renderDoctorGrid(
                    doctors.filter((d) => {
                      const name = d.fullName || '';
                      const check = name.toLowerCase();
                      return (
                        check.includes(searchText.toLowerCase()) ||
                        (d.specialtyName || '')
                          .toLowerCase()
                          .includes(searchText.toLowerCase())
                      );
                    })
                  )}
                </section>
              ) : null}

              {filterType === 'all' || filterType === 'handbook' ? (
                <section>
                  <h3 className="section-title">
                    {props.language === 'vi' ? 'Cẩm nang' : 'Handbooks'}
                  </h3>
                  {renderHandbookGrid(
                    handbooks.filter((h) =>
                      (h.name || '')
                        .toLowerCase()
                        .includes(searchText.toLowerCase())
                    )
                  )}
                </section>
              ) : null}
            </div>
          ) : (
            renderGrid()
          )}
        </div>
      </div>
      <HomeFooter />
    </div>
  );
};

const mapStateToProps = (state) => ({ language: state.app.language });

export default withRouter(connect(mapStateToProps)(AllDirectory));
