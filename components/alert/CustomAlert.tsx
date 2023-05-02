import React from 'react';
import styles from './Alert.module.css';

interface AlertProps {
  text: string;
  type?: 'success' | 'warning' | 'error';
}

const Alert: React.FC<AlertProps> = ({ text, type = 'success' }) => {
  const icon =
    type === 'success'
      ? '/success-icon.svg'
      : type === 'warning'
      ? '/warning-icon.svg'
      : '/error-icon.svg';

  return (
    <div className={`${styles.alert} ${styles[type]}`}>
      <img src={icon} alt={type} />
      <p>{text}</p>
    </div>
  );
};

export default Alert;
