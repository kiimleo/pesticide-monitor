import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
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
  },

  // 새로 추가하는 3D 구조 관련 함수들
  get3DStructure: async (compoundName) => {
    try {
      // 1. 먼저 CID 얻기
      const response = await axios.get(`${PUBCHEM_BASE_URL}/compound/name/${encodeURIComponent(compoundName)}/property/IUPACName,CanonicalSMILES/JSON`);
      const cid = response.data.PropertyTable.Properties[0].CID;
      
      // 2. 3D SDF 형식으로 구조 데이터 가져오기
      const sdfResponse = await axios.get(`${PUBCHEM_BASE_URL}/compound/cid/${cid}/record/SDF/?record_type=3d&response_type=display`);
      return sdfResponse.data;
    } catch (error) {
      console.error('3D structure fetch error:', error);
      return null;
    }
  },

  // CID로 직접 3D 구조 가져오기 (선택적)
  get3DStructureByCID: async (cid) => {
    try {
      const response = await axios.get(`${PUBCHEM_BASE_URL}/compound/cid/${cid}/record/SDF/?record_type=3d&response_type=display`);
      return response.data;
    } catch (error) {
      console.error('3D structure fetch error:', error);
      return null;
    }
  }
};