import React from 'react';
import styled, { css } from 'styled-components';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false,
  type = 'button',
  disabled = false,
  onClick,
  ...rest 
}) => {
  return (
    <StyledButton 
      variant={variant} 
      size={size} 
      fullWidth={fullWidth}
      type={type}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

const getVariantStyles = (variant) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: var(--primary-color);
        color: white;
        
        &:hover:not(:disabled) {
          background-color: #4a5cd0;
        }
      `;
    case 'secondary':
      return css`
        background-color: var(--secondary-color);
        color: white;
        
        &:hover:not(:disabled) {
          background-color: #6d7e97;
        }
      `;
    case 'success':
      return css`
        background-color: var(--success-color);
        color: white;
        
        &:hover:not(:disabled) {
          background-color: #26b179;
        }
      `;
    case 'danger':
      return css`
        background-color: var(--danger-color);
        color: white;
        
        &:hover:not(:disabled) {
          background-color: #ec2147;
        }
      `;
    case 'outline':
      return css`
        background-color: transparent;
        color: var(--primary-color);
        border: 1px solid var(--primary-color);
        
        &:hover:not(:disabled) {
          background-color: rgba(94, 114, 228, 0.1);
        }
      `;
    case 'text':
      return css`
        background-color: transparent;
        color: var(--primary-color);
        box-shadow: none;
        
        &:hover:not(:disabled) {
          background-color: rgba(94, 114, 228, 0.1);
        }
      `;
    default:
      return css`
        background-color: var(--primary-color);
        color: white;
      `;
  }
};

const getSizeStyles = (size) => {
  switch (size) {
    case 'small':
      return css`
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
      `;
    case 'medium':
      return css`
        padding: 0.625rem 1.25rem;
        font-size: 0.875rem;
      `;
    case 'large':
      return css`
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
      `;
    default:
      return css`
        padding: 0.625rem 1.25rem;
        font-size: 0.875rem;
      `;
  }
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  font-weight: 600;
  transition: all 0.15s ease;
  cursor: pointer;
  border: none;
  box-shadow: var(--shadow);
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  
  ${({ variant }) => getVariantStyles(variant)}
  ${({ size }) => getSizeStyles(size)}
  
  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
  
  &:focus {
    outline: none;
  }
`;

export default Button; 