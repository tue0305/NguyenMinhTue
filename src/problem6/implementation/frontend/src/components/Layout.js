import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const Header = styled.header`
  background-color: white;
  box-shadow: var(--shadow-sm);
  padding: 1rem 0;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: var(--text-primary);
  font-weight: 500;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    color: var(--error-color);
  }
`;

const Main = styled.main`
  padding: 2rem 0;
`;

const Footer = styled.footer`
  text-align: center;
  padding: 2rem 0;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
  margin-top: 2rem;
`;

function Layout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <>
      <Header>
        <div className="container">
          <Nav>
            <Logo>
              <Link to="/">LiveScore</Link>
            </Logo>
            <NavLinks>
              <NavLink to="/">Leaderboard</NavLink>
              {currentUser ? (
                <>
                  <NavLink to="/game">Play Game</NavLink>
                  <LogoutButton onClick={handleLogout}>
                    Logout ({currentUser.username})
                  </LogoutButton>
                </>
              ) : (
                <NavLink to="/login">Login</NavLink>
              )}
            </NavLinks>
          </Nav>
        </div>
      </Header>
      
      <Main className="container">
        <Outlet />
      </Main>
      
      <Footer>
        <div className="container">
          © {new Date().getFullYear()} LiveScore Leaderboard System
        </div>
      </Footer>
    </>
  );
}

export default Layout;