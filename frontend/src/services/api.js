import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const PUBCHEM_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';


export const api = {
  // 회원가입
  signup: async (userData) => {
    const response = await fetch('http://localhost:8000/api/users/signup/', {
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
    const response = await axios.get(`${API_BASE_URL}/pesticides/`, { params });
    return response.data;
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