import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Paper, Alert, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import FilterPanel from './FilterPanel';
import PesticideTable from './PesticideTable';
import { api } from '../services/api';
import { designTokens } from '../theme/designTokens';

const SearchPage = ({ token, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pesticides, setPesticides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedFood, setSearchedFood] = useState('');
  const [guestQueryStatus, setGuestQueryStatus] = useState(null);
  const [prefilledFood, setPrefilledFood] = useState('');

  // URL 파라미터에서 식품명 추출
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const foodParam = searchParams.get('food');
    if (foodParam) {
      setPrefilledFood(decodeURIComponent(foodParam));
    }
  }, [location]);

  // 게스트 쿼리 상태 확인
  useEffect(() => {
    if (!user) {  // 게스트 사용자인 경우에만
      const fetchGuestQueryStatus = async () => {
        try {
          const status = await api.getGuestQueryStatus();
          setGuestQueryStatus(status);
        } catch (error) {
          console.error('게스트 쿼리 상태 확인 오류:', error);
        }
      };
      fetchGuestQueryStatus();
    }
  }, [user, pesticides]); // 검색 후에도 상태 업데이트

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
        
        // 게스트 사용자의 경우 성공한 검색 후에도 쿼리 상태 업데이트
        if (!user) {
          try {
            const status = await api.getGuestQueryStatus();
            setGuestQueryStatus(status);
          } catch (statusError) {
            console.error('게스트 쿼리 상태 확인 오류:', statusError);
          }
        }
      } catch (error) {
        // 게스트 사용자의 경우 검색 후 쿼리 상태 업데이트
        if (!user) {
          try {
            const status = await api.getGuestQueryStatus();
            setGuestQueryStatus(status);
          } catch (statusError) {
            console.error('게스트 쿼리 상태 확인 오류:', statusError);
          }
        }
        if (error.response?.status === 401) {
          setError({
            type: "auth_error",
            severity: "error",
            title: "인증 오류",
            message: "로그인이 필요합니다. 페이지를 새로고침해주세요."
          });
        } else if (error.response?.status === 429) {
          // 429 에러는 무시하고 다른 처리 없음 - 함수 종료
          setError(null);
          return;
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
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: designTokens.colors.background.default
    }}>
      <Container maxWidth="lg" sx={{ py: designTokens.spacing[8] }}>
        {/* 페이지 헤더 */}
        <Box sx={{ textAlign: 'center', mb: designTokens.spacing[8] }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              color: designTokens.colors.text.primary,
              mb: designTokens.spacing[3]
            }}
          >
            잔류농약 허용기준 검색
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: designTokens.colors.text.secondary,
              fontSize: designTokens.typography.fontSize.sm
            }}
          >
            식품의약품안전처 고시번호 제2024-71호, 2024년 11월 14일 개정사항 반영
          </Typography>
        </Box>
        
        {/* 게스트 사용자 쿼리 상태 표시 - 5회 초과 시에만 */}
        {!user && guestQueryStatus && guestQueryStatus.remaining_queries === 0 && (
          <Alert 
            severity="warning"
            sx={{ 
              mb: designTokens.spacing[6],
              borderRadius: designTokens.borderRadius.lg,
              border: `1px solid ${designTokens.colors.status.warning}`
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                variant="outlined"
                onClick={() => navigate('/auth?mode=signup')}
                sx={{ borderRadius: designTokens.borderRadius.md }}
              >
                회원가입
              </Button>
            }
          >
            <Typography variant="body2">
              검색 기능을 더 사용하려면 로그인 또는 회원 가입후 이용해 주세요.
            </Typography>
          </Alert>
        )}
        
        {/* 검색 폼 */}
        <Paper 
          elevation={0}
          sx={{ 
            p: designTokens.spacing[6],
            mb: designTokens.spacing[6],
            backgroundColor: designTokens.colors.white,
            borderRadius: designTokens.borderRadius['2xl'],
            border: `1px solid ${designTokens.colors.gray[200]}`,
            boxShadow: designTokens.shadows.sm
          }}
        >
          <FilterPanel 
            onFilter={handleFilter} 
            onReset={resetResults} 
            prefilledFood={prefilledFood}
          />
        </Paper>
        
        {/* 에러 메시지 */}
        {error && (
          <Paper 
            elevation={0} 
            sx={{ 
              mb: designTokens.spacing[6],
              p: designTokens.spacing[6],
              backgroundColor: error.severity === "warning" ? '#fff8e1' : '#ffebee',
              border: `1px solid ${error.severity === "warning" ? designTokens.colors.status.warning : designTokens.colors.status.error}`,
              borderRadius: designTokens.borderRadius.xl
            }}
          >
            <Box>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: error.severity === "warning" ? designTokens.colors.status.warning : designTokens.colors.status.error,
                  fontWeight: 'bold'
                }}
              >
                {error.title}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {error.message}
              </Typography>
              {error.details && (
                <Box sx={{ mt: designTokens.spacing[3] }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    검색하신 정보
                  </Typography>
                  <Box sx={{ pl: designTokens.spacing[3] }}>
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
        
        {/* 로딩 또는 결과 테이블 */}
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            py: designTokens.spacing[12]
          }}>
            <CircularProgress size={48} />
          </Box>
        ) : (
          <PesticideTable 
            pesticides={pesticides}
            searchedFood={searchedFood}
          />
        )}
      </Container>
    </Box>
  );
};

export default SearchPage;