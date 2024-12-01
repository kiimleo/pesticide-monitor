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
   // 포커스를 식품명 입력 필드로 이동
   document.getElementById('food-input').focus();
 };

 return (
   <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
     <Box component="form" onSubmit={handleSubmit}>
       <Grid container spacing={2}>
         {/* 식품명 입력 */}
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

         {/* 농약성분명 입력 */}
         <Grid item xs={12} md={5}>
           <TextField
             fullWidth
             label="농약성분명 (한글/영문)"
             value={pesticide}
             onChange={(e) => setPesticide(e.target.value)}
             placeholder="예: 가스가마이신 또는 Kasugamycin"
             required
             helperText="한글명 또는 영문명으로 검색 가능합니다"
           />
         </Grid>

         {/* 버튼 그룹 */}
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