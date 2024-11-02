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

      // 성공 처리
      setSuccess(true);
      // 3초 후 메인 페이지로 이동
      setTimeout(() => {
        window.location.href = '/';  // 또는 로그인 페이지로 이동
      }, 3000);

    } catch (err) {
      setError(err.message);
    }
  };