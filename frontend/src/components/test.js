const handleFilter = async (filters) => {
    try {
      setLoading(true);
      setError(null);
      
      // 공백 제거 처리
      const params = {
        pesticide: filters.pesticide.trim().replace(/\s+/g, ''),  // 모든 공백 제거
        food: filters.food.trim()  // 앞뒤 공백만 제거
      };
      
      try {
        const data = await api.getPesticides(params);
        setPesticides(data);
        setError(null);
      } catch (error) {
        // ... 나머지 코드는 동일
      }
    } finally {
      setLoading(false);
    }
  };