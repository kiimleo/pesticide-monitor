import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupForm from './components/SignupForm';
import React, { useState } from 'react';
import { Container, Typography, Alert, Box, CircularProgress } from '@mui/material';
import FilterPanel from './components/FilterPanel';
import PesticideTable from './components/PesticideTable';
import { api } from './services/api';
import SearchStatistics from './components/SearchStatistics';

function MainContent() {  // 기존 메인 페이지 컴포넌트로 분리
  const [pesticides, setPesticides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetResults = () => {
    setPesticides([]);
    setError(null);
  };

  const handleFilter = async (filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        pesticide: filters.pesticide,
        food: filters.food
      };
      
      const data = await api.getPesticides(params);
      setPesticides(data);

      if (data.length === 0) {
        setError('해당하는 잔류허용기준이 없습니다.');
      }
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
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
          식품의약품안전처 고시번호 제2024-22호, 2024년 5월 17일 개정사항 반영
        </Typography>
      </Box>
      
      <FilterPanel onFilter={handleFilter} onReset={resetResults} />
      
      {error && (
        <Alert severity={pesticides.length === 0 ? "warning" : "error"} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <PesticideTable pesticides={pesticides} />
      )}
    </Container>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/statistics" element={<SearchStatistics />} />
      </Routes>
    </Router>
  );
}


export default App;