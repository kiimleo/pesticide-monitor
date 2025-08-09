// frontend/src/components/SearchStatistics.js

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Typography,
  Grid,
  Box,
  Chip,
  Paper
} from '@mui/material';
import { designTokens } from '../theme/designTokens';
import { TrendingUp, Search, Analytics, CalendarToday } from '@mui/icons-material';

const SearchStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.getSearchStatistics();
        setStats(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError('통계 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // 자동 새로고침 비활성화
    // const interval = setInterval(fetchStats, 300000);
    // return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <Box sx={{ p: 3 }}>
      <Typography>통계 데이터를 불러오는 중...</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3 }}>
      <Typography color="error">{error}</Typography>
    </Box>
  );

  if (!stats) return null;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: designTokens.colors.background.default,
      py: designTokens.spacing[8],
      px: designTokens.spacing[4]
    }}>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: designTokens.spacing[8], textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          sx={{
            color: designTokens.colors.text.primary,
            fontWeight: designTokens.typography.fontWeight.bold,
            mb: designTokens.spacing[2]
          }}
        >
          📊 검색 통계
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ color: designTokens.colors.text.secondary }}
        >
          FindPest 서비스 이용 현황을 실시간으로 확인하세요
        </Typography>
      </Box>
      
      <Grid container spacing={3} maxWidth="1200px" sx={{ mx: 'auto' }}>
        {/* 총 검색 횟수 카드 */}
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{
            p: designTokens.spacing[6],
            borderRadius: designTokens.borderRadius.xl,
            border: `1px solid ${designTokens.colors.gray[200]}`,
            backgroundColor: designTokens.colors.white,
            textAlign: 'center',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: designTokens.shadows.lg,
              transform: 'translateY(-2px)'
            }
          }}>
            <Box sx={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: designTokens.colors.primary[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: designTokens.spacing[4]
            }}>
              <Search sx={{ color: designTokens.colors.primary[600], fontSize: '28px' }} />
            </Box>
            <Typography 
              variant="h4" 
              sx={{
                color: designTokens.colors.text.primary,
                fontWeight: designTokens.typography.fontWeight.bold,
                mb: designTokens.spacing[1]
              }}
            >
              {stats.total_searches.toLocaleString()}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: designTokens.colors.text.secondary }}
            >
              총 검색 횟수
            </Typography>
          </Paper>
        </Grid>

        {/* 고유 검색어 카드 */}
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{
            p: designTokens.spacing[6],
            borderRadius: designTokens.borderRadius.xl,
            border: `1px solid ${designTokens.colors.gray[200]}`,
            backgroundColor: designTokens.colors.white,
            textAlign: 'center',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: designTokens.shadows.lg,
              transform: 'translateY(-2px)'
            }
          }}>
            <Box sx={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: designTokens.colors.status.info + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: designTokens.spacing[4]
            }}>
              <Analytics sx={{ color: designTokens.colors.status.info, fontSize: '28px' }} />
            </Box>
            <Typography 
              variant="h4" 
              sx={{
                color: designTokens.colors.text.primary,
                fontWeight: designTokens.typography.fontWeight.bold,
                mb: designTokens.spacing[1]
              }}
            >
              {stats.unique_terms.toLocaleString()}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: designTokens.colors.text.secondary }}
            >
              검색된 농약성분 종류
            </Typography>
          </Paper>
        </Grid>

        {/* 최근 7일 검색 카드 */}
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{
            p: designTokens.spacing[6],
            borderRadius: designTokens.borderRadius.xl,
            border: `1px solid ${designTokens.colors.gray[200]}`,
            backgroundColor: designTokens.colors.white,
            textAlign: 'center',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: designTokens.shadows.lg,
              transform: 'translateY(-2px)'
            }
          }}>
            <Box sx={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: designTokens.colors.status.success + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: designTokens.spacing[4]
            }}>
              <TrendingUp sx={{ color: designTokens.colors.status.success, fontSize: '28px' }} />
            </Box>
            <Typography 
              variant="h4" 
              sx={{
                color: designTokens.colors.text.primary,
                fontWeight: designTokens.typography.fontWeight.bold,
                mb: designTokens.spacing[1]
              }}
            >
              {stats.recent_searches.toLocaleString()}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: designTokens.colors.text.secondary }}
            >
              최근 7일 검색
            </Typography>
          </Paper>
        </Grid>

        {/* 활성 사용자 카드 (임시 데이터) */}
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{
            p: designTokens.spacing[6],
            borderRadius: designTokens.borderRadius.xl,
            border: `1px solid ${designTokens.colors.gray[200]}`,
            backgroundColor: designTokens.colors.white,
            textAlign: 'center',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: designTokens.shadows.lg,
              transform: 'translateY(-2px)'
            }
          }}>
            <Box sx={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: designTokens.colors.status.warning + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: designTokens.spacing[4]
            }}>
              <CalendarToday sx={{ color: designTokens.colors.status.warning, fontSize: '28px' }} />
            </Box>
            <Typography 
              variant="h4" 
              sx={{
                color: designTokens.colors.text.primary,
                fontWeight: designTokens.typography.fontWeight.bold,
                mb: designTokens.spacing[1]
              }}
            >
              {Math.floor(stats.recent_searches / 7)}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: designTokens.colors.text.secondary }}
            >
              일평균 검색수
            </Typography>
          </Paper>
        </Grid>

        {/* 인기 검색어 카드 */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{
            borderRadius: designTokens.borderRadius.xl,
            border: `1px solid ${designTokens.colors.gray[200]}`,
            backgroundColor: designTokens.colors.white,
            overflow: 'hidden'
          }}>
            <Box sx={{
              p: designTokens.spacing[6],
              backgroundColor: designTokens.colors.primary[500],
              color: designTokens.colors.white
            }}>
              <Typography 
                variant="h6" 
                sx={{
                  fontWeight: designTokens.typography.fontWeight.bold,
                  mb: designTokens.spacing[1]
                }}
              >
                🏆 인기 검색어 TOP 10
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ opacity: 0.9 }}
              >
                가장 많이 검색된 농약 성분들을 확인해보세요
              </Typography>
            </Box>
            <Box sx={{ p: designTokens.spacing[6] }}>
              <Grid container spacing={2}>
                {stats.popular_terms.slice(0, 10).map((term, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: designTokens.spacing[3],
                      backgroundColor: index < 3 ? designTokens.colors.primary[50] : designTokens.colors.gray[50],
                      borderRadius: designTokens.borderRadius.lg,
                      border: index < 3 ? `1px solid ${designTokens.colors.primary[200]}` : `1px solid ${designTokens.colors.gray[200]}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: index < 3 ? designTokens.colors.primary[100] : designTokens.colors.gray[100],
                        transform: 'translateX(4px)'
                      }
                    }}>
                      <Chip 
                        label={index + 1}
                        size="small"
                        sx={{
                          mr: designTokens.spacing[3],
                          backgroundColor: index < 3 ? designTokens.colors.primary[500] : designTokens.colors.gray[400],
                          color: designTokens.colors.white,
                          fontWeight: designTokens.typography.fontWeight.bold,
                          minWidth: '28px'
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="body1" 
                          sx={{
                            fontWeight: index < 3 ? designTokens.typography.fontWeight.bold : designTokens.typography.fontWeight.medium,
                            color: designTokens.colors.text.primary,
                            mb: '2px'
                          }}
                        >
                          {term.search_term}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ color: designTokens.colors.text.secondary }}
                        >
                          {term.count.toLocaleString()}회 검색
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* 일별 검색 통계 카드 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{
            borderRadius: designTokens.borderRadius.xl,
            border: `1px solid ${designTokens.colors.gray[200]}`,
            backgroundColor: designTokens.colors.white,
            height: 'fit-content'
          }}>
            <Box sx={{
              p: designTokens.spacing[6],
              backgroundColor: designTokens.colors.status.info,
              color: designTokens.colors.white
            }}>
              <Typography 
                variant="h6" 
                sx={{
                  fontWeight: designTokens.typography.fontWeight.bold,
                  mb: designTokens.spacing[1]
                }}
              >
                📅 최근 7일 검색 현황
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ opacity: 0.9 }}
              >
                일별 검색 트렌드를 확인하세요
              </Typography>
            </Box>
            <Box sx={{ p: designTokens.spacing[6] }}>
              {stats.daily_searches?.map((day, index) => {
                const date = new Date(day.timestamp__date);
                const isToday = date.toDateString() === new Date().toDateString();
                const maxCount = Math.max(...stats.daily_searches.map(d => d.count));
                const percentage = (day.count / maxCount) * 100;
                
                return (
                  <Box key={index} sx={{ mb: designTokens.spacing[3] }}>  
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{
                          fontWeight: isToday ? designTokens.typography.fontWeight.bold : designTokens.typography.fontWeight.medium,
                          color: isToday ? designTokens.colors.primary[600] : designTokens.colors.text.primary
                        }}
                      >
                        {date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        {isToday && <Chip label="오늘" size="small" sx={{ ml: 1, fontSize: '10px', height: '18px' }} />}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{
                          fontWeight: designTokens.typography.fontWeight.bold,
                          color: designTokens.colors.text.primary
                        }}
                      >
                        {day.count.toLocaleString()}회
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: designTokens.colors.gray[200],
                      borderRadius: designTokens.borderRadius.full,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: isToday ? designTokens.colors.primary[500] : designTokens.colors.status.info,
                        transition: 'width 0.3s ease'
                      }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchStatistics;