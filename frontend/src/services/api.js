import axios from 'axios';

// 환경변수 디버깅을 위한 로그 추가
console.log('All env variables:', process.env);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
console.log('API_BASE_URL:', API_BASE_URL);
const PUBCHEM_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';


export const api = {
  // 회원가입
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/signup/`, {  // URL 수정
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    return response.json();
  },
  
  // 농약 목록 조회
  getPesticides: async (params) => {
    console.log('Making request to:', `${API_BASE_URL}/pesticides/`);  // 추가된 로그
    console.log('With params:', params);  // 추가된 로그
    try {  // try-catch 추가
      const response = await axios.get(`${API_BASE_URL}/pesticides/`, { params });
      console.log('Response:', response);  // 추가된 로그
      return response.data;
    } catch (error) {
      console.error('Error in getPesticides:', error);  // 추가된 로그
      throw error;
    }
  },

  // 조건 코드 목록 조회
  getConditions: async () => {
    const response = await axios.get(`${API_BASE_URL}/conditions/`);
    return response.data;
  },

  // 농약 검색
  searchPesticides: async (query) => {
    const response = await axios.get(`${API_BASE_URL}/pesticides/`, {
      params: { search: query }
    });
    return response.data;
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

  // 3D 구조 관련 함수들
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

  get3DStructureByCID: async (cid) => {
    try {
      const response = await axios.get(`${PUBCHEM_BASE_URL}/compound/cid/${cid}/record/SDF/?record_type=3d&response_type=display`);
      return response.data;
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
        results_count: resultsCount
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
  }
};