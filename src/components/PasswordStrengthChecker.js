import { passwordStrength } from 'check-password-strength'
import React from 'react';
import styled from 'styled-components';

const PasswordStrengthBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: #ccc;
  border-radius: 4px;
  position: relative;
`;

const StrengthBar = styled.div`
  height: 100%;
  border-radius: 4px;
  background-color: ${props => props.color};
  width: ${props => (props.strength+1) * 25}%;
  transition: width 0.3s ease-in-out;
`;

const PasswordStrengthChecker = ({ password }) => {

  const strength = passwordStrength(password).id;

  const getColor = (strength) => {
    console.log(strength);
    switch (strength) {
      case 0:
        return '#ff4d4d'; // Too weak (red)
      case 1:
        return '#ffb84d'; // Weak (orange)
      case 2:
        return '#ffd24d'; // Medium (yellow)
      case 3:
        return '#4dff4d'; // Strong (green)
      default:
        return '#ccc'; // Default (gray)
    }
  };

  const color = getColor(strength);

  return (
    <div>
      <p>Password Strength: {passwordStrength(password).value}</p>
      <PasswordStrengthBar>
        <StrengthBar strength={strength} color={color} />
      </PasswordStrengthBar>
    </div>
  );
};

export default PasswordStrengthChecker;