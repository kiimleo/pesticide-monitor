// path of this code : frontend/src/components/PesticideTable.js

import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Stack,
  CircularProgress
} from '@mui/material';
import PesticideAutocomplete from './PesticideAutocomplete';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { 
  Fullscreen as FullscreenIcon, 
  ThreeDRotation, 
  Add as AddIcon,
  Download as DownloadIcon,
  InfoOutlined 
} from '@mui/icons-material';
import { api } from '../services/api';
import * as XLSX from 'xlsx';

// formatResidueLimit 함수 유지
const formatResidueLimit = (value, conditionCode) => {
  const truncated = Math.floor(value * 100) / 100;
  const numericPart = truncated.toFixed(2).endsWith('0') 
    ? truncated.toFixed(1) 
    : truncated.toFixed(2);
    
  if (!conditionCode) return numericPart;
  
  // 괄호가 필요한 코드들
  const codesNeedingParentheses = ['f', 'F', 'E'];

  // † 코드는 위첨자로 표시
  if (conditionCode === '†') {
    return <span>{numericPart}<sup>{conditionCode}</sup></span>;
  }
  
  return codesNeedingParentheses.includes(conditionCode)
    ? `${numericPart}(${conditionCode})`
    : `${numericPart}${conditionCode}`;
};

