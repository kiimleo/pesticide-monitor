import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const PUBCHEM_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

export const api = {
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

  // PubChem API 함수 추가
  getChemicalStructure: async (compoundName) => {
    try {
      // 먼저 compound 정보 검색
      const response = await axios.get(`${PUBCHEM_BASE_URL}/compound/name/${encodeURIComponent(compoundName)}/property/IUPACName,CanonicalSMILES/JSON`);
      const cid = response.data.PropertyTable.Properties[0].CID;
      
      // 구조식 이미지 URL 반환
      return `${PUBCHEM_BASE_URL}/compound/cid/${cid}/PNG`;
    } catch (error) {
      console.error('Chemical structure fetch error:', error);
      return null;
    }
  }
};