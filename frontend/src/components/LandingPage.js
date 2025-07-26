import React, { useState, useRef } from 'react';
import { Box, Container, Typography, Button, Card, CardContent, TextField, Autocomplete } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { designTokens } from '../theme/designTokens';
import { api } from '../services/api';

// Hero 섹션 배경 스타일 - 제공받은 농촌 도로 이미지 사용
const heroStyles = {
  height: 'calc(100vh - 128px)', // 상단 타이틀바 + 헤더 높이 제외 (64px * 2)
  backgroundImage: 'url("/images/hero-bg.jpg")', // 제공해주신 이미지
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  position: 'relative',
  width: '100%',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // 가벼운 오버레이
    zIndex: 1
  }
};

// contentStyles 제거됨 - 사용되지 않음

const searchBoxStyles = {
  backgroundColor: 'transparent',
  borderRadius: '25px', // 타원형 모양
  padding: `${designTokens.spacing[3]} ${designTokens.spacing[6]}`,
  backdropFilter: 'blur(10px)',
  border: '1px solid black',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
};

const actionButtonStyles = {
  backgroundColor: designTokens.colors.primary[500],
  color: 'white',
  borderRadius: designTokens.borderRadius.lg,
  padding: `${designTokens.spacing[3]} ${designTokens.spacing[6]}`,
  fontSize: designTokens.typography.fontSize.lg,
  fontWeight: designTokens.typography.fontWeight.semibold,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: designTokens.colors.primary[600]
  }
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // 식품명 자동완성 검색
  const handleSearchInputChange = async (event, newValue) => {
    setSearchValue(newValue);
    
    if (newValue && newValue.length >= 1) {
      setIsSearching(true);
      try {
        const suggestions = await api.searchFoodAutocomplete(newValue);
        setFoodSuggestions(suggestions || []);
      } catch (error) {
        console.error('Food autocomplete error:', error);
        setFoodSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setFoodSuggestions([]);
    }
  };

  // 검색 실행 (엔터 또는 선택)
  const handleSearchSubmit = (selectedFood) => {
    const foodName = selectedFood || searchValue;
    if (foodName.trim()) {
      // 검색 페이지로 이동하면서 식품명을 URL 파라미터로 전달
      navigate(`/search?food=${encodeURIComponent(foodName.trim())}`);
    }
  };

  // 엔터 키 처리
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <Box>
      {/* Hero Section - Figma 디자인 정확히 반영 */}
      <Box sx={heroStyles}>
        {/* 검색 박스 영역 (중앙 상단, Figma와 동일한 위치) */}
        <Box sx={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          width: '100%',
          maxWidth: '500px',
          px: 2
        }}>
          <Autocomplete
            freeSolo
            options={foodSuggestions}
            inputValue={searchValue}
            onInputChange={handleSearchInputChange}
            onChange={(event, newValue) => {
              if (newValue) {
                handleSearchSubmit(newValue);
              }
            }}
            loading={isSearching}
            noOptionsText="검색 결과가 없습니다"
            loadingText="검색 중..."
            renderInput={(params) => (
              <TextField
                {...params}
                ref={searchInputRef}
                placeholder="검색하고 싶은 식품명을 입력하세요"
                onKeyPress={handleKeyPress}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <SearchIcon 
                      sx={{ 
                        color: designTokens.colors.text.secondary,
                        fontSize: '20px',
                        mr: 1
                      }} 
                    />
                  ),
                  sx: {
                    ...searchBoxStyles,
                    '& .MuiInputBase-input': {
                      color: designTokens.colors.text.secondary,
                      fontWeight: 'medium',
                      fontSize: '16px',
                      '&::placeholder': {
                        color: designTokens.colors.text.secondary,
                        opacity: 0.8
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }
                }}
              />
            )}
            sx={{
              '& .MuiAutocomplete-listbox': {
                backgroundColor: 'white',
                boxShadow: designTokens.shadows.lg,
                borderRadius: designTokens.borderRadius.md,
                '& .MuiAutocomplete-option': {
                  color: designTokens.colors.text.primary,
                  '&:hover': {
                    backgroundColor: designTokens.colors.gray[100]
                  }
                }
              }
            }}
          />
        </Box>

        {/* 메인 슬로건 (왼쪽 하단, Figma 위치와 동일) */}
        <Box sx={{
          position: 'absolute',
          bottom: '12%',
          left: '5%',
          zIndex: 2,
          maxWidth: '600px'
        }}>
          <Typography 
            sx={{ 
              fontSize: { xs: '1.75rem', md: '2.45rem' }, // 70% 크기로 축소
              fontWeight: 300, // Inter 폰트의 Light weight
              fontStyle: 'italic',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', // Inter 폰트 명시
              lineHeight: 1.2
            }}
          >
            A Way to Better Decision Making
          </Typography>
        </Box>

        {/* CTA 영역 (오른쪽 하단, Figma와 동일) */}
        <Box sx={{ 
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          display: 'flex',
          alignItems: 'center',
          gap: designTokens.spacing[3],
          zIndex: 2
        }}>
          <Typography 
            variant="body1"
            sx={{ 
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
              fontWeight: 'medium',
              fontSize: '16px'
            }}
          >
            건강한 먹거리, 가장 정확하게 농작물을 이해하는 방법!
          </Typography>
          <Button 
            variant="contained"
            sx={{
              backgroundColor: 'white',
              color: designTokens.colors.primary[500],
              borderRadius: '8px',
              px: designTokens.spacing[4],
              py: designTokens.spacing[2],
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              '&:hover': {
                backgroundColor: designTokens.colors.gray[100],
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.3)'
              }
            }}
            onClick={() => navigate('/search')}
          >
            시작하기
          </Button>
        </Box>
      </Box>

      {/* 서비스 선택 섹션 */}
      <Container maxWidth="lg" sx={{ py: designTokens.spacing[16] }}>
        {/* 농약 뉴스 섹션 */}
        <Box sx={{ textAlign: 'center', mb: designTokens.spacing[12] }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: designTokens.colors.primary[500],
              fontWeight: 'bold',
              mb: designTokens.spacing[8]
            }}
          >
            농약 뉴스
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: designTokens.spacing[8] }}>
            {/* 미션 */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: designTokens.spacing[2], fontWeight: 'bold' }}>
                미션
              </Typography>
              <Typography variant="body1" sx={{ color: designTokens.colors.text.secondary }}>
                농약분석 농약 데이터를 제공하여 어린이의 건강을 지키고 환경을 보호함으로써 가족을 안전하게 지키는 것
              </Typography>
            </Box>

            {/* Mission Statement */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: designTokens.spacing[2], fontWeight: 'bold' }}>
                Mission Statement:
              </Typography>
              <Typography variant="body1" sx={{ color: designTokens.colors.text.secondary, fontStyle: 'italic' }}>
                "Empowering families with accurate pesticide data to safeguard children's health and protect our environment."
              </Typography>
            </Box>

            {/* AD 공간 */}
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              color: designTokens.colors.primary[500],
              fontWeight: 'bold',
              fontSize: designTokens.typography.fontSize['2xl']
            }}>
              AD
            </Box>
          </Box>
        </Box>

        {/* 서비스 카드 섹션 */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: designTokens.spacing[6],
          mt: designTokens.spacing[12]
        }}>
          {/* 잔류농약 허용기준 검색 카드 */}
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: `1px solid rgba(74, 124, 89, 0.2)`, // 헤더 녹색의 20% 투명도
              borderRadius: designTokens.borderRadius.xl,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: designTokens.shadows.lg,
                borderColor: 'rgba(74, 124, 89, 0.4)' // 호버 시 조금 더 진하게
              }
            }}
            onClick={() => navigate('/search')}
          >
            <CardContent sx={{ p: designTokens.spacing[6], textAlign: 'center' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: designTokens.spacing[3],
                  fontWeight: 'bold',
                  color: designTokens.colors.primary[500]
                }}
              >
                잔류농약 허용기준 검색
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: designTokens.colors.text.secondary,
                  mb: designTokens.spacing[4]
                }}
              >
                식품별 농약 성분의 잔류허용기준을 검색하고 확인할 수 있습니다.
              </Typography>
              <Button 
                variant="contained" 
                sx={actionButtonStyles}
                fullWidth
              >
                검색하기
              </Button>
            </CardContent>
          </Card>

          {/* 검정증명서 검증 카드 */}
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: `1px solid rgba(74, 124, 89, 0.2)`, // 헤더 녹색의 20% 투명도
              borderRadius: designTokens.borderRadius.xl,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: designTokens.shadows.lg,
                borderColor: 'rgba(74, 124, 89, 0.4)' // 호버 시 조금 더 진하게
              }
            }}
            onClick={() => navigate('/certificate-analysis')}
          >
            <CardContent sx={{ p: designTokens.spacing[6], textAlign: 'center' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: designTokens.spacing[3],
                  fontWeight: 'bold',
                  color: designTokens.colors.primary[500]
                }}
              >
                검정 증명서 검증
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: designTokens.colors.text.secondary,
                  mb: designTokens.spacing[4]
                }}
              >
                검정증명서를 업로드하여 농약 검출 결과를 분석하고 검증할 수 있습니다.
              </Typography>
              <Button 
                variant="contained" 
                sx={actionButtonStyles}
                fullWidth
              >
                검증하기
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;