// path of this code : C:\Users\leo\pesticide\frontend\src\components\PesticideTable.js

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
  Stack
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

// 기존의 formatResidueLimit 함수 유지
const formatResidueLimit = (value) => {
  const truncated = Math.floor(value * 100) / 100;
  return truncated.toFixed(2).endsWith('0') ? truncated.toFixed(1) : truncated.toFixed(2);
};

const PesticideTable = ({ pesticides: initialPesticides, searchedFood }) => {
  // 상태 정의
  const [structureUrl, setStructureUrl] = useState(null);
  const [structure3D, setStructure3D] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewMode, setViewMode] = useState('2d');
  const [searchHistory, setSearchHistory] = useState([]);
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const fullscreenContainerRef = useRef(null);
  const fullscreenViewerRef = useRef(null);
  
  // 새로운 상태 추가
  const [selectedPesticide, setSelectedPesticide] = useState(null);
  const [newPesticideName, setNewPesticideName] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);  // 확장된 행 ID 저장


  // 초기 데이터 설정
  useEffect(() => {
    if (initialPesticides.length > 0) {
      setSearchHistory(initialPesticides.map(p => ({
        ...p,
        timestamp: new Date().getTime()
      })));
      setSelectedPesticide(initialPesticides[0]);
    }
  }, [initialPesticides]);

  // 구조 데이터 가져오기
  useEffect(() => {
    const fetchStructures = async () => {
      if (selectedPesticide) {
        const url = await api.getChemicalStructure(selectedPesticide.pesticide_name_en);
        setStructureUrl(url);
        const structure3D = await api.get3DStructure(selectedPesticide.pesticide_name_en);
        setStructure3D(structure3D);
      }
    };
    fetchStructures();
  }, [selectedPesticide]);

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


  // 새로운 농약성분 추가
  const handleAddPesticide = async () => {
    if (!newPesticideName.trim()) return;
    setLoading(true);
    try {
      const response = await api.getPesticides({
        pesticide: newPesticideName,
        food: searchedFood
      });
      
      const timestamp = new Date().getTime();
      if (Array.isArray(response)) {
        const newPesticides = response.map(p => ({
          ...p,
          timestamp
        }));
        setSearchHistory(prev => [...prev, ...newPesticides]);
      }
      setNewPesticideName('');
    } catch (error) {
      if (error.response?.data?.error_type === 'not_permitted') {
        const newNotPermitted = {
          pesticide_name_kr: error.response.data.pesticide_name_kr,
          pesticide_name_en: error.response.data.pesticide_name_en,
          max_residue_limit: null,
          timestamp: new Date().getTime()
        };
        setSearchHistory(prev => [...prev, newNotPermitted]);
        setNewPesticideName('');
      }
    } finally {
      setLoading(false);
    }
  };

  // handleReset 함수 추가 (state 관련 함수들 근처에)
  const handleReset = () => {
    setSearchHistory([]); // searchHistory 초기화
    setNewPesticideName(''); // 입력 필드 초기화
    setSelectedPesticide(null); // 선택된 농약 정보 초기화
    setStructureUrl(null); // 구조 이미지 초기화
    setStructure3D(null); // 3D 구조 초기화
  };

  // 엑셀 다운로드
  const handleDownload = () => {
    // 확장된 정보를 포함하는 데이터 구조로 수정
    const xlsxData = [
      ['식품명', '농약성분명(한글)', '농약성분명(영문)', '잔류허용기준(mg/kg)','상표명', '용도', 
       '작물명', '병해충/잡초명', '사용적기', '희석배수', '사용횟수', 
       '법인명', '제조/수입구분', '등록유효일자', '등록일자', 
       '등록여부', '생태독성', '비고'],
      ...searchHistory.map(p => [
        searchedFood,
        p.pesticide_name_kr,
        p.pesticide_name_en,
        p.max_residue_limit ? formatResidueLimit(p.max_residue_limit) : '허가되지 않은 농약성분',
        p.BRND_NM || '',          // 상표명
        p.PRPOS_DVS_CD_NM || '', // 용도
        p.CROPS_NM || '',        // 작물명
        p.SICKNS_HLSCT_NM_WEEDS_NM || '', // 병해충/잡초명 
        p.USE_PPRTM || '',       // 사용적기
        p.DILU_DRNG || '',       // 희석배수
        p.USE_TMNO || '',        // 사용횟수
        p.CPR_NM || '',          // 법인명
        p.MNF_INCM_DVS_NM || '', // 제조/수입구분
        p.PRDLST_REG_VALD_DT || '', // 등록유효일자
        p.PRDLST_REG_DT || '',   // 등록일자
        p.REG_YN_NM || '',       // 등록여부
        p.ECLGY_TOXCTY || '',    // 생태독성
        p.condition_code_description || ''
      ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(xlsxData);
    
    // 열 너비 자동 조정
    const wscols = xlsxData[0].map(() => ({ wch: 15 })); // 기본 너비 15
    ws['!cols'] = wscols;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "농약정보");
    
    XLSX.writeFile(wb, `농약정보_${searchedFood}_${new Date().toLocaleDateString()}.xlsx`);
   };

  // 행클릭 핸들러
  const handleRowClick = async (index, pesticide) => {
    setLoading(true);
    try {
        if (expandedRow === index) {
            setExpandedRow(null);
        } else {
            const response = await api.getDetailInfo(
                pesticide.pesticide_name_kr,
                searchedFood
            );
            
            const updatedHistory = [...searchHistory];
            updatedHistory[index] = {
                ...updatedHistory[index],
                detailData: response  // API 응답을 직접 할당
            };
            setSearchHistory(updatedHistory);
            setExpandedRow(index);
        }
    } catch (error) {
        console.error('상세 정보 조회 오류:', error);
    } finally {
        setLoading(false);
    }
};


  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        {/* 좌측: 검색된 식품 정보 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                검색된 식품
              </Typography>
              <Typography variant="h5" color="primary">
                {searchedFood}
              </Typography>
              
              {/* 2D/3D 구조 표시 (기존 코드 유지) */}
              {selectedPesticide && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">
                      {selectedPesticide.pesticide_name_kr}
                      <Typography variant="body2" color="textSecondary">
                        {selectedPesticide.pesticide_name_en}
                      </Typography>
                    </Typography>
                    <Box>
                      <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, newMode) => newMode && setViewMode(newMode)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <ToggleButton value="2d">2D</ToggleButton>
                        <ToggleButton value="3d">
                          <ThreeDRotation />
                        </ToggleButton>
                      </ToggleButtonGroup>
                      <IconButton onClick={() => setIsFullScreen(true)}>
                        <FullscreenIcon />
                      </IconButton>
                    </Box>
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
                          height: '300px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <img
                          src={structureUrl}
                          alt="Chemical Structure"
                          style={{ 
                            width: '90%',
                            height: '90%',
                            objectFit: 'contain'
                          }}
                        />
                      </TransformComponent>
                    </TransformWrapper>
                  ) : viewMode === '3d' ? (
                    <div
                      ref={containerRef}
                      style={{
                        width: '100%',
                        height: '300px',
                        position: 'relative'
                      }}
                    />
                  ) : null}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 우측: 농약성분 추가 및 결과 테이블 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* 농약성분 추가 영역 */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    {/* 레이블 추가 */}
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      농약성분명 추가 검색
                    </Typography>
                    <PesticideAutocomplete
                      value={newPesticideName}
                      onChange={(value) => setNewPesticideName(value)}
                      placeholder="새로운 농약성분명을 입력하세요"
                    />
                  </Grid>
                  <Grid item>
                    <Stack spacing={1}>
                      <Button
                        variant="contained"
                        onClick={handleAddPesticide}
                        startIcon={<AddIcon />}
                        disabled={!newPesticideName.trim() || loading}
                      >
                        검색
                      </Button>
                      {/* 초기화 버튼에 onClick 이벤트 추가 */}
                      <Button
                        variant="outlined"
                        onClick={handleReset}
                      >
                        초기화
                      </Button>
                    </Stack>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      onClick={handleDownload}
                      startIcon={<DownloadIcon />}
                    >
                      엑셀 다운로드
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* 결과 테이블 */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>농약성분명</TableCell>
                      <TableCell>영문명</TableCell>
                      <TableCell>잔류허용기준(mg/kg)</TableCell>
                      <TableCell>비고</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchHistory
                      .sort((a, b) => a.timestamp - b.timestamp)
                      .map((pesticide, index) => (
                        <React.Fragment key={`${pesticide.pesticide_name_kr}-${pesticide.timestamp}`}>
                          <TableRow 
                            onClick={() => handleRowClick(index, pesticide)}
                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                          >
                          <TableCell>{pesticide.pesticide_name_kr}</TableCell>
                          <TableCell>{pesticide.pesticide_name_en}</TableCell>
                          <TableCell sx={{ 
                            color: pesticide.max_residue_limit ? 'inherit' : 'error.main',
                            fontWeight: pesticide.max_residue_limit ? 'normal' : 'medium'
                          }}>
                            {pesticide.max_residue_limit 
                              ? formatResidueLimit(pesticide.max_residue_limit)
                              : '허가되지 않은 농약성분'}
                          </TableCell>
                          <TableCell>{pesticide.condition_code_description || ''}</TableCell>
                        </TableRow>
                        {expandedRow === index && (
                          <TableRow>
                            <TableCell colSpan={4}>
                              <Box sx={{ p: 2, bgcolor: '#f8f8f8' }}>
                                {Array.isArray(pesticide.detailData) && pesticide.detailData.length > 0 ? (
                                  // 기존 상세 데이터 표시 로직
                                  pesticide.detailData.map((group, groupIndex) => (
                                    <Box key={groupIndex} sx={{ mb: 3 }}>
                                      <Typography 
                                        variant="h6" 
                                        sx={{ 
                                          pb: 2, 
                                          color: '#1976d2',
                                          fontWeight: 500,
                                          borderBottom: '2px solid #e0e0e0',
                                          display: 'inline-block',
                                          paddingX: 2,
                                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                          borderRadius: '4px'
                                        }}
                                      >
                                        {group.pesticide_name}
                                      </Typography>
                                      <Grid container spacing={2} sx={{ mt: 1 }}>
                                        {group.products && group.products.map((product, productIndex) => (
                                          <Grid item xs={12} md={12} key={productIndex}>
                                            <Paper sx={{ p: 2, bgcolor: 'white' }}>
                                              <Grid container spacing={2}>
                                                <Grid item xs={3}>
                                                  <Typography variant="subtitle2" color="text.secondary">상표명</Typography>
                                                  <Typography>{product.brand_name || '-'}</Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                  <Typography variant="subtitle2" color="text.secondary">용도</Typography>
                                                  <Typography>{product.purpose || '-'}</Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                  <Typography variant="subtitle2" color="text.secondary">병해충/잡초명</Typography>
                                                  <Typography>{product.target_pest || '-'}</Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                  <Typography variant="subtitle2" color="text.secondary">법인명</Typography>
                                                  <Typography>{product.company || '-'}</Typography>
                                                </Grid>
                                              </Grid>
                                            </Paper>
                                          </Grid>
                                        ))}
                                      </Grid>
                                    </Box>
                                  ))
                                ) : (
                                  // 데이터가 없을 경우 메시지 표시
                                  <Paper sx={{ 
                                    p: 3, 
                                    textAlign: 'center',
                                    bgcolor: 'warning.light',
                                    color: 'warning.dark'
                                  }}>
                                    <Typography variant="subtitle1">
                                      상세 데이터가 데이터베이스에 존재하지 않습니다
                                    </Typography>
                                  </Paper>
                                )}
                              </Box>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
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
            <div
              ref={fullscreenContainerRef}
              style={{
                width: '100%',
                height: '100%',
                position: 'relative'
              }}
            />
          ) : null}
        </Box>
      </Dialog>
    </Box>
  );
 };
 
 export default PesticideTable;