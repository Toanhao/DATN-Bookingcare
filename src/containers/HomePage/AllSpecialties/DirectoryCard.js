/** @format */

import React from 'react';
import computeImageUrl from '../../../utils/imageUtils';
import userAvatar from '../../../assets/images/user.svg';

const DirectoryCard = ({ type = 'specialty', item = {}, onClick = () => {}, language }) => {
  const imageUrl = computeImageUrl(item.image) || userAvatar;

  // compute display name (handle doctor positions)
  const getDisplayName = () => {
    if (type === 'doctor') {
      return item.fullName || 'Bác sĩ';
    }
    return item.name || item.title || '';
  };

  const handleClick = () => {
    if (type === 'doctor') {
      const docId =
        item.id || item.userId || item.doctorId || (item.accountId && item.accountId.id) || null;
      onClick('doctor', { id: docId });
    } else {
      onClick(type, item);
    }
  };

  return (
    <div className="section-customize" onClick={handleClick}>
      <div className="customize-border">
        <div className="outer-bg">
          <div
            className={`bg-image ${
              type === 'doctor' 
                ? 'section-outstanding-doctor' 
                : type === 'clinic' 
                ? 'section-medical-facility' 
                : type === 'handbook'
                ? 'section-handbook'
                : 'section-specialty'
            }`}
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        </div>
        <div className="position text-center">
          <div>{getDisplayName()}</div>
          {type === 'doctor' && (
            <div>Chuyên khoa : {item.specialtyName ? item.specialtyName : ''}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectoryCard;
