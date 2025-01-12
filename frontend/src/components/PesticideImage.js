// src/components/PesticideImage.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

const PesticideImage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const brandName = searchParams.get('name');
    const pesticideType = searchParams.get('type');
    
    if (!brandName) {
      setError('상표명이 제공되지 않았습니다.');
      setLoading(false);
      return;
    }

    const searchQuery = `${brandName} ${pesticideType} 농약`;
    document.title = `${brandName} 제품 이미지`;

    // 이미지 검색 결과 페이지로 리다이렉트
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch`;
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Box>
    );
  }

  return null;
};

export default PesticideImage;