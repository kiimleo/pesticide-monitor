import React, { useState, useEffect, useRef } from 'react';  // useRef 추가
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
  ToggleButtonGroup
} from '@mui/material';
import { api } from '../services/api';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Fullscreen as FullscreenIcon, ThreeDRotation } from '@mui/icons-material';

const formatResidueLimit = (value) => {
  const truncated = Math.floor(value * 100) / 100;
  if (truncated.toFixed(2).endsWith('0')) {
    return truncated.toFixed(1);
  }
  return truncated.toFixed(2);
};

const PesticideTable = ({ pesticides }) => {
  const [structureUrl, setStructureUrl] = useState(null);
  const [structure3D, setStructure3D] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewMode, setViewMode] = useState('2d');
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  // 전체화면용 ref 추가
  const fullscreenContainerRef = useRef(null);
  const fullscreenViewerRef = useRef(null);

  // 전체화면 전환 핸들러 수정
  const handleFullScreen = () => {
    setIsFullScreen(true);
    // 다음 렌더링 사이클에서 3D 뷰어 초기화를 위해 약간의 지연 추가
    if (viewMode === '3d') {
      setTimeout(() => {
        if (fullscreenContainerRef.current) {
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
        }
      }, 100);
    }
  };

  useEffect(() => {
    const fetchStructures = async () => {
      if (pesticides.length > 0) {
        // 2D 구조 가져오기
        const url = await api.getChemicalStructure(pesticides[0].pesticide_name_en);
        setStructureUrl(url);
        
        // 3D 구조 가져오기
        const structure3D = await api.get3DStructure(pesticides[0].pesticide_name_en);
        setStructure3D(structure3D);
      }
    };
    
    fetchStructures();
  }, [pesticides]);

  // 일반 화면용 3D 뷰어 초기화
  useEffect(() => {
    if (viewMode === '3d' && structure3D && containerRef.current && !isFullScreen) {
      const viewer = window.$3Dmol.createViewer(containerRef.current, {
        defaultcolors: window.$3Dmol.rasmolElementColors
      });
      
      viewer.addModel(structure3D, "sdf");
      viewer.setStyle({}, {
        stick: {radius: 0.2}, // stick의 반지름 설정
        sphere: {radius: 0.4} // ball(sphere)의 반지름 설정
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

  // 전체화면용 3D 뷰어 초기화
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


  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  if (!pesticides.length) {
    return (
      <Typography variant="body1" sx={{ mt: 2 }}>
        검색 결과가 없습니다.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'black' }}>
                  {pesticides[0].pesticide_name_kr}
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary'}}>
                    {pesticides[0].pesticide_name_en}
                  </Typography>
                </Typography>
                <Box>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <ToggleButton value="2d">2D</ToggleButton>
                    <ToggleButton value="3d">
                      <ThreeDRotation />
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <IconButton 
                    onClick={handleFullScreen}
                    sx={{ color: 'black' }}
                  >
                    <FullscreenIcon />
                  </IconButton>
                </Box>
              </Box>
              
              {viewMode === '2d' && structureUrl && (
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
                        objectFit: 'contain',
                        backgroundColor: 'transparent'
                      }}
                    />
                  </TransformComponent>
                </TransformWrapper>
              )}
              
              {viewMode === '3d' && (
                <div
                  ref={containerRef}
                  style={{
                    width: '100%',
                    height: '300px',
                    position: 'relative'
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
  
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>식품명</TableCell>
                  <TableCell>잔류허용기준(mg/kg)</TableCell>
                  <TableCell>비고</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pesticides.map((pesticide, index) => (
                  <TableRow key={index}>
                    <TableCell>{pesticide.food_name}</TableCell>
                    <TableCell sx={{ color: 'error.main', fontWeight: 'medium' }}>
                      {formatResidueLimit(pesticide.max_residue_limit)}
                    </TableCell>
                    <TableCell>{pesticide.condition_code_description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid> 

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
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            backgroundColor: 'white'
          }}
        >
          <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1000 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              sx={{ mr: 1, bgcolor: 'white' }}
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
              '&:hover': {
                bgcolor: 'grey.100'
              },
              boxShadow: 1
            }}
          >
            <FullscreenIcon />
          </IconButton>
          </Box>
          
          {viewMode === '2d' && structureUrl && (
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
            )}

            {viewMode === '3d' && (
              <div
                ref={fullscreenContainerRef}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative'
                }}
              />
            )}
        </Box>
      </Dialog>
    </Box>
  );
};

export default PesticideTable;