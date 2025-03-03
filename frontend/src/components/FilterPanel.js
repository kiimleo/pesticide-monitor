// path of this code : frontend/src/components/FilterPanel.js

import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import PesticideAutocomplete from './PesticideAutocomplete';
import FoodAutocomplete from './FoodAutocomplete';

const FilterPanel = ({ onFilter, onReset }) => {
  const [food, setFood] = useState('');
  const [pesticide, setPesticide] = useState('');

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
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <FoodAutocomplete
              value={food}  // value prop 추가
              onChange={(value) => setFood(value)} 
              onSelect={(value) => setFood(value)}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <PesticideAutocomplete
              value={pesticide || ''}  // null 대신 빈 문자열 전달
              onChange={(value) => setPesticide(value)}
              key={`pesticide-${pesticide}`}  // key prop 추가
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack spacing={1} sx={{ height: '100%' }}>
              <Button
                variant="contained"
                type="submit"
                disabled={!food || !pesticide}
                sx={{ height: '56px' }}
              >
                검색
              </Button>
              <Button
                variant="outlined"
                onClick={handleFilterPanelReset}
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

// 컴포넌트 export 추가
export default FilterPanel;