const PesticideTable = ({ searchHistory, onReset, token }) => {
  // 상태 정의
  const [structureUrl, setStructureUrl] = useState(null);
  const [structure3D, setStructure3D] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewMode, setViewMode] = useState('2d');
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const fullscreenContainerRef = useRef(null);
  const fullscreenViewerRef = useRef(null);
  
  // 상태 추가
  const [selectedPesticide, setSelectedPesticide] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);  // 확장된 행 ID 저장
  const [loading3D, setLoading3D] = useState(false);  // 3D 로딩 상태

  // 구조 데이터 가져오기
  useEffect(() => {
    const fetchStructures = async () => {
      if (selectedPesticide) {
        const url = await api.getChemicalStructure(selectedPesticide.pesticide_name_en);
        setStructureUrl(url);
        
        // 3D 구조 가져오기
        if (viewMode === '3d') {
          const structure3DData = await api.get3DStructure(selectedPesticide.pesticide_name_en, token);
          setStructure3D(structure3DData);
        }
      }
    };
    fetchStructures();
  }, [selectedPesticide, viewMode, token]);

  // 3D 뷰어 초기화 (기존 코드 유지)
  useEffect(() => {
    if (viewMode === '3d' && structure3D && containerRef.current && !isFullScreen) {
      const viewer = window.$3Dmol.createViewer(containerRef.current, {
        defaultcolors: window.$3Dmol.rasmolElementColors
      });
      viewer.addModel(structure3D, "sdf");
      viewer.setStyle({}, {
        stick: {radius: 0.2},
        sphere: {radius: 0.4}
      });
      viewer.zoomTo();
      viewer.render();
      viewerRef.current = viewer;
      
      return () => {
        if (viewerRef.current) {
          viewerRef.current.clear();
        }
      };
    }
  }, [viewMode, structure3D, isFullScreen]);

  // 전체화면 3D 뷰어 초기화 (기존 코드 유지)
  useEffect(() => {
    if (viewMode === '3d' && structure3D && fullscreenContainerRef.current && isFullScreen) {
      const viewer = window.$3Dmol.createViewer(fullscreenContainerRef.current, {
        defaultcolors: window.$3Dmol.rasmolElementColors
      });
      viewer.addModel(structure3D, "sdf");
      viewer.setStyle({}, {
        stick: {radius: 0.2},
        sphere: {radius: 0.4}
      });
      viewer.zoomTo();
      viewer.render();
      fullscreenViewerRef.current = viewer;
      
      return () => {
        if (fullscreenViewerRef.current) {
          fullscreenViewerRef.current.clear();
        }
      };
    }
  }, [viewMode, structure3D, isFullScreen]);


  // handleReset 함수 - 부모 컴포넌트로 위임
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
    setSelectedPesticide(null);
    setStructureUrl(null);
    setStructure3D(null);
    setExpandedRow(null);
  };

  // 행클릭 핸들러
  const handleRowClick = async (sessionIndex, pesticideIndex, pesticide) => {
    const rowKey = `${sessionIndex}-${pesticideIndex}`;
    
    try {
      if (expandedRow === rowKey) {
        setExpandedRow(null);
      } else {
        const response = await api.getDetailInfo(
          pesticide.pesticide_name_kr,
          searchHistory[sessionIndex].searchParams.food
        );
        
        // 상세 데이터를 pesticide 객체에 추가
        pesticide.detailData = response;
        setExpandedRow(rowKey);
      }
    } catch (error) {
      console.error('상세 정보 조회 오류:', error);
    }
  };


  // 검색 기록이 없으면 아무것도 표시하지 않음
  if (!searchHistory || searchHistory.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      {/* 조회 결과 초기화 버튼 */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button
          variant="outlined"
          onClick={handleReset}
          size="small"
        >
          조회결과 초기화
        </Button>
      </Box>

      {/* 통합 테이블 헤더 */}
      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '30%' }}>농약성분명</TableCell>
              <TableCell align="center" sx={{ width: '20%' }}>잔류허용기준(mg/kg)</TableCell>
              <TableCell align="center" sx={{ width: '35%' }}>특이사항</TableCell>
              <TableCell align="center" sx={{ width: '15%' }}>Structure</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* 검색 세션별로 결과 표시 (최신순으로 정렬) */}
            {searchHistory.slice().reverse().map((session, sessionIndex) => (
              <React.Fragment key={session.id}>
                {/* 검색 세션 구분 행 */}
                <TableRow>
                  <TableCell colSpan={4} sx={{ bgcolor: '#f8f8f8', border: '2px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: '#333' }}>
                      검색 #{searchHistory.length - sessionIndex}: 
                      <Box component="span" sx={{ fontWeight: 'bold', color: '#4A7C59', mx: 0.5 }}>
                        {session.searchParams.pesticide}
                      </Box>
                      × 
                      <Box component="span" sx={{ color: '#1976d2', mx: 0.5 }}>
                        {session.searchParams.food}
                      </Box>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {session.timestamp.toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
                {session.results.length > 0 ? (
                  session.results.map((pesticide, pesticideIndex) => {
                    const rowKey = `${searchHistory.length - sessionIndex - 1}-${pesticideIndex}`;
                    return (
                      <React.Fragment key={rowKey}>
                        <TableRow sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                          <TableCell>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                                {pesticide.pesticide_name_kr}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {pesticide.pesticide_name_en}
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  mt: 1,
                                  color: '#4A7C59',
                                  borderColor: '#4A7C59',
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  minHeight: 'auto',
                                  '&:hover': {
                                    backgroundColor: 'rgba(74, 124, 89, 0.1)',
                                    borderColor: '#4A7C59'
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(searchHistory.length - sessionIndex - 1, pesticideIndex, pesticide);
                                }}
                              >
                                농약성분 상세조회
                              </Button>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ 
                            color: pesticide.max_residue_limit ? 'inherit' : 'error.main',
                            fontWeight: pesticide.max_residue_limit ? 'normal' : 'medium'
                          }}>
                            {pesticide.max_residue_limit 
                              ? formatResidueLimit(
                                  pesticide.max_residue_limit, 
                                  pesticide.condition_code_symbol
                                )
                              : '허가되지 않은 농약성분'}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {pesticide.condition_code_description || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                {pesticide.pesticide_name_kr}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                <ToggleButtonGroup
                                  value={null}
                                  exclusive
                                  size="small"
                                >
                                  <ToggleButton 
                                    value="2d" 
                                    sx={{ fontSize: '10px', py: 0.5 }}
                                    onClick={async () => {
                                      setViewMode('2d');
                                      setSelectedPesticide(pesticide);
                                      const url = await api.getChemicalStructure(pesticide.pesticide_name_en);
                                      setStructureUrl(url);
                                      setIsFullScreen(true);
                                    }}
                                  >
                                    2D
                                  </ToggleButton>
                                  <ToggleButton 
                                    value="3d" 
                                    sx={{ fontSize: '10px', py: 0.5 }}
                                    onClick={async () => {
                                      setViewMode('3d');
                                      setSelectedPesticide(pesticide);
                                      setLoading3D(true);
                                      setIsFullScreen(true);
                                      try {
                                        const structure3DData = await api.get3DStructure(pesticide.pesticide_name_en, token);
                                        setStructure3D(structure3DData);
                                      } finally {
                                        setLoading3D(false);
                                      }
                                    }}
                                  >
                                    <ThreeDRotation fontSize="small" />
                                  </ToggleButton>
                                </ToggleButtonGroup>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                        {expandedRow === rowKey && (
                          <TableRow>
                            <TableCell colSpan={4} sx={{ bgcolor: '#f8f8f8', p: 3 }}>
                              {Array.isArray(pesticide.detailData) && pesticide.detailData.length > 0 ? (
                                pesticide.detailData.map((group, groupIndex) => (
                                  <Box key={groupIndex} sx={{ mb: 2 }}>
                                    <Typography 
                                      variant="subtitle1" 
                                      sx={{ 
                                        fontWeight: 'bold',
                                        color: '#4A7C59',
                                        mb: 2
                                      }}
                                    >
                                      {group.pesticide_name} 함유 수화제
                                    </Typography>
                                    <Grid container spacing={2}>
                                      <Grid item xs={3}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>상표명</Typography>
                                      </Grid>
                                      <Grid item xs={2}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>용도</Typography>
                                      </Grid>
                                      <Grid item xs={3}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>병해충/잡초명</Typography>
                                      </Grid>
                                      <Grid item xs={4}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>제조사</Typography>
                                      </Grid>
                                    </Grid>
                                    {group.products && group.products.map((product, productIndex) => (
                                      <Grid container spacing={2} key={productIndex} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                                        <Grid item xs={3}>
                                          <Typography 
                                            variant="body2"
                                            onClick={() => window.open(`/pesticide-image?name=${encodeURIComponent(product.brand_name)}&type=${encodeURIComponent(product.purpose)}`, '_blank')}
                                            sx={{ 
                                              cursor: 'pointer',
                                              color: '#4A7C59',
                                              '&:hover': {
                                                textDecoration: 'underline'
                                              }
                                            }}
                                          >
                                            {product.brand_name || '-'}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                          <Typography variant="body2">{product.purpose || '-'}</Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                          <Typography variant="body2">{product.target_pest || '-'}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                          <Typography variant="body2">{product.company || '-'}</Typography>
                                        </Grid>
                                      </Grid>
                                    ))}
                                  </Box>
                                ))
                              ) : (
                                <Typography color="text.secondary" textAlign="center">
                                  상세 데이터가 데이터베이스에 존재하지 않습니다
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="text.secondary">
                        검색 결과가 없습니다
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 카테고리 매칭 안내 메시지 */}
      {searchHistory
        .flatMap(session => session.results)
        .filter(p => p.matching_type === 'sub' || p.matching_type === 'main')
        .map((p, index) => (
          <Box 
            key={`${p.pesticide_name_en}-${index}`}
            sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: '#f5f5f5', 
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography variant="body2" color="textSecondary">
              <InfoOutlined sx={{ fontSize: 'small', verticalAlign: 'middle', mr: 1 }} />
              [{p.pesticide_name_en}] 성분에 대한 '{p.original_food_name}'의 잔류허용기준이 별도로 설정되어 있지 않아, 
              상위 분류인 '{p.food_name}'의 기준을 적용하고 있습니다.
            </Typography>
          </Box>
        ))
      }

      {/* 전체화면 모달 (기존 코드 유지) */}
      <Dialog
        fullScreen
        open={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        sx={{ 
          '& .MuiDialog-paper': { 
            bgcolor: 'white',
            padding: 0,
            margin: 0
          }
        }}
      >
        <Box sx={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          backgroundColor: 'white'
        }}>
          <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1000 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={async (e, newMode) => {
                if (newMode && selectedPesticide) {
                  setViewMode(newMode);
                  if (newMode === '3d' && !structure3D) {
                    setLoading3D(true);
                    try {
                      const structure3DData = await api.get3DStructure(selectedPesticide.pesticide_name_en, token);
                      setStructure3D(structure3DData);
                    } finally {
                      setLoading3D(false);
                    }
                  } else if (newMode === '2d' && !structureUrl) {
                    const url = await api.getChemicalStructure(selectedPesticide.pesticide_name_en);
                    setStructureUrl(url);
                  }
                }
              }}
              size="small"
              sx={{ mr: 1 }}
            >
              <ToggleButton value="2d">2D</ToggleButton>
              <ToggleButton value="3d">
                <ThreeDRotation />
              </ToggleButton>
            </ToggleButtonGroup>
            <IconButton 
              onClick={() => setIsFullScreen(false)}
              sx={{ 
                color: 'black',
                bgcolor: 'white',
                '&:hover': { bgcolor: 'grey.100' },
                boxShadow: 1
              }}
            >
              <FullscreenIcon />
            </IconButton>
          </Box>

          {viewMode === '2d' && structureUrl ? (
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              centerOnInit={true}
            >
              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  height: '100%'
                }}
              >
                <img
                  src={structureUrl}
                  alt="Chemical Structure"
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    margin: 'auto'
                  }}
                />
              </TransformComponent>
            </TransformWrapper>
          ) : viewMode === '3d' ? (
            loading3D ? (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'grey.50'
                }}
              >
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ ml: 2 }}>
                  3D 구조 데이터 로딩 중...
                </Typography>
              </Box>
            ) : structure3D ? (
              <div
                ref={fullscreenContainerRef}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative'
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'grey.50'
                }}
              >
                <Typography variant="h6" color="text.secondary" textAlign="center">
                  3D 구조 데이터를 불러올 수 없습니다
                  <br />
                  <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                    일부 화합물은 3D 구조 정보가 제공되지 않을 수 있습니다
                  </Typography>
                </Typography>
              </Box>
            )
          ) : null}
        </Box>
      </Dialog>
    </Box>
  );
};
 
 export default PesticideTable;