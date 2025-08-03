import React, { useState, useRef, useEffect } from 'react';
import { Box, Container, Typography, Button, TextField, Autocomplete } from '@mui/material';
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
  padding: { 
    xs: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
    md: `${designTokens.spacing[3]} ${designTokens.spacing[6]}` 
  },
  backdropFilter: 'blur(10px)',
  border: '1px solid black',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
};


// 뉴스 데이터 정의
const newsData = [
  { title: "폭우로 인한 채소·과일 가격 급등", source: "헤럴드경제", link: "https://biz.heraldcorp.com/article/10541874" },
  { title: "2025년 햇마늘 첫 경매 가격 안정세", source: "농민신문", link: "https://www.nongmin.com/" },
  { title: "농정 핵심 법안 6개 수용 결정", source: "농민신문", link: "https://www.nongmin.com/" },
  { title: "스마트농업 AI 기술 활용 확산", source: "농촌진흥청", link: "https://www.rda.go.kr/" },
  { title: "집중호우 피해 농가 현장 기술 지원", source: "농촌진흥청", link: "https://www.rda.go.kr/" },
  { title: "[2025년 농약 신제품] 기상이변 대응하는 안전성과 편리성에 방점", source: "영농자재신문", link: "https://www.newsfm.kr/mobile/article.html?no=9619" },
  { title: "대만 수출 한국산 식품 잔류농약 초과 검출로 '경고등'", source: "푸드아이콘", link: "https://www.foodicon.co.kr/news/articleView.html?idxno=28247" },
  { title: "2025년 유해화학물질 안전관리 정책 강화", source: "에너지데일리", link: "https://www.energydaily.co.kr/news/articleView.html?idxno=154430" },
  { title: "2024년 K-Food+ 수출액 역대 최고 달성", source: "농림축산식품부", link: "https://www.mafra.go.kr/home/5109/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGaG9tZSUyRjc5MiUyRjU3Mjg0OSUyRmFydGNsVmlldy5kbyUzRmJic0NsU2VxJTNEJTI2aXNWaWV3TWluZSUzRGZhbHNlJTI2cmdzRW5kZGVTdHIlM0QlMjZwYWdlJTNEMSUyNmJic09wZW5XcmRTZXElM0QlMjZyZ3NCZ25kZVN0ciUzRCUyNnNyY2hXcmQlM0QlRUMlODglOTklRUMlQjYlOUMlMjZwYXNzd29yZCUzRCUyNnNyY2hDb2x1bW4lM0RzaiUyNnJvdyUzRDEwJTI2" },
  { title: "스마트농업데이터 플랫폼 전면 개편", source: "농림축산식품부", link: "https://www.mafra.go.kr/home/5109/subview.do" },
  { title: "2025년 10대 농정 이슈 발표", source: "팜인사이트", link: "https://www.farminsight.net/news/articleView.html?idxno=14330" },
  { title: "2025년 기술융복합 현장적용 사업 공고", source: "한국농업기술진흥원", link: "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000103406" },
  { title: "2050 농식품 탄소중립 추진전략 본격 시행", source: "대한민국 정책브리핑", link: "https://www.korea.kr/news/policyNewsView.do?newsId=148897311" }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  // 뉴스 순환 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex((prevIndex) => (prevIndex + 1) % newsData.length);
    }, 6000); // 6초마다 순환

    return () => clearInterval(interval);
  }, []);

  // 표시할 뉴스 목록 (현재 인덱스부터 최대 7개)
  const getVisibleNews = () => {
    const visibleNews = [];
    for (let i = 0; i < Math.min(7, newsData.length); i++) {
      const index = (currentNewsIndex + i) % newsData.length;
      visibleNews.push({ ...newsData[index], animationDelay: i * 0.1 });
    }
    return visibleNews;
  };

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
          maxWidth: { xs: '320px', sm: '400px', md: '500px' },
          px: { xs: 3, sm: 2 }
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
                      fontSize: { xs: '14px', md: '16px' },
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
          bottom: { xs: '20%', md: '12%' },
          left: { xs: '5%', md: '5%' },
          right: { xs: '5%', md: 'auto' },
          zIndex: 2,
          maxWidth: { xs: '90%', md: '600px' }
        }}>
          <Typography 
            sx={{ 
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2.45rem' },
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              lineHeight: 1.2,
              wordBreak: 'keep-all'
            }}
          >
            A Way to Better Decision Making
          </Typography>
        </Box>

        {/* CTA 영역 (오른쪽 하단, Figma와 동일) */}
        <Box sx={{ 
          position: 'absolute',
          bottom: { xs: '8%', md: '10%' },
          right: { xs: '5%', md: '5%' },
          left: { xs: '5%', md: 'auto' },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: { xs: designTokens.spacing[2], md: designTokens.spacing[3] },
          zIndex: 2,
          maxWidth: { xs: '90%', md: 'auto' }
        }}>
          <Typography 
            variant="body1"
            sx={{ 
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
              fontWeight: 'medium',
              fontSize: { xs: '14px', md: '16px' },
              textAlign: { xs: 'center', md: 'left' },
              wordBreak: 'keep-all',
              lineHeight: 1.4
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
              px: { xs: designTokens.spacing[3], md: designTokens.spacing[4] },
              py: { xs: designTokens.spacing[2], md: designTokens.spacing[2] },
              fontWeight: 'bold',
              fontSize: { xs: '14px', md: '16px' },
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              minWidth: { xs: 'auto', md: 'auto' },
              flexShrink: 0,
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
        {/* 3단 레이아웃: 미션 정보, 농약뉴스, AD */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            md: '1fr 2fr 1fr' 
          },
          gap: { 
            xs: designTokens.spacing[4], 
            md: designTokens.spacing[8] 
          },
          alignItems: 'start',
          mb: designTokens.spacing[12]
        }}>
          {/* 좌측: 미션 정보 */}
          <Box sx={{ order: { xs: 2, md: 1 } }}>
            <Typography variant="h6" sx={{ 
              mb: designTokens.spacing[3], 
              fontWeight: 'bold',
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}>
              지향점
            </Typography>
            <Typography variant="body2" sx={{ 
              color: designTokens.colors.text.secondary,
              mb: { xs: designTokens.spacing[4], md: designTokens.spacing[6] },
              lineHeight: 1.6,
              fontSize: { xs: '0.875rem', md: '0.875rem' }
            }}>
              "정확한 데이터를 제공하여 다음 세대의 건강한 미래와 지속가능한 환경을 보장하며, 모든 가족이 안심할 수 있는 세상을 만들어갑니다"
            </Typography>
            
            <Typography variant="body2" sx={{ 
              color: designTokens.colors.text.secondary, 
              fontStyle: 'italic',
              lineHeight: 1.6,
              fontSize: { xs: '0.8rem', md: '0.875rem' }
            }}>
              "Creating a safer world for every family by providing accurate data that ensures healthy futures for the next generation and sustainable environments."
            </Typography>
          </Box>

          {/* 중앙: 농약뉴스 */}
          <Box sx={{ 
            textAlign: 'left', 
            height: { xs: '250px', md: '300px' }, 
            display: 'flex', 
            flexDirection: 'column',
            order: { xs: 1, md: 2 }
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: designTokens.colors.primary[500],
                fontWeight: 'bold',
                mb: { xs: designTokens.spacing[3], md: designTokens.spacing[4] },
                fontSize: { xs: '1.5rem', md: '2rem' },
                textAlign: 'center'
              }}
            >
              먹거리 뉴스
            </Typography>
            
            {/* 뉴스 목록 - 애니메이션 적용 */}
            <Box sx={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: designTokens.borderRadius.lg,
              padding: { xs: designTokens.spacing[2], md: designTokens.spacing[3] },
              border: `1px solid ${designTokens.colors.gray[200]}`,
              overflow: 'hidden',
              position: 'relative'
            }}>
              {getVisibleNews().map((news, index) => (
                <Box 
                  key={`${currentNewsIndex}-${index}`}
                  sx={{ 
                    mb: index === getVisibleNews().length - 1 ? 0 : 1.5,
                    opacity: 0,
                    transform: 'translateY(20px)',
                    animation: 'slideInUp 0.5s ease-out forwards',
                    animationDelay: `${news.animationDelay}s`,
                    '@keyframes slideInUp': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(20px)'
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    }
                  }}
                >
                  <Typography 
                    component="a"
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontSize: { xs: '0.7rem', md: '0.8rem' },
                      fontWeight: 'bold',
                      color: designTokens.colors.primary[600],
                      textDecoration: 'none',
                      lineHeight: 1.2,
                      display: 'inline',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: designTokens.colors.primary[700]
                      }
                    }}
                  >
                    {news.title}
                  </Typography>
                  <Typography component="span" sx={{ 
                    fontSize: { xs: '0.6rem', md: '0.65rem' },
                    color: designTokens.colors.text.secondary,
                    ml: 1
                  }}>
                    - {news.source}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* 우측: TSP분석연구소 광고 */}
          <Box sx={{ 
            height: { xs: '200px', md: '300px' }, 
            display: 'flex', 
            alignItems: 'end',
            order: { xs: 3, md: 3 }
          }}>
            <Box sx={{
              width: '100%',
              height: '100%',
              backgroundImage: 'url("/images/tsp-lab.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: designTokens.borderRadius.lg,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: { xs: designTokens.spacing[2], md: designTokens.spacing[3] },
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: 'white',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(107, 114, 128, 0.3)',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 30px rgba(107, 114, 128, 0.4)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.6) 0%, rgba(107, 114, 128, 0.525) 50%, rgba(156, 163, 175, 0.6) 100%)',
                pointerEvents: 'none'
              }
            }}
            onClick={() => window.open('https://tsplab.co.kr/', '_blank')}
            >
              {/* TSP 로고 영역 */}
              <Box sx={{ 
                position: 'absolute',
                top: { xs: 8, md: 12 },
                left: { xs: 8, md: 12 },
                zIndex: 3
              }}>
                <img 
                  src="/images/tsp-logo.png"
                  alt="TSP Logo"
                  style={{
                    width: '60px',
                    height: '30px',
                    objectFit: 'contain',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '6px',
                    padding: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>


              {/* 메인 콘텐츠 */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.85rem', md: '1rem' },
                  mb: 0.5,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  letterSpacing: '-0.5px'
                }}>
                  We are Professional
                </Typography>
                
                <Typography variant="body2" sx={{ 
                  fontSize: { xs: '0.65rem', md: '0.7rem' },
                  lineHeight: 1.2,
                  opacity: 0.95,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                  mb: 1
                }}>
                  전문 분석 서비스로 농산물 안전을 보장합니다
                </Typography>

                {/* 연락처 정보 */}
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  mb: 1
                }}>
                  <Typography sx={{
                    fontSize: { xs: '0.6rem', md: '0.65rem' },
                    color: '#374151',
                    fontWeight: 'bold',
                    lineHeight: 1.2
                  }}>
                    📞 031-647-0420
                    <br />
                    ✉️ admin@tsplab.co.kr
                  </Typography>
                </Box>
              </Box>

              {/* CTA 버튼 */}
              <Box sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#374151',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: { xs: '0.7rem', md: '0.75rem' },
                fontWeight: 'bold',
                zIndex: 2,
                transition: 'all 0.2s ease',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(5px)',
                '&:hover': {
                  backgroundColor: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(255,255,255,0.3)'
                }
              }}>
                바로가기
              </Box>
              
              {/* 작은 라벨 */}
              <Typography variant="caption" sx={{
                position: 'absolute',
                top: 6,
                right: 8,
                fontSize: '0.6rem',
                opacity: 0.6,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: '2px 6px',
                borderRadius: '8px',
                zIndex: 1,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                AD
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;