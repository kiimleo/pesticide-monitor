// frontend/src/components/PasswordReset.js

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';

const PasswordReset = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.new_password) {
      setError('새 비밀번호를 입력해주세요.');
      return false;
    }

    if (formData.new_password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return false;
    }

    if (!/[A-Za-z]/.test(formData.new_password)) {
      setError('비밀번호에 영문자가 포함되어야 합니다.');
      return false;
    }

    if (!/\\d/.test(formData.new_password)) {
      setError('비밀번호에 숫자가 포함되어야 합니다.');
      return false;
    }

    if (formData.new_password !== formData.new_password_confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
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
      const response = await fetch('/api/users/password_reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          new_password: formData.new_password,
          new_password_confirm: formData.new_password_confirm
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        if (result.error) {
          setError(result.error);
        } else if (result.new_password) {
          setError(result.new_password[0]);
        } else if (result.new_password_confirm) {
          setError(result.new_password_confirm[0]);
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

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          FindPest
        </Typography>
        <Typography variant="h6" align="center" gutterBottom color="text.secondary">
          새 비밀번호 설정
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
            <br />
            3초 후 로그인 페이지로 이동합니다.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="새 비밀번호"
            name="new_password"
            type="password"
            value={formData.new_password}
            onChange={handleChange}
            margin="normal"
            required
            helperText="최소 8자, 영문+숫자 포함"
          />

          <TextField
            fullWidth
            label="새 비밀번호 확인"
            name="new_password_confirm"
            type="password"
            value={formData.new_password_confirm}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || success}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? '처리 중...' : '비밀번호 변경'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PasswordReset;