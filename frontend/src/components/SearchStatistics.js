import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Box
} from '@mui/material';

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
    // 5분마다 통계 새로고침
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        검색 통계
      </Typography>
      
      <Grid container spacing={3}>
        {/* 전체 통계 카드 */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                전체 통계
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="총 검색 횟수" 
                    secondary={stats.total_searches.toLocaleString()} 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="고유 검색어 수" 
                    secondary={stats.unique_terms.toLocaleString()} 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="최근 7일 검색 횟수" 
                    secondary={stats.recent_searches.toLocaleString()} 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 인기 검색어 카드 */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                인기 검색어 TOP 10
              </Typography>
              <List>
                {stats.popular_terms.map((term, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={`${index + 1}. ${term.search_term}`}
                      secondary={`${term.count.toLocaleString()}회 검색됨`}
                      primaryTypographyProps={{ fontWeight: index < 3 ? 'bold' : 'medium' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 일별 검색 통계 카드 */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                최근 7일 일별 검색 횟수
              </Typography>
              <List>
                {stats.daily_searches?.map((day, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={new Date(day.timestamp__date).toLocaleDateString()}
                      secondary={`${day.count.toLocaleString()}회 검색`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchStatistics;