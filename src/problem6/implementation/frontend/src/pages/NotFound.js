import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  text-align: center;
  padding: 4rem 0;
`;

const ErrorCode = styled.h1`
  font-size: 6rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
`;

const HomeLink = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 500;
  
  &:hover {
    background-color: var(--primary-hover);
    text-decoration: none;
  }
`;

function NotFound() {
  return (
    <NotFoundContainer>
      <ErrorCode>404</ErrorCode>
      <ErrorMessage>Page not found</ErrorMessage>
      <HomeLink to="/">Return to Home</HomeLink>
    </NotFoundContainer>
  );
}

export default NotFound;