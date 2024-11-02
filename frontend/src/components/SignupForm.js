// src/components/SignupForm.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    organization: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 기본 유효성 검사
    if (!formData.email || !formData.organization || !formData.password) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }


    try {
      const response = await fetch('http://localhost:8000/api/users/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          organization: formData.organization,
          password: formData.password
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '회원가입 중 오류가 발생했습니다.');
      }

      setSuccess(true);
      // 3초 후 메인 페이지로 이동
      setTimeout(() => {
        window.location.href = '/';  // 또는 로그인 페이지로 이동
      }, 3000);

      // 여기에 회원가입 성공 후 처리 (예: 로그인 페이지로 리다이렉트)
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom align="center">
            회원가입
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              회원가입이 완료되었습니다. 3초 후 메인 페이지로 이동합니다.
              <br/>
              로그인 후 서비스를 이용하실 수 있습니다.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="이메일"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="소속기관명 (개인의 경우 이름)"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              margin="normal"
              required
              helperText="소속기관명을 입력해주세요. 개인인 경우 이름을 입력하세요."
            />
            
            <TextField
              fullWidth
              label="비밀번호"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="비밀번호 확인"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
            >
              가입하기
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignupForm;