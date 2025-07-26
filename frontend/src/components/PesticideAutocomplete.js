// path of this code : frontend/src/components/PesticideAutocomplete.js

import React, { useState, useEffect, useCallback } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { debounce } from 'lodash';
import { API_BASE_URL, getPesticideAutocomplete } from '../services/api'; // API_BASE_URL과 getPesticideAutocomplete 가져오기


const PesticideAutocomplete = ({ value, onChange, onReset }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      // query 값이 비어 있거나 너무 짧은 경우 요청하지 않음
      if (!query || query.length < 2) {
        console.log('Query too short:', query);
        setOptions([]);
        return;
      }
  
      setLoading(true);
      try {
        // 로그 추가: query와 URL 출력
        console.log('Query for autocomplete:', query);
        console.log('Autocomplete full URL:', `${API_BASE_URL}/api/pesticides/autocomplete/?query=${query}`);
  
        // API 호출
        const response = await getPesticideAutocomplete(query);
  
        // 응답 데이터 설정
        console.log('Autocomplete response:', response);
        setOptions(response);
      } catch (error) {
        // 에러 로그 출력
        console.error('Failed to fetch suggestions:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );
  

  return (
    <Autocomplete
      id="pesticide-autocomplete"
      freeSolo
      value={value}
      inputValue={inputValue}
      options={options}
      getOptionLabel={(option) => 
        typeof option === 'string' 
          ? option 
          : `${option.pesticide_name_kr} (${option.pesticide_name_en})`
      }
      onInputChange={(_, newValue) => {
        setInputValue(newValue);
        fetchSuggestions(newValue);
      }}
      onChange={(_, newValue) => {
        onChange(typeof newValue === 'string' ? newValue : newValue?.pesticide_name_kr || '');
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="농약성분명 (한글/영문)"
          placeholder="예: 가스가마이신 또는 Kasugamycin"
          helperText="검색할 농약성분명을 입력하세요"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={20} />}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  );
};

export default PesticideAutocomplete;