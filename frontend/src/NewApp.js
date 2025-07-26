// New App.js with redesigned structure
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';

// Import existing components
import AuthForm from './components/AuthForm';
import PasswordReset from './components/PasswordReset';
import CertificateAnalysisPage from './components/CertificateAnalysisPage';
import SearchStatistics from './components/SearchStatistics';
import PesticideImage from './components/PesticideImage';

// Import new components
import LandingPage from './components/LandingPage';
import NewHeader from './components/NewHeader';
import SearchPage from './components/SearchPage'; // 새로 생성 예정
import { designTokens, createMuiTheme } from './theme/designTokens';

// MUI Theme 생성
const theme = createTheme(createMuiTheme());

// 메인 검색 페이지 컴포넌트 (기존 MainContent를 래핑)
const SearchPageWrapper = ({ token, user }) => {
  return (
    <Box>
      <NewHeader user={user} showNavigation={true} />
      {/* 여기에 기존 MainContent 로직을 이동 */}
      <SearchPage token={token} user={user} />
    </Box>
  );
};

// 검정증명서 페이지 래퍼
const CertificatePageWrapper = ({ user }) => {
  return (
    <Box>
      <NewHeader user={user} showNavigation={true} />
      <CertificateAnalysisPage />
    </Box>
  );
};

// 인증 페이지 래퍼
const AuthPageWrapper = ({ onLogin }) => {
  return (
    <Box>
      <NewHeader showNavigation={false} />
      <AuthForm onLogin={onLogin} />
    </Box>
  );
};

function NewApp() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청
      await fetch('/api/users/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 로컬 스토리지 클리어
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: designTokens.colors.background.default
        }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* 랜딩 페이지 (홈) */}
          <Route path="/" element={
            <Box>
              <NewHeader user={user} onLogout={handleLogout} showNavigation={false} />
              <LandingPage />
            </Box>
          } />
          
          {/* 검색 페이지 */}
          <Route path="/search" element={
            <SearchPageWrapper token={token} user={user} onLogout={handleLogout} />
          } />
          
          {/* 검정증명서 분석 페이지 */}
          <Route path="/certificate-analysis" element={
            <CertificatePageWrapper user={user} onLogout={handleLogout} />
          } />
          
          {/* 인증 페이지 */}
          <Route path="/auth" element={
            <AuthPageWrapper onLogin={handleLogin} />
          } />
          
          {/* 비밀번호 재설정 */}
          <Route path="/password-reset/:token" element={
            <Box>
              <NewHeader showNavigation={false} />
              <PasswordReset />
            </Box>
          } />
          
          {/* 기타 페이지들 */}
          <Route path="/statistics" element={
            <Box>
              <NewHeader user={user} onLogout={handleLogout} showNavigation={true} />
              <SearchStatistics />
            </Box>
          } />
          
          <Route path="/pesticide-image" element={
            <Box>
              <NewHeader user={user} onLogout={handleLogout} showNavigation={true} />
              <PesticideImage />
            </Box>
          } />
          
          {/* 관리자 리다이렉트 */}
          <Route path="/admin/*" element={
            <AdminRedirect />
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

// 관리자 리다이렉트 컴포넌트
function AdminRedirect() {
  React.useEffect(() => {
    window.location.href = 'https://findpest.kr/api/admin';
  }, []);
  return null;
}

export default NewApp;