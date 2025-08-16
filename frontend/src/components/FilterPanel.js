// path of this code : frontend/src/components/FilterPanel.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  Divider,
  Chip
} from '@mui/material';
import { 
  Clear as ClearIcon,
  Science as ScienceIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import PesticideAutocomplete from './PesticideAutocomplete';
import FoodAutocomplete from './FoodAutocomplete';
import { labThemeTokens } from '../theme/labThemeTokens';

const FilterPanel = ({ onFilter, onReset, prefilledFood = '' }) => {
  const [food, setFood] = useState('');
  const [pesticide, setPesticide] = useState('');

  // 미리 입력된 식품명이 있으면 설정
  useEffect(() => {
    if (prefilledFood) {
      setFood(prefilledFood);
    }
  }, [prefilledFood]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (food && pesticide) {
      onFilter({ food, pesticide });
    }
  };

  const handleFilterPanelReset = () => {
    setFood('');
    setPesticide('');  // 농약성분명 상태 초기화
    // document.getElementById('food-input').focus();
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 4,
        mb: 3,
        background: `linear-gradient(135deg, ${labThemeTokens.colors.background.paper} 0%, ${labThemeTokens.colors.lab.beaker} 100%)`,
        border: `1px solid ${labThemeTokens.colors.gray[200]}`,
        borderRadius: labThemeTokens.borderRadius['2xl'],
        boxShadow: labThemeTokens.shadows.elevated,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${labThemeTokens.colors.primary[500]} 0%, ${labThemeTokens.colors.accent[500]} 100%)`,
        }
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ScienceIcon sx={{ 
            mr: 2, 
            color: labThemeTokens.colors.primary[600],
            fontSize: '28px'
          }} />
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: labThemeTokens.typography.fontWeight.semibold,
              color: labThemeTokens.colors.text.primary,
              letterSpacing: '-0.5px'
            }}
          >
            잔류농약 허용기준 검색
          </Typography>
          <Chip 
            label="Laboratory Analysis" 
            size="small"
            sx={{ 
              ml: 2,
              backgroundColor: labThemeTokens.colors.primary[100],
              color: labThemeTokens.colors.primary[700],
              fontWeight: labThemeTokens.typography.fontWeight.medium,
              fontSize: '12px'
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ mb: 3, borderColor: labThemeTokens.colors.gray[200] }} />

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <FoodAutocomplete
              value={food}
              onChange={(value) => setFood(value)} 
              onSelect={(value) => setFood(value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: labThemeTokens.colors.background.paper,
                  borderRadius: labThemeTokens.borderRadius.lg,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: labThemeTokens.colors.primary[400]
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: labThemeTokens.colors.primary[500],
                      borderWidth: '2px'
                    }
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <PesticideAutocomplete
              value={pesticide || ''}
              onChange={(value) => setPesticide(value)}
              key={`pesticide-${pesticide}`}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: labThemeTokens.colors.background.paper,
                  borderRadius: labThemeTokens.borderRadius.lg,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: labThemeTokens.colors.primary[400]
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: labThemeTokens.colors.primary[500],
                      borderWidth: '2px'
                    }
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack spacing={1.5} sx={{ height: '100%', pt: 2.5 }}>
              <Button
                variant="contained"
                type="submit"
                disabled={!food || !pesticide}
                startIcon={<SearchIcon />}
                sx={{ 
                  height: '56px',
                  backgroundColor: labThemeTokens.colors.primary[600],
                  color: 'white',
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  fontSize: '16px',
                  borderRadius: labThemeTokens.borderRadius.lg,
                  boxShadow: labThemeTokens.shadows.md,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: labThemeTokens.colors.primary[700],
                    boxShadow: labThemeTokens.shadows.lg,
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    backgroundColor: labThemeTokens.colors.gray[300],
                    color: labThemeTokens.colors.gray[500]
                  }
                }}
              >
                검색
              </Button>
              <Button
                variant="outlined"
                onClick={handleFilterPanelReset}
                startIcon={<ClearIcon />}
                sx={{
                  borderColor: labThemeTokens.colors.gray[300],
                  color: labThemeTokens.colors.text.secondary,
                  borderRadius: labThemeTokens.borderRadius.lg,
                  '&:hover': {
                    borderColor: labThemeTokens.colors.gray[400],
                    backgroundColor: labThemeTokens.colors.gray[50]
                  }
                }}
              >
                초기화
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

// 컴포넌트 export 추가
export default FilterPanel;