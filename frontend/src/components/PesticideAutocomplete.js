// path of this code : frontend/src/components/PesticideAutocomplete.js

import React, { useState, useEffect, useCallback } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { debounce } from 'lodash';
import { api } from '../services/api';

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
      if (!query || query.length < 2) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const response = await api.getPesticideAutocomplete(query);
        setOptions(response);
      } catch (error) {
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