import React from 'react';
import styled from 'styled-components';

const Input = ({ 
  label, 
  type = 'text', 
  id, 
  name, 
  value, 
  onChange, 
  placeholder, 
  error, 
  fullWidth = true,
  required = false,
  ...rest 
}) => {
  return (
    <InputWrapper fullWidth={fullWidth}>
      {label && <Label htmlFor={id}>{label}{required && <Required>*</Required>}</Label>}
      <StyledInput 
        type={type} 
        id={id} 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        hasError={!!error}
        required={required}
        {...rest} 
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
`;

const Required = styled.span`
  color: var(--danger-color);
  margin-left: 0.25rem;
`;

const StyledInput = styled.input`
  padding: 0.625rem;
  border: 1px solid ${({ hasError }) => (hasError ? 'var(--danger-color)' : '#e2e8f0')};
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  transition: all 0.15s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.3);
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const ErrorMessage = styled.p`
  color: var(--danger-color);
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

export default Input; 