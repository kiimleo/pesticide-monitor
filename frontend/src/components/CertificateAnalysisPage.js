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
  DialogActions
} from '@mui/material';
import { CloudUpload, CheckCircleOutline, ErrorOutline, Info } from '@mui/icons-material';
import { api } from '../services/api';

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
      sx={{ 
        p: 3, 
        mb: 3, 
        border: '2px dashed #ccc',
        borderRadius: 2,
        textAlign: 'center'
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
      
      <Typography variant="h6" gutterBottom>
        검정증명서 PDF 업로드
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        PDF 파일을 여기에 드래그 앤 드롭하거나 클릭하여 선택하세요.
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<CloudUpload />}
          onClick={() => fileInputRef.current.click()}
        >
          파일 선택
        </Button>
        
        <Button 
          variant="contained" 
          disabled={!file || loading}
          onClick={onUpload}
        >
          {loading ? <CircularProgress size={24} /> : '분석하기'}
        </Button>
      </Box>
      
      {file && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Typography variant="body2">
            선택된 파일: {file.name}
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            size="small"
            onClick={onFileDelete}
          >
            파일삭제
          </Button>
        </Box>
      )}
    </Paper>
  );
};

// 중복 확인 시 표시할 다이얼로그 컴포넌트
const DuplicateDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>중복된 검정증명서</DialogTitle>
      <DialogContent>
        <Typography>
          동일한 증명서 번호가 이미 등록되어 있습니다. 덮어쓰시겠습니까?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={onConfirm} color="primary">덮어쓰기</Button>
      </DialogActions>
    </Dialog>
  );
};

// 기본 정보 표시 컴포넌트
const CertificateBasicInfo = ({ data }) => {
  if (!data) return null;
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Info sx={{ mr: 1 }} />
          기본 정보
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                증명서 번호
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {data.certificate_number || '-'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                검정 품목
              </Typography>
              <Typography variant="body1" fontWeight="medium" color="primary.main">
                {data.sample_description || '-'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                신청인
              </Typography>
              <Typography variant="body1">
                {data.applicant_name || '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {data.applicant_address}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                생산자/수거지
              </Typography>
              <Typography variant="body1">
                {data.producer_info || '-'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                검정 기간
              </Typography>
              <Typography variant="body1">
                {data.test_start_date} ~ {data.test_end_date}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                검정 항목
              </Typography>
              <Typography variant="body1">
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
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleOutline sx={{ mr: 1 }} />
          농약 검출 결과 및 검증
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell>농약성분명</TableCell>
                <TableCell>표준명</TableCell>
                <TableCell align="center">성분명검증</TableCell>
                <TableCell align="right">검출량(mg/kg)</TableCell>
                <TableCell align="right">PDF 잔류허용기준</TableCell>
                <TableCell align="right">DB 잔류허용기준</TableCell>
                
                {/* 검토의견이 없는 경우에도 PDF 판정 열은 유지 */}
                <TableCell align="center">PDF 판정</TableCell>
                
                {/* 검토의견이 없는 경우 계산 판정 열 숨김 */}
                {!hasEmptyReviewOpinions && (
                  <TableCell align="center">계산 판정</TableCell>
                )}
                
                <TableCell align="center">판정여부</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result, index) => {
                // 검토의견이 비어있는 경우 판정여부는 성분명 검증과 잔류허용기준 일치 여부만 확인
                const verificationStatus = hasEmptyReviewOpinions
                  ? (result.pesticide_name_match && 
                     (result.pdf_korea_mrl === result.db_korea_mrl || 
                      (parseFloat(result.pdf_korea_mrl) === parseFloat(result.db_korea_mrl))))
                  : result.is_pdf_consistent;
                
                return (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                      ...(!verificationStatus ? { backgroundColor: 'error.lighter' } : {})
                    }}
                  >
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                      {result.pesticide_name}
                    </TableCell>
                    <TableCell>
                      {result.standard_pesticide_name || '-'}
                    </TableCell>
                    <TableCell align="center">
                      {result.pesticide_name_match ? (
                        <CheckCircleOutline color="success" fontSize="small" />
                      ) : (
                        <ErrorOutline color="error" fontSize="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {parseFloat(result.detection_value).toFixed(3)}
                    </TableCell>
                    {/* PDF 잔류허용기준 표시 부분 */}
                    <TableCell align="right">
                      {result.pdf_korea_mrl_text ? result.pdf_korea_mrl_text : 
                      (result.pdf_korea_mrl ? parseFloat(result.pdf_korea_mrl).toFixed(1) : '-')}
                    </TableCell>
                    {/* DB 잔류허용기준 표시 부분 */}
                    <TableCell align="right">
                      {result.db_korea_mrl_display ? 
                        result.db_korea_mrl_display : 
                        (result.db_korea_mrl ? parseFloat(result.db_korea_mrl).toFixed(1) : '-')}
                    </TableCell>
                    {/* 검토의견이 비어있는 경우 PDF 판정은 '-'로 표시 */}
                    <TableCell align="center">
                      {!result.pdf_result || result.pdf_result === '-' ? (
                        '-'
                      ) : (
                        <Chip 
                          label={result.pdf_result} 
                          color={result.pdf_result === '적합' ? 'success' : 'error'}
                          size="small"
                        />
                      )}
                    </TableCell>
                    
                    {/* 검토의견이 없는 경우에만 계산 판정 열 표시 */}
                    {!hasEmptyReviewOpinions && (
                      <TableCell align="center">
                        <Chip 
                          label={result.pdf_calculated_result} 
                          color={result.pdf_calculated_result === '적합' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    )}
                    
                    <TableCell align="center">
                      {verificationStatus ? (
                        <CheckCircleOutline color="success" />
                      ) : (
                        <ErrorOutline color="error" />
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
const VerificationSummary = ({ results }) => {
  // 검토의견이 비어있는지 확인
  const hasEmptyReviewOpinions = results.every(result => !result.pdf_result || result.pdf_result === '-' || result.pdf_result === '');
  
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
    // 기존 로직: 검토의견이 있는 경우 is_pdf_consistent 사용
    resultsConsistency = results.every(r => r.is_pdf_consistent);
    inconsistentResultsCount = results.filter(r => !r.is_pdf_consistent).length;
  }
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          종합 평가
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        {resultsConsistency ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {hasEmptyReviewOpinions 
              ? "모든 농약성분명과 잔류허용기준이 정확하게 확인되었습니다."
              : "모든 검토의견이 정확하게 평가되었습니다."
            }
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {hasEmptyReviewOpinions
              ? `일부 농약성분명 또는 잔류허용기준 불일치가 발견되었습니다. (${inconsistentResultsCount}건)`
              : `일부 검토의견 불일치가 발견되었습니다. (${inconsistentResultsCount}건)`
            }
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
      setError(err.response?.data?.error || '검정증명서 분석 중 오류가 발생했습니다.');
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
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        검정증명서 분석 및 검증
      </Typography>
      
      <Box sx={{ mb: 3, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          검정증명서를 업로드하여 농약 잔류허용기준 검증 및 검토의견 확인
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

      {/* 오류 표시 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
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
    </Box>
  );
};

export default CertificateAnalysisPage;