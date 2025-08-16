// path of this code: frontend/src/App.js

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Button, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchStatistics from './components/SearchStatistics';
import PesticideImage from './components/PesticideImage';
import CertificateAnalysisPage from './components/CertificateAnalysisPage';
import AuthForm from './components/AuthForm';
import PasswordReset from './components/PasswordReset';

// New design components (점진적 테스트용)
import LandingPage from './components/LandingPage';
import NewHeader from './components/NewHeader';
import SearchPage from './components/SearchPage';

// 헤더 컴포넌트
const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link}
          to="/"
          sx={{ 
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8
            }
          }}
        >
          FindPest - Ai search
        </Typography>
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {user.organization}의 {user.email}님
            </Typography>
            <Button color="inherit" onClick={onLogout}>
              로그아웃
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/auth?mode=login')}
              variant="text"
              size="small"
            >
              로그인
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/auth?mode=signup')}
              variant="outlined"
              size="small"
            >
              회원가입
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};



function AdminRedirect() {
  React.useEffect(() => {
    window.location.href = 'https://findpest.kr/api/admin';
  }, []);
  return null;
}

// 메인 App 컴포넌트
function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const loginDate = localStorage.getItem('loginDate');
    
    // 현재 날짜 (YYYY-MM-DD 형식)
    const currentDate = new Date().toLocaleDateString('ko-KR');
    
    // 로그인 날짜가 다르면 자동 로그아웃
    if (savedToken && loginDate && loginDate !== currentDate) {
      console.log('날짜가 변경되어 자동 로그아웃됩니다.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginDate');
      setLoading(false);
      return;
    }

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // 날짜 변경 감지를 위한 interval 설정
  useEffect(() => {
    if (token) {
      const checkDateChange = setInterval(() => {
        const loginDate = localStorage.getItem('loginDate');
        const currentDate = new Date().toLocaleDateString('ko-KR');
        
        if (loginDate && loginDate !== currentDate) {
          console.log('날짜가 변경되어 자동 로그아웃됩니다.');
          handleLogout();
        }
      }, 60000); // 1분마다 체크
      
      return () => clearInterval(checkDateChange);
    }
  }, [token]);

  const handleLogin = async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    
    // 로그인 후 홈페이지로 리다이렉트
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
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
      localStorage.removeItem('loginDate');
      setUser(null);
      setToken(null);
      // 로그아웃 시 검색 기록도 초기화
      setSearchHistory([]);
      
      // 페이지 새로고침으로 상태 완전 초기화
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 메인 앱 (게스트 사용자도 접근 가능)
  return (
    <Router>
      <Routes>
        {/* 새 디자인 라우트들 (Container 밖에서) */}
        <Route path="/" element={
          <>
            <NewHeader user={user} onLogout={handleLogout} showNavigation={true} />
            <LandingPage />
          </>
        } />
        <Route path="/search" element={
          <>
            <NewHeader user={user} onLogout={handleLogout} showNavigation={true} />
            <SearchPage 
              token={token} 
              user={user} 
              searchHistory={searchHistory}
              setSearchHistory={setSearchHistory}
            />
          </>
        } />
        <Route path="/certificate-analysis" element={
          <>
            <NewHeader user={user} onLogout={handleLogout} showNavigation={true} />
            <CertificateAnalysisPage user={user} />
          </>
        } />
        
        {/* 기존 라우트들 (Container 안에서) */}
        <Route path="/auth" element={
          <>
            <Header user={user} onLogout={handleLogout} />
            <Container maxWidth="lg">
              <AuthForm onLogin={handleLogin} />
            </Container>
          </>
        } />
        <Route path="/password-reset/:token" element={
          <>
            <Header user={user} onLogout={handleLogout} />
            <Container maxWidth="lg">
              <PasswordReset />
            </Container>
          </>
        } />
        <Route path="/statistics" element={
          <>
            <NewHeader user={user} onLogout={handleLogout} showNavigation={true} />
            <SearchStatistics />
          </>
        } />
        <Route path="/pesticide-image" element={
          <>
            <Header user={user} onLogout={handleLogout} />
            <Container maxWidth="lg">
              <PesticideImage />
            </Container>
          </>
        } />
        <Route path="/admin/*" element={<AdminRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;