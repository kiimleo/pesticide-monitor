import React, { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { TextField, Paper, List, ListItem } from '@mui/material';
import * as api from '../services/api';

// value와 onChange prop 추가
const FoodAutocomplete = ({ onSelect, value = '', onChange }) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // value prop이 변경될 때 query 상태 업데이트
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // debounce 함수로 API 호출 최적화
  const fetchSuggestions = debounce(async (input) => {
    if (input.length >= 1) {    // 한글자만 입력해도 자동완성 시도
      const data = await api.getFoodAutocomplete(input);
      setSuggestions(data);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, 300);

  // 입력값 변경 처리
  const onInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    fetchSuggestions(newValue);
    
    // onChange prop이 있으면 호출
    if (onChange) {
      onChange(newValue);
    }
    
    // onSelect prop이 있으면 호출
    if (onSelect) {
      onSelect(newValue);
    }
  };

  // 제안 선택 처리
  const onSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // onChange prop이 있으면 호출
    if (onChange) {
      onChange(suggestion);
    }
    
    // onSelect prop이 있으면 호출
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  // 외부 클릭 시 제안 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef} style={{ position: 'relative' }}>
      <TextField
        fullWidth
        label="식품명"
        value={query}
        onChange={onInputChange}
        placeholder="예: 사과"
        required
        helperText="검색할 식품명을 입력하세요"
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'absolute', 
            width: '100%',  // 입력 필드와 같은 너비로 변경
            left: 0,
            top: '100%',
            zIndex: 1000, 
            maxHeight: '300px',  // 높이 증가
            overflowY: 'auto',
            overflowX: 'hidden',  // 가로 스크롤 방지
            mt: 0.5,
            border: '1px solid #e0e0e0'
          }}
        >
          <List sx={{ py: 0 }}>
            {suggestions.map((item, index) => (
              <ListItem 
                key={index}
                button
                onClick={() => onSuggestionClick(item)}
                sx={{ 
                  cursor: 'pointer', 
                  py: 1,
                  px: 2,
                  minHeight: 'auto',
                  whiteSpace: 'normal',  // nowrap에서 normal로 변경하여 줄바꿈 허용
                  wordBreak: 'keep-all',  // 한글 단어 단위로 줄바꿈
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                {item}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
};

export default FoodAutocomplete;