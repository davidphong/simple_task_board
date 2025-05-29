import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import Input from '../components/Input';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated, error, clearError, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    return () => clearError();
  }, [isAuthenticated, navigate, clearError]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validate = () => {
    const errors = {};
    
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      const success = await signup(formData.username, formData.email, formData.password);
      
      if (success) {
        setSignupSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    }
  };
  
  return (
    <SignupContainer>
      <SignupCard>
        <LogoContainer>
          <Logo>Task Board</Logo>
        </LogoContainer>
        
        <Title>Create an account</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {signupSuccess && (
          <SuccessMessage>
            Account created successfully! Redirecting to login...
          </SuccessMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            error={formErrors.username}
            required
          />
          
          <Input
            label="Email"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            error={formErrors.email}
            required
          />
          
          <Input
            label="Password"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            error={formErrors.password}
            required
          />
          
          <Input
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            error={formErrors.confirmPassword}
            required
          />
          
          <Button 
            type="submit" 
            fullWidth 
            disabled={isLoading || signupSuccess}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </Form>
        
        <LoginText>
          Already have an account? <StyledLink to="/login">Login</StyledLink>
        </LoginText>
      </SignupCard>
    </SignupContainer>
  );
};

const SignupContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
`;

const SignupCard = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 2rem;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--dark-color);
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ErrorMessage = styled.div`
  background-color: #fef2f2;
  color: var(--danger-color);
  padding: 0.75rem;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  background-color: #f0fdf4;
  color: var(--success-color);
  padding: 0.75rem;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const LoginText = styled.p`
  font-size: 0.875rem;
  text-align: center;
  color: var(--secondary-color);
`;

const StyledLink = styled(Link)`
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default Signup; 