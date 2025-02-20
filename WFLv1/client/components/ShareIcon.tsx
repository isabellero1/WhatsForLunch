// client/components/ShareIcon.tsx

import React from 'react';

const ShareIcon: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <svg
    className='cursor-pointer'
    onClick={onClick}
    width='24'
    height='24'
    strokeWidth='1.5'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M20 13V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V13'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M12 15V3M12 3L8.5 6.5M12 3L15.5 6.5'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export default ShareIcon;
