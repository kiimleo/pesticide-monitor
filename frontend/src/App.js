// path of this code: frontend/src/App.js

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Paper, Tabs, Tab, Button, AppBar, Toolbar } from '@mui/material';
import FilterPanel from './components/FilterPanel';
import PesticideTable from './components/PesticideTable';
import { api } from './services/api';
import SearchStatistics from './components/SearchStatistics';
import PesticideImage from './components/PesticideImage';
import CertificateAnalysisPage from './components/CertificateAnalysisPage';
import AuthForm from './components/AuthForm';
import PasswordReset from './components/PasswordReset';

// 헤더 컴포넌트
const Header = ({ user, onLogout }) => {
  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          FindPest - Ai 기반 농약 검색 서비스
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {user.organization}의 {user.email}님
            </Typography>
            <Button color="inherit" onClick={onLogout}>
              로그아웃
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

// 탭 네비게이션 컴포넌트
const NavigationTabs = () => {
  const location = useLocation();
  const [value, setValue] = useState(
    location.pathname === '/certificate-analysis' ? 1 : 0
  );

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs 
        value={value} 
        onChange={handleChange} 
        aria-label="main navigation tabs"
        centered
      >
        <Tab 
          label="농약 잔류허용기준 검색" 
          component={Link} 
          to="/" 
        />
        <Tab 
          label="검정증명서 분석" 
          component={Link} 
          to="/certificate-analysis" 
        />
      </Tabs>
    </Box>
  );
};

function MainContent({ token }) {
  const [pesticides, setPesticides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedFood, setSearchedFood] = useState('');

  const resetResults = () => {
    setPesticides([]);
    setError(null);
    setSearchedFood('');
  };

  const handleFilter = async (filters) => {
    try {
      setLoading(true);
      setError(null);
      setSearchedFood(filters.food);
      
      const params = {
        pesticide: filters.pesticide.trim(),
        food: filters.food.trim()
      };
      
      try {
        const data = await api.getPesticides(params, token);
        setPesticides(data);
        setError(null);
      } catch (error) {
        if (error.response?.status === 401) {
          setError({
            type: "auth_error",
            severity: "error",
            title: "인증 오류",
            message: "로그인이 필요합니다. 페이지를 새로고침해주세요."
          });
        } else if (error.response?.status === 404) {
          const errorType = error.response.data.error_type;
          
          if (errorType === 'input_error') {
            setError({
              type: "input_error",
              severity: "error",
              title: "검색 결과 없음",
              message: error.response.data.message,
              details: error.response.data.details
            });
          } else if (errorType === 'not_permitted') {
            setError({
              type: "not_permitted",
              severity: "warning",
              title: "사용 허가되지 않은 농약",
              message: error.response.data.message,
              details: {
                pesticide: error.response.data.searched_pesticide,
                food: error.response.data.searched_food
              }
            });
          }
          setPesticides([]);
        } else {
          setError({
            type: "error",
            severity: "error",
            title: "오류 발생",
            message: "데이터를 불러오는 중 오류가 발생했습니다."
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        잔류농약 허용기준 검색
      </Typography>
      
      <Box sx={{ mb: 3, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          식품의약품안전처 고시번호 제2024-71호, 2024년 11월 14일 개정사항 반영
        </Typography>
      </Box>
      
      <FilterPanel onFilter={handleFilter} onReset={resetResults} />
      
      {error && (
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 3,
            p: 3,
            backgroundColor: error.severity === "warning" ? '#fff8e1' : '#ffebee',
            border: 1,
            borderColor: error.severity === "warning" ? 'warning.main' : 'error.main',
            borderRadius: 2
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: error.severity === "warning" ? 'warning.dark' : 'error.dark' }}>
              {error.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {error.message}
            </Typography>
            {error.details && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  검색하신 정보
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    • 농약성분명: <Box component="span" sx={{ color: 'error.main', fontWeight: 500 }}>
                      {error.details.pesticide || error.details.searched_pesticide}
                    </Box>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 식품명: <Box component="span" sx={{ color: 'error.main', fontWeight: 500 }}>
                      {error.details.food || error.details.searched_food}
                    </Box>
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <PesticideTable 
          pesticides={pesticides}
          searchedFood={searchedFood}
          />
      )}
    </Container>
  );
}

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 로그인하지 않은 경우 인증 폼 표시
  if (!user || !token) {
    return (
      <Router>
        <Routes>
          <Route path="/password-reset/:token" element={<PasswordReset />} />
          <Route path="*" element={<AuthForm onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  // 로그인한 경우 메인 앱 표시
  return (
    <Router>
      <Header user={user} onLogout={handleLogout} />
      <Container maxWidth="lg">
        <Routes>
          <Route path="/" element={
            <>
              <NavigationTabs />
              <MainContent token={token} />
            </>
          } />
          <Route path="/certificate-analysis" element={
            <>
              <NavigationTabs />
              <CertificateAnalysisPage />
            </>
          } />
          <Route path="/statistics" element={<SearchStatistics />} />
          <Route path="/pesticide-image" element={<PesticideImage />} />
          <Route path="/admin/*" element={<AdminRedirect />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;