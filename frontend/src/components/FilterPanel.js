import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Stack
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';  // 초기화 아이콘

const FilterPanel = ({ onFilter, onReset }) => {
  const [filters, setFilters] = useState({
    pesticide: '',
    food: ''
  });

  const handleChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  // 초기화 함수
  const handleReset = () => {
    setFilters({ pesticide: '', food: '' });
    onReset();
    // 포커스를 농약성분명 입력 필드로 이동 (선택사항)
    document.getElementById('pesticide-input').focus();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              id="pesticide-input"
              fullWidth
              label="농약성분명 (한글/영문)"
              value={filters.pesticide}
              onChange={handleChange('pesticide')}
              placeholder="예: 가스가마이신 또는 Kasugamycin"
              required
              helperText="한글명 또는 영문명으로 검색 가능합니다"
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="식품명"
              value={filters.food}
              onChange={handleChange('food')}
              placeholder="예: 감귤"
              required
              helperText="식품명을 입력하세요"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Stack spacing={1}>
              <Button 
                fullWidth 
                variant="contained" 
                type="submit"
                size="large"
                disabled={!filters.pesticide || !filters.food}
              >
                검색
              </Button>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleReset}
                startIcon={<ClearIcon />}
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

export default FilterPanel;