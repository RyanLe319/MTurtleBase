import React from 'react';
import './Notification.css';

function Notification({ message, type }) {
  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        {message}
      </div>
    </div>
  );
}

export default Notification;