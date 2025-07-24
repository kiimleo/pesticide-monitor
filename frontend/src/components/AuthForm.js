// frontend/src/components/AuthForm.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  Link,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const AuthForm = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    organization: '',
    terms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // URL 쿼리 파라미터에 따라 모드 설정
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const modeParam = searchParams.get('mode');
    if (modeParam === 'login') {
      setMode('login');
    } else if (modeParam === 'signup') {
      setMode('signup');
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('이메일을 입력해주세요.');
      return false;
    }

    if (mode !== 'forgot' && !formData.password) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }

    if (mode === 'signup') {
      if (!formData.organization) {
        setError('소속기관을 입력해주세요.');
        return false;
      }
      if (formData.password !== formData.password_confirm) {
        setError('비밀번호가 일치하지 않습니다.');
        return false;
      }
      if (formData.password.length < 8) {
        setError('비밀번호는 최소 8자 이상이어야 합니다.');
        return false;
      }
      if (!/[A-Za-z]/.test(formData.password)) {
        setError('비밀번호에 영문자가 포함되어야 합니다.');
        return false;
      }
      if (!/\d/.test(formData.password)) {
        setError('비밀번호에 숫자가 포함되어야 합니다.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      let url = '';
      let data = {};

      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://findpest.kr/api";

      if (mode === 'login') {
        url = `${API_BASE_URL}/users/login/`;
        data = {
          email: formData.email,
          password: formData.password
        };
      } else if (mode === 'signup') {
        url = `${API_BASE_URL}/users/signup/`;
        data = {
          email: formData.email,
          password: formData.password,
          password_confirm: formData.password_confirm,
          organization: formData.organization
        };
      } else if (mode === 'forgot') {
        url = `${API_BASE_URL}/users/password_reset_request/`;
        data = {
          email: formData.email
        };
      }

      const headers = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        if (mode === 'login' || mode === 'signup') {
          // 로그인 성공 시 토큰 저장
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          setSuccess(result.message);
          onLogin(result.user, result.token);
          // 로그인 성공 후 홈 페이지로 리다이렉트
          setTimeout(() => navigate('/'), 1000); // 성공 메시지를 1초간 보여준 후 리다이렉트
        } else if (mode === 'forgot') {
          setSuccess(result.message);
          setTimeout(() => setMode('login'), 3000);
        }
      } else {
        // 에러 처리
        if (result.non_field_errors) {
          setError(result.non_field_errors[0]);
        } else if (result.email) {
          setError(result.email[0]);
        } else if (result.password) {
          setError(result.password[0]);
        } else if (result.password_confirm) {
          setError(result.password_confirm[0]);
        } else if (result.organization) {
          setError(result.organization[0]);
        } else if (result.error) {
          setError(result.error);
        } else {
          setError('오류가 발생했습니다.');
        }
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      password_confirm: '',
      organization: '',
      terms: false
    });
    setError('');
    setSuccess('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          FindPest
        </Typography>
        <Typography variant="h6" align="center" gutterBottom color="text.secondary">
          {mode === 'login' && '로그인'}
          {mode === 'signup' && '회원가입'}
          {mode === 'forgot' && '비밀번호 찾기'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
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

          {mode !== 'forgot' && (
            <TextField
              fullWidth
              label="비밀번호"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              helperText={mode === 'signup' ? '최소 8자, 영문+숫자 포함' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}

          {mode === 'signup' && (
            <>
              <TextField
                fullWidth
                label="비밀번호 확인"
                name="password_confirm"
                type={showPasswordConfirm ? 'text' : 'password'}
                value={formData.password_confirm}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password confirm visibility"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        edge="end"
                      >
                        {showPasswordConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="소속기관 (개인이면 이름 입력)"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                margin="normal"
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                  />
                }
                label="이용약관에 동의합니다. (선택사항)"
                sx={{ mt: 1 }}
              />
            </>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? '처리 중...' : (
              mode === 'login' ? '로그인' :
              mode === 'signup' ? '회원가입' : '이메일 전송'
            )}
          </Button>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            {mode === 'login' && (
              <>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => switchMode('signup')}
                  sx={{ mr: 2 }}
                >
                  회원가입
                </Link>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => switchMode('forgot')}
                >
                  비밀번호 찾기
                </Link>
              </>
            )}

            {(mode === 'signup' || mode === 'forgot') && (
              <Link
                component="button"
                variant="body2"
                onClick={() => switchMode('login')}
              >
                로그인으로 돌아가기
              </Link>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AuthForm;