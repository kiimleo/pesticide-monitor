import React, { useState } from 'react';
import {
Box,
TextField,
Button,
Grid,
Paper,
Stack
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import PesticideAutocomplete from './PesticideAutocomplete';

const FilterPanel = ({ onFilter, onReset }) => {
const [food, setFood] = useState('');
const [pesticide, setPesticide] = useState('');

const handleSubmit = (e) => {
  e.preventDefault();
  if (food && pesticide) {
    onFilter({ food, pesticide });
  }
};

const handleReset = () => {
  setFood('');
  setPesticide('');
  onReset();
  document.getElementById('food-input').focus();
};

return (
  <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <TextField
            id="food-input"
            fullWidth
            label="식품명"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            placeholder="예: 사과"
            required
            helperText="검색할 식품명을 입력하세요"
          />
        </Grid>

        <Grid item xs={12} md={5}>
          <PesticideAutocomplete
            value={pesticide}
            onChange={(value) => setPesticide(value)}
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