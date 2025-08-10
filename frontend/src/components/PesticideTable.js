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
  Grid,
  IconButton,
  Dialog,
  Button,
  Stack,
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { 
  ThreeDRotation, 
  InfoOutlined,
  Science as ScienceIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Biotech as BiotechIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  RestartAlt as RestartAltIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { api } from '../services/api';
import { labThemeTokens } from '../theme/labThemeTokens';

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
      {/* 상단 헤더 영역 */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        backgroundColor: labThemeTokens.colors.background.paper,
        borderRadius: labThemeTokens.borderRadius.lg,
        boxShadow: labThemeTokens.shadows.sm
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ 
            mr: 2, 
            color: labThemeTokens.colors.primary[600],
            fontSize: '24px'
          }} />
          <Typography variant="h6" sx={{ 
            fontWeight: labThemeTokens.typography.fontWeight.semibold,
            color: labThemeTokens.colors.text.primary
          }}>
            검색 결과
          </Typography>
          <Chip 
            label={`총 ${searchHistory.length}건`}
            size="small"
            sx={{ 
              ml: 2,
              backgroundColor: labThemeTokens.colors.accent[100],
              color: labThemeTokens.colors.accent[700],
              fontWeight: labThemeTokens.typography.fontWeight.medium
            }}
          />
        </Box>
        <Button
          variant="outlined"
          onClick={handleReset}
          size="small"
          startIcon={<RestartAltIcon />}
          sx={{
            borderColor: labThemeTokens.colors.gray[300],
            color: labThemeTokens.colors.text.secondary,
            borderRadius: labThemeTokens.borderRadius.md,
            '&:hover': {
              borderColor: labThemeTokens.colors.status.error,
              color: labThemeTokens.colors.status.error,
              backgroundColor: `${labThemeTokens.colors.status.error}10`
            }
          }}
        >
          조회결과 초기화
        </Button>
      </Box>

      {/* 통합 테이블 */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: labThemeTokens.shadows.elevated,
          borderRadius: labThemeTokens.borderRadius.xl,
          overflow: 'hidden',
          border: `1px solid ${labThemeTokens.colors.gray[200]}`
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: labThemeTokens.colors.primary[50],
              borderBottom: `2px solid ${labThemeTokens.colors.primary[200]}`
            }}>
              <TableCell sx={{ 
                width: '30%',
                fontWeight: labThemeTokens.typography.fontWeight.semibold,
                color: labThemeTokens.colors.primary[800],
                fontSize: '14px',
                py: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BiotechIcon sx={{ mr: 1, fontSize: '18px' }} />
                  농약성분명
                </Box>
              </TableCell>
              <TableCell align="center" sx={{ 
                width: '20%',
                fontWeight: labThemeTokens.typography.fontWeight.semibold,
                color: labThemeTokens.colors.primary[800],
                fontSize: '14px',
                py: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ScienceIcon sx={{ mr: 1, fontSize: '18px' }} />
                  잔류허용기준(mg/kg)
                </Box>
              </TableCell>
              <TableCell align="center" sx={{ 
                width: '35%',
                fontWeight: labThemeTokens.typography.fontWeight.semibold,
                color: labThemeTokens.colors.primary[800],
                fontSize: '14px',
                py: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <InfoOutlined sx={{ mr: 1, fontSize: '18px' }} />
                  특이사항
                </Box>
              </TableCell>
              <TableCell align="center" sx={{ 
                width: '15%',
                fontWeight: labThemeTokens.typography.fontWeight.semibold,
                color: labThemeTokens.colors.primary[800],
                fontSize: '14px',
                py: 2
              }}>
                Structure
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* 검색 세션별로 결과 표시 (최신순으로 정렬) */}
            {searchHistory.slice().reverse().map((session, sessionIndex) => (
              <React.Fragment key={session.id}>
                {/* 검색 세션 구분 행 */}
                <TableRow>
                  <TableCell colSpan={4} sx={{ 
                    background: `linear-gradient(90deg, ${labThemeTokens.colors.accent[50]} 0%, ${labThemeTokens.colors.background.paper} 100%)`,
                    borderTop: `2px solid ${labThemeTokens.colors.accent[200]}`,
                    borderBottom: `1px solid ${labThemeTokens.colors.gray[200]}`,
                    py: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={`검색 #${searchHistory.length - sessionIndex}`}
                          size="small"
                          sx={{ 
                            mr: 2,
                            backgroundColor: labThemeTokens.colors.accent[600],
                            color: 'white',
                            fontWeight: labThemeTokens.typography.fontWeight.medium
                          }}
                        />
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box component="span" sx={{ 
                            fontWeight: labThemeTokens.typography.fontWeight.bold, 
                            color: labThemeTokens.colors.primary[700], 
                            mx: 0.5 
                          }}>
                            {session.searchParams.pesticide}
                          </Box>
                          <Box component="span" sx={{ color: labThemeTokens.colors.text.secondary, mx: 0.5 }}>×</Box>
                          <Box component="span" sx={{ 
                            color: labThemeTokens.colors.accent[700], 
                            mx: 0.5,
                            fontWeight: labThemeTokens.typography.fontWeight.medium
                          }}>
                            {session.searchParams.food}
                          </Box>
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ 
                        color: labThemeTokens.colors.text.secondary,
                        fontStyle: 'italic'
                      }}>
                        {session.timestamp.toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
                {session.results.length > 0 ? (
                  session.results.map((pesticide, pesticideIndex) => {
                    const rowKey = `${searchHistory.length - sessionIndex - 1}-${pesticideIndex}`;
                    return (
                      <React.Fragment key={rowKey}>
                        <TableRow sx={{ 
                          '&:hover': { 
                            backgroundColor: labThemeTokens.colors.primary[50],
                            transition: 'background-color 0.2s ease'
                          },
                          borderBottom: `1px solid ${labThemeTokens.colors.gray[100]}`
                        }}>
                          <TableCell>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="body1" sx={{ 
                                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                                  color: labThemeTokens.colors.text.primary
                                }}>
                                  {pesticide.pesticide_name_kr}
                                </Typography>
                                {pesticide.max_residue_limit && (
                                  <Chip 
                                    icon={<CheckCircleIcon sx={{ fontSize: '14px' }} />}
                                    label="허가됨"
                                    size="small"
                                    sx={{ 
                                      ml: 1,
                                      height: '20px',
                                      backgroundColor: labThemeTokens.colors.data.positive + '20',
                                      color: labThemeTokens.colors.data.positive,
                                      '& .MuiChip-icon': {
                                        color: labThemeTokens.colors.data.positive
                                      }
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography variant="body2" sx={{ 
                                color: labThemeTokens.colors.text.secondary,
                                fontFamily: labThemeTokens.typography.fontFamily.mono,
                                fontSize: '13px'
                              }}>
                                {pesticide.pesticide_name_en}
                              </Typography>
                              <Button
                                size="small"
                                variant="text"
                                startIcon={<AssignmentIcon sx={{ fontSize: '14px' }} />}
                                sx={{ 
                                  mt: 1,
                                  color: labThemeTokens.colors.primary[600],
                                  fontSize: '12px',
                                  padding: '4px 8px',
                                  minHeight: 'auto',
                                  borderRadius: labThemeTokens.borderRadius.md,
                                  '&:hover': {
                                    backgroundColor: labThemeTokens.colors.primary[50],
                                    color: labThemeTokens.colors.primary[700]
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(searchHistory.length - sessionIndex - 1, pesticideIndex, pesticide);
                                }}
                              >
                                상세조회
                              </Button>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            {pesticide.max_residue_limit ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    color: labThemeTokens.colors.data.danger,
                                    fontWeight: labThemeTokens.typography.fontWeight.bold,
                                    fontFamily: labThemeTokens.typography.fontFamily.data,
                                    fontSize: '16px',
                                    lineHeight: 1
                                  }}
                                >
                                  {formatResidueLimit(
                                    pesticide.max_residue_limit, 
                                    pesticide.condition_code_symbol
                                  )}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: labThemeTokens.colors.text.secondary,
                                    fontSize: '10px'
                                  }}
                                >
                                  mg/kg
                                </Typography>
                              </Box>
                            ) : (
                              <Chip 
                                icon={<ErrorIcon sx={{ fontSize: '14px' }} />}
                                label="미허가"
                                size="small"
                                sx={{ 
                                  backgroundColor: labThemeTokens.colors.data.danger + '20',
                                  color: labThemeTokens.colors.data.danger,
                                  fontWeight: labThemeTokens.typography.fontWeight.medium,
                                  '& .MuiChip-icon': {
                                    color: labThemeTokens.colors.data.danger
                                  }
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {pesticide.condition_code_description || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  display: 'block', 
                                  mb: 1.5,
                                  color: labThemeTokens.colors.text.secondary,
                                  fontSize: '11px',
                                  fontWeight: labThemeTokens.typography.fontWeight.medium
                                }}
                              >
                                분자 구조
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                <Tooltip title="2D 화학구조식 보기" arrow>
                                  <Button 
                                    variant="outlined"
                                    size="small"
                                    sx={{ 
                                      minWidth: '36px',
                                      width: '36px',
                                      height: '32px',
                                      padding: '6px',
                                      borderColor: labThemeTokens.colors.primary[300],
                                      color: labThemeTokens.colors.primary[600],
                                      borderRadius: labThemeTokens.borderRadius.md,
                                      fontSize: '11px',
                                      fontWeight: labThemeTokens.typography.fontWeight.semibold,
                                      '&:hover': {
                                        borderColor: labThemeTokens.colors.primary[500],
                                        backgroundColor: labThemeTokens.colors.primary[50],
                                        color: labThemeTokens.colors.primary[700]
                                      }
                                    }}
                                    onClick={async () => {
                                      setViewMode('2d');
                                      setSelectedPesticide(pesticide);
                                      const url = await api.getChemicalStructure(pesticide.pesticide_name_en);
                                      setStructureUrl(url);
                                      setIsFullScreen(true);
                                    }}
                                  >
                                    2D
                                  </Button>
                                </Tooltip>
                                <Tooltip title="3D 분자 모델 보기" arrow>
                                  <Button 
                                    variant="outlined"
                                    size="small"
                                    sx={{ 
                                      minWidth: '36px',
                                      width: '36px',
                                      height: '32px',
                                      padding: '4px',
                                      borderColor: labThemeTokens.colors.accent[300],
                                      color: labThemeTokens.colors.accent[600],
                                      borderRadius: labThemeTokens.borderRadius.md,
                                      '&:hover': {
                                        borderColor: labThemeTokens.colors.accent[500],
                                        backgroundColor: labThemeTokens.colors.accent[50],
                                        color: labThemeTokens.colors.accent[700]
                                      }
                                    }}
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
                                    <ThreeDRotation sx={{ fontSize: '16px' }} />
                                  </Button>
                                </Tooltip>
                              </Stack>
                            </Box>
                          </TableCell>
                        </TableRow>
                        {expandedRow === rowKey && (
                          <TableRow>
                            <TableCell colSpan={4} sx={{ 
                              background: `linear-gradient(135deg, ${labThemeTokens.colors.lab.beaker} 0%, ${labThemeTokens.colors.background.paper} 100%)`,
                              p: 3,
                              borderTop: `2px solid ${labThemeTokens.colors.primary[200]}`
                            }}>
                              {Array.isArray(pesticide.detailData) && pesticide.detailData.length > 0 ? (
                                pesticide.detailData.map((group, groupIndex) => (
                                  <Box key={groupIndex} sx={{ mb: 3 }}>
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      mb: 2,
                                      p: 2,
                                      backgroundColor: labThemeTokens.colors.primary[50],
                                      borderRadius: labThemeTokens.borderRadius.lg,
                                      border: `1px solid ${labThemeTokens.colors.primary[200]}`
                                    }}>
                                      <BiotechIcon sx={{ 
                                        mr: 1.5, 
                                        color: labThemeTokens.colors.primary[600],
                                        fontSize: '20px'
                                      }} />
                                      <Typography 
                                        variant="subtitle1" 
                                        sx={{ 
                                          fontWeight: labThemeTokens.typography.fontWeight.bold,
                                          color: labThemeTokens.colors.primary[800]
                                        }}
                                      >
                                        {group.pesticide_name} 함유 제품정보
                                      </Typography>
                                    </Box>
                                    
                                    <Paper sx={{ 
                                      p: 2, 
                                      backgroundColor: labThemeTokens.colors.background.paper,
                                      borderRadius: labThemeTokens.borderRadius.lg,
                                      boxShadow: labThemeTokens.shadows.sm
                                    }}>
                                      <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={3}>
                                          <Typography 
                                            variant="body2" 
                                            sx={{ 
                                              fontWeight: labThemeTokens.typography.fontWeight.semibold,
                                              color: labThemeTokens.colors.text.secondary,
                                              textTransform: 'uppercase',
                                              fontSize: '11px',
                                              letterSpacing: '0.5px'
                                            }}
                                          >
                                            상표명
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                          <Typography 
                                            variant="body2" 
                                            sx={{ 
                                              fontWeight: labThemeTokens.typography.fontWeight.semibold,
                                              color: labThemeTokens.colors.text.secondary,
                                              textTransform: 'uppercase',
                                              fontSize: '11px',
                                              letterSpacing: '0.5px'
                                            }}
                                          >
                                            용도
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                          <Typography 
                                            variant="body2" 
                                            sx={{ 
                                              fontWeight: labThemeTokens.typography.fontWeight.semibold,
                                              color: labThemeTokens.colors.text.secondary,
                                              textTransform: 'uppercase',
                                              fontSize: '11px',
                                              letterSpacing: '0.5px'
                                            }}
                                          >
                                            병해충/잡초명
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                          <Typography 
                                            variant="body2" 
                                            sx={{ 
                                              fontWeight: labThemeTokens.typography.fontWeight.semibold,
                                              color: labThemeTokens.colors.text.secondary,
                                              textTransform: 'uppercase',
                                              fontSize: '11px',
                                              letterSpacing: '0.5px'
                                            }}
                                          >
                                            제조사
                                          </Typography>
                                        </Grid>
                                      </Grid>
                                      {group.products && group.products.map((product, productIndex) => (
                                        <Grid 
                                          container 
                                          spacing={2} 
                                          key={productIndex} 
                                          sx={{ 
                                            py: 1.5, 
                                            borderBottom: `1px solid ${labThemeTokens.colors.gray[200]}`,
                                            '&:hover': {
                                              backgroundColor: labThemeTokens.colors.gray[50],
                                              borderRadius: labThemeTokens.borderRadius.base
                                            }
                                          }}
                                        >
                                          <Grid item xs={3}>
                                            <Typography 
                                              variant="body2"
                                              onClick={() => window.open(`/pesticide-image?name=${encodeURIComponent(product.brand_name)}&type=${encodeURIComponent(product.purpose)}`, '_blank')}
                                              sx={{ 
                                                cursor: 'pointer',
                                                color: labThemeTokens.colors.primary[600],
                                                fontWeight: labThemeTokens.typography.fontWeight.medium,
                                                '&:hover': {
                                                  textDecoration: 'underline',
                                                  color: labThemeTokens.colors.primary[700]
                                                }
                                              }}
                                            >
                                              {product.brand_name || '-'}
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={2}>
                                            <Typography 
                                              variant="body2" 
                                              sx={{ color: labThemeTokens.colors.text.primary }}
                                            >
                                              {product.purpose || '-'}
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={3}>
                                            <Typography 
                                              variant="body2" 
                                              sx={{ color: labThemeTokens.colors.text.primary }}
                                            >
                                              {product.target_pest || '-'}
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={4}>
                                            <Typography 
                                              variant="body2" 
                                              sx={{ color: labThemeTokens.colors.text.primary }}
                                            >
                                              {product.company || '-'}
                                            </Typography>
                                          </Grid>
                                        </Grid>
                                      ))}
                                    </Paper>
                                  </Box>
                                ))
                              ) : (
                                <Box sx={{ 
                                  textAlign: 'center', 
                                  py: 4,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center'
                                }}>
                                  <InfoOutlined sx={{ 
                                    fontSize: '48px', 
                                    color: labThemeTokens.colors.text.disabled,
                                    mb: 2
                                  }} />
                                  <Typography 
                                    variant="body1" 
                                    sx={{ 
                                      color: labThemeTokens.colors.text.secondary,
                                      fontWeight: labThemeTokens.typography.fontWeight.medium
                                    }}
                                  >
                                    상세 데이터가 데이터베이스에 존재하지 않습니다
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: labThemeTokens.colors.text.disabled,
                                      mt: 1
                                    }}
                                  >
                                    제품 정보를 확인할 수 없습니다
                                  </Typography>
                                </Box>
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
          <Paper 
            key={`${p.pesticide_name_en}-${index}`}
            sx={{ 
              mt: 2, 
              p: 3,
              backgroundColor: labThemeTokens.colors.status.info + '10',
              border: `1px solid ${labThemeTokens.colors.status.info}30`,
              borderRadius: labThemeTokens.borderRadius.lg,
              boxShadow: labThemeTokens.shadows.sm
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <InfoOutlined sx={{ 
                fontSize: '20px', 
                color: labThemeTokens.colors.status.info,
                mr: 2,
                mt: 0.25
              }} />
              <Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: labThemeTokens.colors.text.primary,
                    fontWeight: labThemeTokens.typography.fontWeight.medium,
                    lineHeight: 1.6
                  }}
                >
                  <Box component="span" sx={{ 
                    fontWeight: labThemeTokens.typography.fontWeight.bold,
                    color: labThemeTokens.colors.primary[700]
                  }}>
                    [{p.pesticide_name_en}]
                  </Box> 성분에 대한 <Box component="span" sx={{ 
                    fontWeight: labThemeTokens.typography.fontWeight.semibold,
                    color: labThemeTokens.colors.accent[700]
                  }}>
                    '{p.original_food_name}'
                  </Box>의 잔류허용기준이 별도로 설정되어 있지 않아, 
                  상위 분류인 <Box component="span" sx={{ 
                    fontWeight: labThemeTokens.typography.fontWeight.semibold,
                    color: labThemeTokens.colors.accent[700]
                  }}>
                    '{p.food_name}'
                  </Box>의 기준을 적용하고 있습니다.
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: labThemeTokens.colors.text.secondary,
                    fontStyle: 'italic',
                    mt: 1,
                    display: 'block'
                  }}
                >
                  식약처 고시에 따른 상위 분류 기준 적용 규칙
                </Typography>
              </Box>
            </Box>
          </Paper>
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
          <Box sx={{ 
            position: 'absolute', 
            top: 20, 
            right: 20, 
            zIndex: 1000,
            display: 'flex',
            gap: 1,
            alignItems: 'center'
          }}>
            <Box sx={{ 
              display: 'flex', 
              backgroundColor: labThemeTokens.colors.background.paper,
              borderRadius: labThemeTokens.borderRadius.lg,
              padding: '4px',
              boxShadow: labThemeTokens.shadows.lg,
              border: `1px solid ${labThemeTokens.colors.gray[200]}`
            }}>
              <Button
                variant={viewMode === '2d' ? 'contained' : 'text'}
                size="small"
                onClick={async () => {
                  if (selectedPesticide) {
                    setViewMode('2d');
                    if (!structureUrl) {
                      const url = await api.getChemicalStructure(selectedPesticide.pesticide_name_en);
                      setStructureUrl(url);
                    }
                  }
                }}
                sx={{
                  minWidth: '48px',
                  height: '36px',
                  fontSize: '12px',
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  borderRadius: labThemeTokens.borderRadius.md,
                  ...(viewMode === '2d' ? {
                    backgroundColor: labThemeTokens.colors.primary[600],
                    color: 'white',
                    '&:hover': {
                      backgroundColor: labThemeTokens.colors.primary[700]
                    }
                  } : {
                    color: labThemeTokens.colors.text.secondary,
                    '&:hover': {
                      backgroundColor: labThemeTokens.colors.primary[50],
                      color: labThemeTokens.colors.primary[600]
                    }
                  })
                }}
              >
                2D
              </Button>
              <Button
                variant={viewMode === '3d' ? 'contained' : 'text'}
                size="small"
                onClick={async () => {
                  if (selectedPesticide) {
                    setViewMode('3d');
                    if (!structure3D) {
                      setLoading3D(true);
                      try {
                        const structure3DData = await api.get3DStructure(selectedPesticide.pesticide_name_en, token);
                        setStructure3D(structure3DData);
                      } finally {
                        setLoading3D(false);
                      }
                    }
                  }
                }}
                sx={{
                  minWidth: '48px',
                  height: '36px',
                  borderRadius: labThemeTokens.borderRadius.md,
                  ...(viewMode === '3d' ? {
                    backgroundColor: labThemeTokens.colors.accent[600],
                    color: 'white',
                    '&:hover': {
                      backgroundColor: labThemeTokens.colors.accent[700]
                    }
                  } : {
                    color: labThemeTokens.colors.text.secondary,
                    '&:hover': {
                      backgroundColor: labThemeTokens.colors.accent[50],
                      color: labThemeTokens.colors.accent[600]
                    }
                  })
                }}
              >
                <ThreeDRotation sx={{ fontSize: '16px' }} />
              </Button>
            </Box>
            <IconButton 
              onClick={() => setIsFullScreen(false)}
              sx={{ 
                backgroundColor: labThemeTokens.colors.background.paper,
                color: labThemeTokens.colors.text.primary,
                boxShadow: labThemeTokens.shadows.lg,
                border: `1px solid ${labThemeTokens.colors.gray[200]}`,
                '&:hover': { 
                  backgroundColor: labThemeTokens.colors.gray[50],
                  color: labThemeTokens.colors.status.error
                }
              }}
            >
              <CloseIcon />
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