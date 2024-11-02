import React, { useState, useEffect } from 'react';
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
  Dialog
} from '@mui/material';
import { api } from '../services/api';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Fullscreen as FullscreenIcon } from '@mui/icons-material';

const formatResidueLimit = (value) => {
  const truncated = Math.floor(value * 100) / 100;
  if (truncated.toFixed(2).endsWith('0')) {
    return truncated.toFixed(1);
  }
  return truncated.toFixed(2);
};

const PesticideTable = ({ pesticides }) => {
  const [structureUrl, setStructureUrl] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchStructure = async () => {
      if (pesticides.length > 0) {
        const url = await api.getChemicalStructure(pesticides[0].pesticide_name_en);
        setStructureUrl(url);
      }
    };
    fetchStructure();
  }, [pesticides]);

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
          <Card sx={{ bgcolor: 'white', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: 'black' }}>
                  {pesticides[0].pesticide_name_kr}
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary'}}>
                    {pesticides[0].pesticide_name_en}
                  </Typography>
                </Typography>
                <IconButton 
                  onClick={() => setIsFullScreen(true)}
                  sx={{ color: 'black' }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Box>
              {structureUrl && (
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
          <IconButton 
            onClick={() => setIsFullScreen(false)}
            sx={{ 
              position: 'absolute',
              top: 20,
              right: 20,
              color: 'black',
              bgcolor: 'white',
              '&:hover': {
                bgcolor: 'grey.100'
              },
              zIndex: 1000,
              boxShadow: 1
            }}
          >
            <FullscreenIcon />
          </IconButton>
          
          {structureUrl && (
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
        </Box>
      </Dialog>
    </Box>
  );
};

export default PesticideTable;