import React from 'react';

const BotIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,2A10,10,0,0,0,2,12a10,10,0,0,0,10,10,10,10,0,0,0,10-10A10,10,0,0,0,12,2Zm4,14H8a1,1,0,0,1,0-2h8a1,1,0,0,1,0,2ZM15.5,11.5A1.5,1.5,0,1,1,14,10,1.5,1.5,0,0,1,15.5,11.5Zm-7,0A1.5,1.5,0,1,1,7,10,1.5,1.5,0,0,1,8.5,11.5Z"/>
    </svg>
);

export default BotIcon;