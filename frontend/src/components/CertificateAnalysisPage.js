// path of this code: frontend/src/components/CertificateAnalysisPage.js

import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  Alert, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Container
} from '@mui/material';
import { 
  ErrorOutline, 
  Science as ScienceIcon,
  Assignment as AssignmentIcon,
  Biotech as BiotechIcon,
  Verified as VerifiedIcon,
  PictureAsPdf as PdfIcon,
  UploadFile as UploadFileIcon,
  Cancel as CancelIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { api } from '../services/api';
import { labThemeTokens } from '../theme/labThemeTokens';

// 파일 업로드 컴포넌트
const FileUploadSection = ({ file, onFileChange, onUpload, onFileDelete, loading, fileInputRef }) => {

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      onFileChange(selectedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        onFileChange(droppedFile);
      }
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 4, 
        mb: 4, 
        border: `2px dashed ${labThemeTokens.colors.primary[300]}`,
        borderRadius: labThemeTokens.borderRadius['2xl'],
        textAlign: 'center',
        background: `linear-gradient(135deg, ${labThemeTokens.colors.background.paper} 0%, ${labThemeTokens.colors.lab.beaker} 100%)`,
        boxShadow: labThemeTokens.shadows.elevated,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: labThemeTokens.colors.primary[500],
          transform: 'translateY(-2px)',
          boxShadow: labThemeTokens.shadows.lg
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${labThemeTokens.colors.primary[500]} 0%, ${labThemeTokens.colors.accent[500]} 100%)`,
        }
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf"
        hidden
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <PdfIcon sx={{ 
          fontSize: '48px', 
          color: labThemeTokens.colors.primary[600],
          mr: 2
        }} />
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: labThemeTokens.typography.fontWeight.bold,
            color: labThemeTokens.colors.text.primary
          }}
        >
          검정증명서 PDF 업로드
        </Typography>
      </Box>
      
      <Typography 
        variant="body1" 
        sx={{ 
          color: labThemeTokens.colors.text.secondary,
          mb: 3,
          fontSize: labThemeTokens.typography.fontSize.base
        }}
      >
        PDF 파일을 여기에 드래그 앤 드롭하거나 클릭하여 선택하세요.
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 2
      }}>
        <Button 
          variant="outlined" 
          startIcon={<UploadFileIcon />}
          onClick={() => fileInputRef.current.click()}
          sx={{
            borderColor: labThemeTokens.colors.primary[300],
            color: labThemeTokens.colors.primary[600],
            borderRadius: labThemeTokens.borderRadius.lg,
            px: 3,
            py: 1.5,
            fontWeight: labThemeTokens.typography.fontWeight.medium,
            '&:hover': {
              borderColor: labThemeTokens.colors.primary[500],
              backgroundColor: labThemeTokens.colors.primary[50],
              color: labThemeTokens.colors.primary[700]
            }
          }}
        >
          파일 선택
        </Button>
        
        <Button 
          variant="contained" 
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ScienceIcon />}
          disabled={!file || loading}
          onClick={onUpload}
          sx={{
            backgroundColor: labThemeTokens.colors.primary[600],
            color: 'white',
            borderRadius: labThemeTokens.borderRadius.lg,
            px: 3,
            py: 1.5,
            fontWeight: labThemeTokens.typography.fontWeight.semibold,
            boxShadow: labThemeTokens.shadows.md,
            '&:hover': {
              backgroundColor: labThemeTokens.colors.primary[700],
              boxShadow: labThemeTokens.shadows.lg
            },
            '&:disabled': {
              backgroundColor: labThemeTokens.colors.gray[300],
              color: labThemeTokens.colors.gray[500]
            }
          }}
        >
          {loading ? '분석 중...' : '분석하기'}
        </Button>
      </Box>
      
      {file && (
        <Box sx={{ 
          mt: 3, 
          p: 2,
          backgroundColor: labThemeTokens.colors.accent[50],
          borderRadius: labThemeTokens.borderRadius.lg,
          border: `1px solid ${labThemeTokens.colors.accent[200]}`,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 2
        }}>
          <PdfIcon sx={{ color: labThemeTokens.colors.accent[600], fontSize: '20px' }} />
          <Typography 
            variant="body2" 
            sx={{ 
              color: labThemeTokens.colors.text.primary,
              fontWeight: labThemeTokens.typography.fontWeight.medium
            }}
          >
            선택된 파일: {file.name}
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            size="small"
            startIcon={<CancelIcon />}
            onClick={onFileDelete}
            sx={{ 
              borderRadius: labThemeTokens.borderRadius.md,
              minWidth: 'auto'
            }}
          >
            삭제
          </Button>
        </Box>
      )}
    </Paper>
  );
};

// 중복 확인 시 표시할 다이얼로그 컴포넌트
const DuplicateDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: labThemeTokens.borderRadius.xl,
          boxShadow: labThemeTokens.shadows['2xl']
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: labThemeTokens.colors.status.warning + '10',
        color: labThemeTokens.colors.text.primary,
        fontWeight: labThemeTokens.typography.fontWeight.semibold
      }}>
        <ErrorOutline sx={{ mr: 1, color: labThemeTokens.colors.status.warning }} />
        중복된 검정증명서
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography sx={{ 
          color: labThemeTokens.colors.text.primary,
          lineHeight: 1.6
        }}>
          동일한 증명서 번호가 이미 등록되어 있습니다. 덮어쓰시겠습니까?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: labThemeTokens.colors.gray[300],
            color: labThemeTokens.colors.text.secondary,
            borderRadius: labThemeTokens.borderRadius.md,
            '&:hover': {
              borderColor: labThemeTokens.colors.gray[400],
              backgroundColor: labThemeTokens.colors.gray[50]
            }
          }}
        >
          취소
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          sx={{
            backgroundColor: labThemeTokens.colors.status.warning,
            color: 'white',
            borderRadius: labThemeTokens.borderRadius.md,
            '&:hover': {
              backgroundColor: labThemeTokens.colors.status.warning + 'DD'
            }
          }}
        >
          덮어쓰기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// 검증 확인 다이얼로그 컴포넌트
const VerificationConfirmDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: labThemeTokens.borderRadius.xl,
          boxShadow: labThemeTokens.shadows['2xl']
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: labThemeTokens.colors.primary[50],
        color: labThemeTokens.colors.text.primary,
        fontWeight: labThemeTokens.typography.fontWeight.semibold
      }}>
        <ScienceIcon sx={{ mr: 1, color: labThemeTokens.colors.primary[600] }} />
        검증 진행 확인
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography sx={{ 
          color: labThemeTokens.colors.text.primary,
          lineHeight: 1.6
        }}>
          증명서에 적은 농약성분명과 잔류농약 수치만 검증할까요?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: labThemeTokens.colors.gray[300],
            color: labThemeTokens.colors.text.secondary,
            borderRadius: labThemeTokens.borderRadius.md,
            '&:hover': {
              borderColor: labThemeTokens.colors.gray[400],
              backgroundColor: labThemeTokens.colors.gray[50]
            }
          }}
        >
          취소
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          sx={{
            backgroundColor: labThemeTokens.colors.primary[600],
            color: 'white',
            borderRadius: labThemeTokens.borderRadius.md,
            '&:hover': {
              backgroundColor: labThemeTokens.colors.primary[700]
            }
          }}
        >
          예
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// 품목 선택 다이얼로그 컴포넌트
const FoodSelectionDialog = ({ open, onClose, onConfirm, parsedFood, similarFoods }) => {
  const [selectedFood, setSelectedFood] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 식품명 검색 함수
  const searchFoods = async (query) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await api.searchFoodAutocomplete(query);
      setSearchResults(response.slice(0, 10)); // 최대 10개만 표시
    } catch (error) {
      console.error('식품 검색 오류:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    searchFoods(query);
  };

  const handleConfirm = () => {
    if (selectedFood) {
      onConfirm(selectedFood);
      setSelectedFood('');
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleClose = () => {
    setSelectedFood('');
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>검증품목선택</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>"{parsedFood}"</strong>은 데이터베이스에 없습니다. 검정하려는 품목을 선택하세요.
        </Typography>
        
        {/* 직접 검색 섹션 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            직접 검색:
          </Typography>
          <TextField
            fullWidth
            placeholder="식품명을 입력하여 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{ mb: 1 }}
          />
          {isSearching && (
            <Typography variant="caption" color="text.secondary">
              검색 중...
            </Typography>
          )}
          {searchResults.length > 0 && (
            <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
              {searchResults.map((food, index) => (
                <Box key={index} sx={{ mb: 0.5 }}>
                  <Button
                    variant={selectedFood === food ? "contained" : "text"}
                    fullWidth
                    size="small"
                    onClick={() => setSelectedFood(food)}
                    sx={{ 
                      justifyContent: 'flex-start',
                      textTransform: 'none'
                    }}
                  >
                    {food}
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* 유사한 품목들 섹션 */}
        {similarFoods && similarFoods.length > 0 ? (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              추천 유사 품목들:
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {similarFoods.map((food, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Button
                    variant={selectedFood === food ? "contained" : "outlined"}
                    fullWidth
                    onClick={() => setSelectedFood(food)}
                    sx={{ 
                      justifyContent: 'flex-start',
                      textTransform: 'none'
                    }}
                  >
                    {food}
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              추천할 유사한 품목을 찾을 수 없습니다.
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        {similarFoods && similarFoods.length > 0 ? (
          <>
            <Button 
              onClick={() => onConfirm('__no_food_selected__')} 
              color="warning" 
              variant="outlined"
            >
              유사한 품목이 없음
            </Button>
            <Button 
              onClick={handleConfirm} 
              color="primary" 
              disabled={!selectedFood}
              variant="contained"
            >
              선택
            </Button>
          </>
        ) : (
          <Button 
            onClick={() => onConfirm('__no_food_selected__')} 
            color="primary" 
            variant="contained"
          >
            유사한 품목이 없음
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// 기본 정보 표시 컴포넌트
const CertificateBasicInfo = ({ data }) => {
  if (!data) return null;
  
  return (
    <Card sx={{ 
      mb: 4,
      borderRadius: labThemeTokens.borderRadius.xl,
      boxShadow: labThemeTokens.shadows.elevated,
      border: `1px solid ${labThemeTokens.colors.gray[200]}`
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 3,
          p: 2,
          backgroundColor: labThemeTokens.colors.primary[50],
          borderRadius: labThemeTokens.borderRadius.lg,
          border: `1px solid ${labThemeTokens.colors.primary[200]}`
        }}>
          <AssignmentIcon sx={{ 
            mr: 1.5, 
            color: labThemeTokens.colors.primary[600],
            fontSize: '24px'
          }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: labThemeTokens.typography.fontWeight.bold,
              color: labThemeTokens.colors.primary[800]
            }}
          >
            기본 정보
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5,
                backgroundColor: labThemeTokens.colors.background.paper,
                borderRadius: labThemeTokens.borderRadius.lg,
                border: `1px solid ${labThemeTokens.colors.gray[200]}`,
                '&:hover': {
                  boxShadow: labThemeTokens.shadows.sm
                }
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: labThemeTokens.colors.text.secondary,
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  textTransform: 'uppercase',
                  fontSize: '11px',
                  letterSpacing: '0.5px',
                  mb: 1
                }}
              >
                검정 목적
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: data.analytical_purpose && data.analytical_purpose.includes('친환경') 
                    ? labThemeTokens.typography.fontWeight.bold 
                    : labThemeTokens.typography.fontWeight.medium,
                  color: data.analytical_purpose && data.analytical_purpose.includes('친환경') 
                    ? labThemeTokens.colors.accent[700] 
                    : labThemeTokens.colors.text.primary
                }}
              >
                {data.analytical_purpose || '-'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5,
                backgroundColor: labThemeTokens.colors.background.paper,
                borderRadius: labThemeTokens.borderRadius.lg,
                border: `1px solid ${labThemeTokens.colors.gray[200]}`,
                '&:hover': {
                  boxShadow: labThemeTokens.shadows.sm
                }
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: labThemeTokens.colors.text.secondary,
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  textTransform: 'uppercase',
                  fontSize: '11px',
                  letterSpacing: '0.5px',
                  mb: 1
                }}
              >
                증명서 번호
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.medium,
                  color: labThemeTokens.colors.text.primary
                }}
              >
                {data.certificate_number || '-'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5,
                backgroundColor: labThemeTokens.colors.background.paper,
                borderRadius: labThemeTokens.borderRadius.lg,
                border: `1px solid ${labThemeTokens.colors.gray[200]}`,
                '&:hover': {
                  boxShadow: labThemeTokens.shadows.sm
                }
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: labThemeTokens.colors.text.secondary,
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  textTransform: 'uppercase',
                  fontSize: '11px',
                  letterSpacing: '0.5px',
                  mb: 1
                }}
              >
                검정 품목
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.medium,
                  color: labThemeTokens.colors.primary[700]
                }}
              >
                {data.sample_description || '-'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5,
                backgroundColor: labThemeTokens.colors.background.paper,
                borderRadius: labThemeTokens.borderRadius.lg,
                border: `1px solid ${labThemeTokens.colors.gray[200]}`,
                '&:hover': {
                  boxShadow: labThemeTokens.shadows.sm
                }
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: labThemeTokens.colors.text.secondary,
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  textTransform: 'uppercase',
                  fontSize: '11px',
                  letterSpacing: '0.5px',
                  mb: 1
                }}
              >
                신청인
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.medium,
                  color: labThemeTokens.colors.text.primary
                }}
              >
                {data.applicant_name || '-'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: labThemeTokens.colors.text.secondary,
                  display: 'block',
                  mt: 0.5,
                  fontSize: '12px'
                }}
              >
                {data.applicant_address}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5,
                backgroundColor: labThemeTokens.colors.background.paper,
                borderRadius: labThemeTokens.borderRadius.lg,
                border: `1px solid ${labThemeTokens.colors.gray[200]}`,
                '&:hover': {
                  boxShadow: labThemeTokens.shadows.sm
                }
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: labThemeTokens.colors.text.secondary,
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  textTransform: 'uppercase',
                  fontSize: '11px',
                  letterSpacing: '0.5px',
                  mb: 1
                }}
              >
                생산자/수거지
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.medium,
                  color: labThemeTokens.colors.text.primary
                }}
              >
                {data.producer_info || '-'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5,
                backgroundColor: labThemeTokens.colors.background.paper,
                borderRadius: labThemeTokens.borderRadius.lg,
                border: `1px solid ${labThemeTokens.colors.gray[200]}`,
                '&:hover': {
                  boxShadow: labThemeTokens.shadows.sm
                }
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: labThemeTokens.colors.text.secondary,
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  textTransform: 'uppercase',
                  fontSize: '11px',
                  letterSpacing: '0.5px',
                  mb: 1
                }}
              >
                검정 기간
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.medium,
                  color: labThemeTokens.colors.text.primary
                }}
              >
                {data.test_start_date} ~ {data.test_end_date}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5,
                backgroundColor: labThemeTokens.colors.background.paper,
                borderRadius: labThemeTokens.borderRadius.lg,
                border: `1px solid ${labThemeTokens.colors.gray[200]}`,
                '&:hover': {
                  boxShadow: labThemeTokens.shadows.sm
                }
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: labThemeTokens.colors.text.secondary,
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  textTransform: 'uppercase',
                  fontSize: '11px',
                  letterSpacing: '0.5px',
                  mb: 1
                }}
              >
                검정 항목
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.medium,
                  color: labThemeTokens.colors.text.primary
                }}
              >
                {data.analyzed_items || '-'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// 농약 검출 결과 및 검증 결과 표시 컴포넌트
// 1. 결과 판정 로직 수정 - 백엔드에서 가져온 농약 검출 결과에 대한 처리
const PesticideResultsVerification = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ErrorOutline sx={{ mr: 1 }} />
            검사 결과 없음
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Alert severity="info">
            농약 검출 결과가 없거나 추출에 실패했습니다.
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // 결과에 검토의견(pdf_result)이 모두 비어있는지 확인
  const hasEmptyReviewOpinions = results.every(result => !result.pdf_result || result.pdf_result === '-' || result.pdf_result === '');
  
  return (
    <Card sx={{ 
      mb: 4,
      borderRadius: labThemeTokens.borderRadius.xl,
      boxShadow: labThemeTokens.shadows.elevated,
      border: `1px solid ${labThemeTokens.colors.gray[200]}`
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 3,
          p: 2,
          backgroundColor: labThemeTokens.colors.data.positive + '10',
          borderRadius: labThemeTokens.borderRadius.lg,
          border: `1px solid ${labThemeTokens.colors.data.positive}30`
        }}>
          <BiotechIcon sx={{ 
            mr: 1.5, 
            color: labThemeTokens.colors.data.positive,
            fontSize: '24px'
          }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: labThemeTokens.typography.fontWeight.bold,
              color: labThemeTokens.colors.text.primary
            }}
          >
            농약 검출 결과 및 검증
          </Typography>
        </Box>
        
        <TableContainer 
          component={Paper} 
          elevation={0}
          sx={{
            borderRadius: labThemeTokens.borderRadius.lg,
            border: `1px solid ${labThemeTokens.colors.gray[200]}`,
            overflow: 'hidden'
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: labThemeTokens.colors.primary[50],
                borderBottom: `2px solid ${labThemeTokens.colors.primary[200]}`
              }}>
                <TableCell sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  color: labThemeTokens.colors.primary[800],
                  fontSize: '13px'
                }}>
                  기록된 농약성분명
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  color: labThemeTokens.colors.primary[800],
                  fontSize: '13px'
                }}>
                  표준명
                </TableCell>
                <TableCell align="center" sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  color: labThemeTokens.colors.primary[800],
                  fontSize: '13px'
                }}>
                  성분명검증
                </TableCell>
                <TableCell align="right" sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  color: labThemeTokens.colors.primary[800],
                  fontSize: '13px'
                }}>
                  검출량(mg/kg)
                </TableCell>
                <TableCell align="right" sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  color: labThemeTokens.colors.primary[800],
                  fontSize: '13px'
                }}>
                  기록된 MRL
                </TableCell>
                <TableCell align="right" sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  color: labThemeTokens.colors.primary[800],
                  fontSize: '13px'
                }}>
                  표준 MRL
                </TableCell>
                
                {/* 검토의견이 없는 경우에도 PDF 판정 열은 유지 */}
                <TableCell align="center" sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  color: labThemeTokens.colors.primary[800],
                  fontSize: '13px'
                }}>
                  기록된 검토의견
                </TableCell>
                
                {/* 검토의견이 없는 경우 계산 판정 열 숨김 */}
                {!hasEmptyReviewOpinions && (
                  <TableCell align="center" sx={{ 
                    fontWeight: labThemeTokens.typography.fontWeight.semibold,
                    color: labThemeTokens.colors.primary[800],
                    fontSize: '13px'
                  }}>
                    MRL판정
                  </TableCell>
                )}
                
                <TableCell align="center" sx={{ 
                  fontWeight: labThemeTokens.typography.fontWeight.semibold,
                  color: labThemeTokens.colors.primary[800],
                  fontSize: '13px'
                }}>
                  최종Ai판정
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result, index) => {
                // 검토의견이 비어있는 경우 판정여부는 성분명 검증과 잔류허용기준 일치 여부만 확인
                // 최종AI판정: 연구원이 검정증명서를 올바르게 작성했는지 확인
                // 조건1) 기록된 검토의견 = MRL판정 (연구원이 올바르게 판정했는지)
                // 조건2) 기록된 농약성분명 = 표준명 (연구원이 농약명을 정확히 적었는지)
                // 조건3) 기록된 MRL 값이 비어있지 않아야 함 (검정증명서 완성도)
                
                // MRL판정은 이미 친환경 조건이 반영되어 계산됨 (백엔드에서 처리)
                const mrlJudgmentCorrect = hasEmptyReviewOpinions 
                  ? true  // 검토의견이 없는 경우는 성분명만 확인
                  : result.pdf_result === ((result.db_calculated_result === '적합' && result.is_pdf_consistent) ? '적합' : '부적합');
                
                // 기록된 MRL 값이 비어있는지 확인
                const hasMrlValue = result.pdf_korea_mrl_text && 
                                   result.pdf_korea_mrl_text.trim() !== '' && 
                                   result.pdf_korea_mrl_text !== '-';
                
                // 최종 판정: 세 조건 모두 만족하면 연구원이 올바르게 작성한 것
                const verificationStatus = result.pesticide_name_match && mrlJudgmentCorrect && hasMrlValue;
                
                return (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: labThemeTokens.colors.gray[50] },
                      '&:hover': { 
                        backgroundColor: labThemeTokens.colors.primary[50],
                        transition: 'background-color 0.2s ease'
                      },
                      ...(!verificationStatus ? { 
                        backgroundColor: labThemeTokens.colors.data.danger + '10',
                        borderLeft: `4px solid ${labThemeTokens.colors.data.danger}`
                      } : {})
                    }}
                  >
                    <TableCell 
                      component="th" 
                      scope="row" 
                      sx={{ 
                        fontWeight: labThemeTokens.typography.fontWeight.medium,
                        color: labThemeTokens.colors.text.primary
                      }}
                    >
                      {result.pesticide_name}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: labThemeTokens.typography.fontFamily.mono,
                      fontSize: '13px',
                      color: labThemeTokens.colors.text.secondary
                    }}>
                      {result.standard_pesticide_name || '-'}
                    </TableCell>
                    <TableCell align="center">
                      {result.pesticide_name_match ? (
                        <Chip
                          icon={<CheckIcon sx={{ fontSize: '14px' }} />}
                          label="일치"
                          size="small"
                          sx={{
                            backgroundColor: labThemeTokens.colors.data.positive + '20',
                            color: labThemeTokens.colors.data.positive,
                            fontWeight: labThemeTokens.typography.fontWeight.medium,
                            fontSize: '11px'
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<CancelIcon sx={{ fontSize: '14px' }} />}
                          label="불일치"
                          size="small"
                          sx={{
                            backgroundColor: labThemeTokens.colors.data.danger + '20',
                            color: labThemeTokens.colors.data.danger,
                            fontWeight: labThemeTokens.typography.fontWeight.medium,
                            fontSize: '11px'
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      fontFamily: labThemeTokens.typography.fontFamily.data,
                      fontWeight: labThemeTokens.typography.fontWeight.semibold,
                      color: labThemeTokens.colors.text.primary
                    }}>
                      {parseFloat(result.detection_value).toFixed(3)}
                    </TableCell>
                    {/* PDF 잔류허용기준 표시 부분 */}
                    <TableCell align="right" sx={{ 
                      fontFamily: labThemeTokens.typography.fontFamily.data,
                      fontWeight: labThemeTokens.typography.fontWeight.bold,
                      color: labThemeTokens.colors.data.danger
                    }}>
                      {result.pdf_korea_mrl_text ? result.pdf_korea_mrl_text : 
                      (result.pdf_korea_mrl ? parseFloat(result.pdf_korea_mrl).toFixed(1) : '-')}
                    </TableCell>
                    {/* DB 잔류허용기준 표시 부분 */}
                    <TableCell align="right" sx={{ 
                      fontFamily: labThemeTokens.typography.fontFamily.data,
                      fontWeight: labThemeTokens.typography.fontWeight.bold,
                      color: labThemeTokens.colors.data.danger
                    }}>
                      {result.db_korea_mrl_display ? 
                        result.db_korea_mrl_display : 
                        (result.db_korea_mrl ? parseFloat(result.db_korea_mrl).toFixed(1) : '-')}
                    </TableCell>
                    {/* 검토의견이 비어있는 경우 PDF 판정은 '-'로 표시 */}
                    <TableCell align="center">
                      {!result.pdf_result || result.pdf_result === '-' ? (
                        <Typography variant="body2" color={labThemeTokens.colors.text.disabled}>
                          -
                        </Typography>
                      ) : (
                        <Chip
                          label={result.pdf_result}
                          size="small"
                          sx={{
                            backgroundColor: result.pdf_result === '적합' 
                              ? labThemeTokens.colors.data.positive + '20'
                              : labThemeTokens.colors.data.danger + '20',
                            color: result.pdf_result === '적합' 
                              ? labThemeTokens.colors.data.positive
                              : labThemeTokens.colors.data.danger,
                            fontWeight: labThemeTokens.typography.fontWeight.medium,
                            fontSize: '11px'
                          }}
                        />
                      )}
                    </TableCell>
                    
                    {/* 검토의견이 없는 경우에만 계산 판정 열 표시 */}
                    {!hasEmptyReviewOpinions && (
                      <TableCell align="center">
                        <Chip 
                          label={(result.db_calculated_result === '적합' && result.is_pdf_consistent) ? '적합' : '부적합'} 
                          size="small"
                          sx={{
                            backgroundColor: (result.db_calculated_result === '적합' && result.is_pdf_consistent) 
                              ? labThemeTokens.colors.data.positive + '20'
                              : labThemeTokens.colors.data.danger + '20',
                            color: (result.db_calculated_result === '적합' && result.is_pdf_consistent) 
                              ? labThemeTokens.colors.data.positive
                              : labThemeTokens.colors.data.danger,
                            fontWeight: labThemeTokens.typography.fontWeight.medium,
                            fontSize: '11px'
                          }}
                        />
                      </TableCell>
                    )}
                    
                    <TableCell align="center">
                      {verificationStatus ? (
                        <VerifiedIcon sx={{ 
                          color: labThemeTokens.colors.data.positive,
                          fontSize: '20px'
                        }} />
                      ) : (
                        <ErrorOutline sx={{ 
                          color: labThemeTokens.colors.data.danger,
                          fontSize: '20px'
                        }} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

// 2. 종합 평가 컴포넌트 수정 - 검토의견이 비어있는 경우 처리
// 종합 평가 컴포넌트에 친환경 표시 추가
const VerificationSummary = ({ results }) => {
  // 검토의견이 비어있는지 확인
  const hasEmptyReviewOpinions = results.every(result => !result.pdf_result || result.pdf_result === '-' || result.pdf_result === '');
  
  // 친환경 검정 여부 확인
  const isEcoFriendly = results.length > 0 && results[0].is_eco_friendly;
  
  // 판정여부 로직 수정
  let resultsConsistency = true;
  let inconsistentResultsCount = 0;
  
  if (hasEmptyReviewOpinions) {
    // 검토의견이 비어있는 경우: 성분명 검증과 잔류허용기준 일치 여부만 확인
    resultsConsistency = results.every(result => 
      result.pesticide_name_match && 
      (result.pdf_korea_mrl === result.db_korea_mrl || 
       (parseFloat(result.pdf_korea_mrl) === parseFloat(result.db_korea_mrl)))
    );
    
    inconsistentResultsCount = results.filter(result => 
      !result.pesticide_name_match || 
      (result.pdf_korea_mrl !== result.db_korea_mrl && 
       parseFloat(result.pdf_korea_mrl) !== parseFloat(result.db_korea_mrl))
    ).length;
  } else {
    // 수정된 로직: 검토의견이 있는 경우 성분명검증 + AI판정 모두 확인
    resultsConsistency = results.every(r => r.pesticide_name_match && r.is_pdf_consistent);
    inconsistentResultsCount = results.filter(r => !r.pesticide_name_match || !r.is_pdf_consistent).length;
  }
  
  return (
    <Card sx={{ 
      borderRadius: labThemeTokens.borderRadius.xl,
      boxShadow: labThemeTokens.shadows.elevated,
      border: `1px solid ${labThemeTokens.colors.gray[200]}`
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 3,
          p: 2,
          backgroundColor: labThemeTokens.colors.accent[50],
          borderRadius: labThemeTokens.borderRadius.lg,
          border: `1px solid ${labThemeTokens.colors.accent[200]}`
        }}>
          <VerifiedIcon sx={{ 
            mr: 1.5, 
            color: labThemeTokens.colors.accent[600],
            fontSize: '24px'
          }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: labThemeTokens.typography.fontWeight.bold,
              color: labThemeTokens.colors.accent[800]
            }}
          >
            종합 평가
          </Typography>
        </Box>
        
        {isEcoFriendly && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2,
              borderRadius: labThemeTokens.borderRadius.lg,
              backgroundColor: labThemeTokens.colors.status.info + '10',
              border: `1px solid ${labThemeTokens.colors.status.info}30`
            }}
          >
            이 검정증명서는 <strong>친환경인증용</strong>으로, 농약 검출량이 <strong>0.01 mg/kg 미만</strong>이어야 적합 판정을 받습니다.
          </Alert>
        )}
        
        {resultsConsistency ? (
          <Alert 
            severity="success" 
            sx={{ 
              borderRadius: labThemeTokens.borderRadius.lg,
              backgroundColor: labThemeTokens.colors.data.positive + '10',
              border: `1px solid ${labThemeTokens.colors.data.positive}30`,
              '& .MuiAlert-icon': {
                color: labThemeTokens.colors.data.positive
              }
            }}
          >
            <Typography sx={{ fontWeight: labThemeTokens.typography.fontWeight.medium }}>
              {hasEmptyReviewOpinions 
                ? "✅ 모든 농약성분명과 잔류허용기준이 정확하게 확인되었습니다."
                : "✅ 모든 검토의견이 정확하게 평가되었습니다."
              }
            </Typography>
          </Alert>
        ) : (
          <Alert 
            severity="warning" 
            sx={{ 
              borderRadius: labThemeTokens.borderRadius.lg,
              backgroundColor: labThemeTokens.colors.status.warning + '10',
              border: `1px solid ${labThemeTokens.colors.status.warning}30`,
              '& .MuiAlert-icon': {
                color: labThemeTokens.colors.status.warning
              }
            }}
          >
            <Typography sx={{ fontWeight: labThemeTokens.typography.fontWeight.medium }}>
              {hasEmptyReviewOpinions
                ? `⚠️ 일부 농약성분명 또는 잔류허용기준 불일치가 발견되었습니다. (${inconsistentResultsCount}건)`
                : `⚠️ 일부 검토의견 불일치가 발견되었습니다. (${inconsistentResultsCount}건)`
              }
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};


// 메인 컴포넌트
const CertificateAnalysisPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsingResult, setParsingResult] = useState(null);
  const [verificationResults, setVerificationResults] = useState(null);
  // 다이얼로그 상태 추가
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  // 품목 선택 다이얼로그 상태 추가
  const [foodSelectionDialogOpen, setFoodSelectionDialogOpen] = useState(false);
  const [parsedFood, setParsedFood] = useState('');
  const [similarFoods, setSimilarFoods] = useState([]);
  // 검증 확인 다이얼로그 상태 추가
  const [verificationConfirmDialogOpen, setVerificationConfirmDialogOpen] = useState(false);

  // 디버깅: 상태 변화 추적
  console.log('Current states:', {
    foodSelectionDialogOpen,
    parsedFood,
    similarFoodsLength: similarFoods.length
  });


  // fileInputRef 정의 (새로 추가)
  const fileInputRef = useRef(null);
  
  // 파일 업로드 및 분석 처리
  const handleUpload = async (overwrite = false) => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Form Data 생성
      const formData = new FormData();
      formData.append('file', file);
      
      // 덮어쓰기 옵션을 추가
      if (overwrite) {
        formData.append('overwrite', 'true');
      }
      
      // API 호출
      const response = await api.uploadCertificate(formData);
      
      // 디버깅 로그 추가
      console.log("API 응답:", response);
      
      // 중복된 증명서 확인
      if (response.message && response.message.includes("이미 업로드된 검정증명서")) {
        // 중복 다이얼로그 열기
        setDuplicateDialogOpen(true);
        
        // 이미 있는 데이터 표시
        setParsingResult(response.parsing_result);
        setVerificationResults(response.verification_result);
      } else {
        // 새로운 데이터 설정
        setParsingResult(response.parsing_result);
        setVerificationResults(response.verification_result);
      }
    } catch (err) {
      console.error('Certificate analysis error:', err);
      console.log('Error response data:', err.response?.data);
      
      // 품목 선택이 필요한 경우 처리
      console.log('Checking conditions:', {
        status: err.response?.status,
        requires_food_selection: err.response?.data?.requires_food_selection
      });
      
      if (err.response?.status === 400 && err.response?.data?.requires_food_selection) {
        console.log('Opening food selection dialog');
        // 품목 선택 팝업을 위한 상태만 설정하고, 분석 결과는 설정하지 않음
        setParsedFood(err.response.data.parsed_food);
        setSimilarFoods(err.response.data.similar_foods || []);
        setFoodSelectionDialogOpen(true);
        
        // 이전 결과가 있다면 초기화
        setParsingResult(null);
        setVerificationResults(null);
        setError(null);
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || '검정증명서 분석 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 덮어쓰기 확인 처리
  const handleOverwriteConfirm = () => {
    setDuplicateDialogOpen(false);
    handleUpload(true); // 덮어쓰기 옵션으로 다시 업로드
  };
  
  // 덮어쓰기 취소 처리
  const handleOverwriteCancel = () => {
    setDuplicateDialogOpen(false);
  };

  // 품목 선택 확인 처리
  const handleFoodSelectionConfirm = async (selectedFood) => {
    setFoodSelectionDialogOpen(false);
    
    // 특수 케이스: "유사한 품목이 없음" 선택 시 확인 다이얼로그 표시
    if (selectedFood === '__no_food_selected__') {
      setVerificationConfirmDialogOpen(true);
      return;
    }
    
    // 선택된 품목으로 재분석 요청
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('selected_food', selectedFood);
      
      try {
        setLoading(true);
        const response = await api.uploadCertificate(formData);
        setParsingResult(response.parsing_result);
        setVerificationResults(response.verification_result);
      } catch (err) {
        console.error('Re-analysis error:', err);
        setError(err.response?.data?.error || '재분석 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  // 검증 확인 다이얼로그 - 예 버튼 처리
  const handleVerificationConfirm = async () => {
    setVerificationConfirmDialogOpen(false);
    
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('skip_food_validation', 'true');
      
      try {
        setLoading(true);
        const response = await api.uploadCertificate(formData);
        setParsingResult(response.parsing_result);
        setVerificationResults(response.verification_result);
      } catch (err) {
        console.error('Re-analysis error:', err);
        setError(err.response?.data?.error || '재분석 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  // 검증 확인 다이얼로그 - 취소 버튼 처리 (전체 초기화)
  const handleVerificationCancel = () => {
    setVerificationConfirmDialogOpen(false);
    setParsedFood('');
    setSimilarFoods([]);
    // 전체 상태 초기화
    setFile(null);
    setParsingResult(null);
    setVerificationResults(null);
    setError(null);
    
    // 파일 인풋 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 품목 선택 취소 처리 (전체 초기화)
  const handleFoodSelectionCancel = () => {
    setFoodSelectionDialogOpen(false);
    setParsedFood('');
    setSimilarFoods([]);
    // 전체 상태 초기화
    setFile(null);
    setParsingResult(null);
    setVerificationResults(null);
    setError(null);
    
    // 파일 인풋 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // 파일 삭제 핸들러
  const handleFileDelete = () => {
    setFile(null);
    setParsingResult(null);
    setVerificationResults(null);
    setError(null);
    
    // 파일 인풋 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  


  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: labThemeTokens.colors.background.default
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 페이지 헤더 */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4,
          py: 2
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: labThemeTokens.typography.fontWeight.bold,
              color: labThemeTokens.colors.text.primary,
              mb: 1
            }}
          >
            검정증명서 분석 및 검증
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: labThemeTokens.colors.text.secondary
            }}
          >
            검정증명서를 업로드하여 농약 잔류허용기준 검증 및 검토의견 확인
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              mt: 0.5,
              color: labThemeTokens.colors.text.disabled,
              fontSize: '12px'
            }}
          >
            식품의약품안전처 고시번호 제2024-71호, 2024년 11월 14일 개정사항 반영
          </Typography>
        </Box>

      {/* 파일 업로드 섹션 */}
      <FileUploadSection 
        file={file}
        onFileChange={setFile}
        onUpload={() => handleUpload(false)} // 기본은 덮어쓰기 없음
        onFileDelete={handleFileDelete}
        loading={loading}
        fileInputRef={fileInputRef}
      />

      {/* 중복 확인 다이얼로그 */}
      <DuplicateDialog 
        open={duplicateDialogOpen}
        onClose={handleOverwriteCancel}
        onConfirm={handleOverwriteConfirm}
      />

      {/* 품목 선택 다이얼로그 */}
      <FoodSelectionDialog 
        open={foodSelectionDialogOpen}
        onClose={handleFoodSelectionCancel}
        onConfirm={handleFoodSelectionConfirm}
        parsedFood={parsedFood}
        similarFoods={similarFoods}
      />

      {/* 검증 확인 다이얼로그 */}
      <VerificationConfirmDialog 
        open={verificationConfirmDialogOpen}
        onClose={handleVerificationCancel}
        onConfirm={handleVerificationConfirm}
      />

      {/* 오류 표시 */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: labThemeTokens.borderRadius.lg,
            border: `1px solid ${labThemeTokens.colors.status.error}30`
          }}
        >
          {error}
        </Alert>
      )}
      
      {/* 결과 표시 영역 - 조건부 렌더링 */}
      {parsingResult && (
        <>
          {/* 기본 정보 표시 */}
          <CertificateBasicInfo data={parsingResult} />
          
          {/* 농약 검출 결과 및 검증 결과 */}
          <PesticideResultsVerification results={verificationResults} />
          
          {/* 종합 평가 및 요약 */}
          <VerificationSummary results={verificationResults} />
        </>
      )}
      </Container>
    </Box>
  );
};

export default CertificateAnalysisPage;