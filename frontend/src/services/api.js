// frontend/src/services/api.js

import axios from 'axios';

// 환경변수 디버깅을 위한 로그 추가
console.log('All env variables:', process.env);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// API 기본 URL 설정
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://findpest.kr/api";


console.log('API Configuration:', {
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// PubChem API URL
const PUBCHEM_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

// 농약성분명 자동완성 함수 - 별도 export
export const getPesticideAutocomplete = async (query) => {
  try {
    console.log('Autocomplete query:', query);
    const response = await axios.get(`${API_BASE_URL}/pesticides/autocomplete/`, {
      params: { query },
    });
    console.log('Autocomplete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Autocomplete fetch error:', error);
    throw error;
  }
};

// 식품명 자동완성 함수 - 별도 export
export const getFoodAutocomplete = async (query) => {
  try {
    console.log('Food autocomplete query:', query);
    const response = await axios.get(`${API_BASE_URL}/pesticides/food_autocomplete/`, {
      params: { query },
    });
    console.log('Food autocomplete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Food autocomplete fetch error:', error);
    return [];
  }
};

// 검정증명서 PDF 업로드 및 분석
export const uploadCertificate = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/certificates/upload/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Certificate upload error:', error);
    throw error;
  }
};


export const api = {
  // 회원가입
  signup: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/signup/`, userData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  // uploadCertificate 함수 여기에 추가
  uploadCertificate: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/certificates/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Certificate upload error:', error);
      throw error;
    }
  },

  // 농약 목록 조회
  getPesticides: async (params) => {
    try {
      console.log('Pesticides params:', params);
      const response = await axios.get(`${API_BASE_URL}/pesticides/`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pesticides:', error);
      throw error;
    }
  },

  // 조건 코드 목록 조회
  getConditions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conditions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conditions:', error);
      throw error;
    }
  },

  // 농약 검색
  searchPesticides: async ({ pesticide, food }) => {
    try {
      console.log('Search parameters:', { pesticide, food });
      const response = await axios.get(`${API_BASE_URL}/pesticides/`, {
        params: { pesticide, food },
      });
      return response.data;
    } catch (error) {
      console.error('Search pesticides error:', error);
      throw error;
    }
  },

  // 농약 상세 정보 호출하기
  getDetailInfo: async (pesticide, food) => {
    try {
      console.log('Fetching detail info:', { pesticide, food });
      const response = await axios.get(`${API_BASE_URL}/pesticides/detail/`, {
        params: { pesticide, food },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching detail info:', error);
      throw error;
    }
  },

  // PubChem API 함수
  getChemicalStructure: async (compoundName) => {
    try {
      const response = await axios.get(`${PUBCHEM_BASE_URL}/compound/name/${encodeURIComponent(compoundName)}/property/IUPACName,CanonicalSMILES/JSON`);
      const cid = response.data.PropertyTable.Properties[0].CID;
      return `${PUBCHEM_BASE_URL}/compound/cid/${cid}/PNG`;
    } catch (error) {
      console.error('Chemical structure fetch error:', error);
      return null;
    }
  },

  get3DStructure: async (compoundName) => {
    try {
      const response = await axios.get(`${PUBCHEM_BASE_URL}/compound/name/${encodeURIComponent(compoundName)}/property/IUPACName,CanonicalSMILES/JSON`);
      const cid = response.data.PropertyTable.Properties[0].CID;
      const sdfResponse = await axios.get(`${PUBCHEM_BASE_URL}/compound/cid/${cid}/record/SDF/?record_type=3d&response_type=display`);
      return sdfResponse.data;
    } catch (error) {
      console.error('3D structure fetch error:', error);
      return null;
    }
  },

  // 검색 결과 로깅
  logSearch: async (pesticide, food, resultsCount) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/pesticides/`, {
        pesticide_term: pesticide,
        food_term: food,
        results_count: resultsCount,
      });
      return response.data;
    } catch (error) {
      console.error('Error logging search:', error);
      throw error;
    }
  },

  // 검색 통계 조회
  getSearchStatistics: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pesticides/search_statistics/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },
};
