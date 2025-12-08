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
  getDetailInforDoctor,
} from '../../../services/userService';
import DirectoryCard from './DirectoryCard';
import { withRouter } from 'react-router';

const AllDirectory = (props) => {
  const [tab, setTab] = useState('specialty');
  const [specialties, setSpecialties] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
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
        const [r1, r2, r3] = await Promise.all([
          getAllSpecialty(),
          getAllClinic(),
          getAllDoctors(),
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

        setSpecialties(data1 || []);
        setClinics(data2 || []);

        // Enrich doctors with specialtyName (similar to OutStandingDoctor)
        const enrichDoctorsWithSpecialty = async (
          doctorsList,
          specialtiesList
        ) => {
          if (!doctorsList || doctorsList.length === 0) return [];
          try {
            const detailPromises = doctorsList.map((d) => {
              const id =
                d.id ||
                d.userId ||
                d.doctorId ||
                (d.accountId && d.accountId.id) ||
                null;
              return id ? getDetailInforDoctor(id) : Promise.resolve(null);
            });
            const responses = await Promise.all(detailPromises);

            return doctorsList.map((doc, idx) => {
              const res = responses[idx];
              let specialtyName = '';
              try {
                if (res) {
                  // response can be axios shape or raw
                  const payload = res.data ? res.data.data || res.data : res;
                  const Info =
                    (payload && payload.Doctor_Infor) ||
                    (res.data && res.data.Doctor_Infor) ||
                    null;
                  const specialtyId =
                    Info && Info.specialtyId ? Info.specialtyId : null;
                  if (specialtyId) {
                    const found = (specialtiesList || []).find(
                      (s) =>
                        s.id === specialtyId ||
                        s.id === +specialtyId ||
                        String(s.id) === String(specialtyId)
                    );
                    if (found)
                      specialtyName =
                        found.name || found.nameVi || found.nameEn || '';
                  }
                }
              } catch (e) {
                // ignore per-doctor errors
              }
              return {
                ...doc,
                specialtyName,
              };
            });
          } catch (e) {
            return doctorsList;
          }
        };

        const enrichedDoctors = await enrichDoctorsWithSpecialty(
          data3 || [],
          data1 || []
        );
        setDoctors(enrichedDoctors || []);
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

  const renderGrid = () => {
    if (tab === 'specialty') return renderSpecialtyGrid();
    if (tab === 'clinic') return renderClinicGrid();
    return renderDoctorGrid();
  };

  const titleMap = {
    specialty: 'Tất cả chuyên khoa',
    clinic: 'Tất cả cơ sở y tế',
    doctor: 'Tất cả bác sĩ',
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
                  ? 'Tìm kiếm chuyên khoa, cơ sở, bác sĩ'
                  : 'Search specialties, facilities, doctors'
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
                      const pos = d.positionData || d.position || {};
                      const name =
                        props.language === 'vi'
                          ? pos.valueVi
                            ? `${pos.valueVi}, ${d.lastName || ''} ${
                                d.firstName || ''
                              }`
                            : `${d.lastName || ''} ${d.firstName || ''}`
                          : pos.valueEn
                          ? `${pos.valueEn}, ${d.firstName || ''} ${
                              d.lastName || ''
                            }`
                          : `${d.firstName || ''} ${d.lastName || ''}`;
                      const check = (name || '').toLowerCase();
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
