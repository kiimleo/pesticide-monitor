import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';
import { designTokens } from '../theme/designTokens';

const NewHeader = ({ user, onLogout, showNavigation = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const headerStyles = {
    backgroundColor: designTokens.colors.primary[500],
    boxShadow: 'none',
    borderBottom: showNavigation ? 'none' : `1px solid ${designTokens.colors.primary[600]}`
  };

  const titleBarStyles = {
    backgroundColor: designTokens.colors.white,
    height: '64px', // 헤더와 같은 높이
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    px: 4
  };

  // logoStyles 제거됨 - 사용되지 않음

  const navButtonStyles = {
    color: designTokens.colors.white,
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.medium,
    textTransform: 'none',
    px: designTokens.spacing[4],
    py: designTokens.spacing[2],
    borderRadius: designTokens.borderRadius.md,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  };

  const authButtonStyles = {
    ...navButtonStyles,
    border: `1px solid ${designTokens.colors.white}`,
    '&:hover': {
      backgroundColor: designTokens.colors.white,
      color: designTokens.colors.primary[500]
    }
  };

  const menuIconStyles = {
    color: designTokens.colors.white,
    fontSize: designTokens.typography.fontSize.xl
  };

  return (
    <Box>
      {/* 상단 타이틀 바 */}
      <Box sx={titleBarStyles}>
        <Typography 
          sx={{
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: designTokens.typography.fontSize['2xl'],
            fontWeight: 800, // extra-bold
            fontStyle: 'italic',
            color: designTokens.colors.primary[500],
            cursor: 'pointer'
          }}
          onClick={() => navigate('/new-design')}
        >
          Findpest - Ai search
        </Typography>
      </Box>

      {/* 메인 헤더 */}
      <AppBar position="static" sx={headerStyles}>
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          {/* 왼쪽: 홈 버튼 + 네비게이션 */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            {/* 모바일 메뉴 아이콘 */}
            <IconButton 
              sx={{ display: { xs: 'block', md: 'none' }, mr: 2 }}
              onClick={() => {/* 모바일 메뉴 토글 */}}
            >
              <MenuIcon sx={menuIconStyles} />
            </IconButton>

            {/* 네비게이션 메뉴 (데스크톱) */}
            {showNavigation && (
              <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                gap: designTokens.spacing[6]
              }}>
                <Button 
                  sx={{
                    ...navButtonStyles,
                    backgroundColor: location.pathname === '/search' ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                  }}
                  onClick={() => navigate('/search')}
                >
                  잔류농약 허용기준
                </Button>
                <Button 
                  sx={{
                    ...navButtonStyles,
                    backgroundColor: location.pathname === '/certificate-analysis' ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                  }}
                  onClick={() => navigate('/certificate-analysis')}
                >
                  검정증명서 검증
                </Button>
              </Box>
            )}
          </Box>

          {/* 오른쪽: 사용자 메뉴 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing[2] }}>
            {user ? (
              <>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: designTokens.colors.white,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  {user.organization}의 {user.email}님
                </Typography>
                <Button 
                  sx={authButtonStyles}
                  onClick={onLogout}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Button 
                  sx={{...navButtonStyles, display: { xs: 'none', sm: 'inline-flex' }}}
                  onClick={() => navigate('/auth?mode=login')}
                >
                  Login
                </Button>
                <Button 
                  sx={authButtonStyles}
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  회원가입
                </Button>
              </>
            )}
          </Box>
        </Toolbar>

      {/* 모바일 네비게이션 (필요시 구현) */}
      {showNavigation && (
        <Box sx={{ 
          display: { xs: 'block', md: 'none' },
          backgroundColor: designTokens.colors.primary[600],
          px: 2,
          py: 1
        }}>
          <Button 
            fullWidth
            sx={{
              ...navButtonStyles,
              justifyContent: 'flex-start',
              mb: 1,
              backgroundColor: location.pathname === '/search' ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
            }}
            onClick={() => navigate('/search')}
          >
            잔류농약 허용기준
          </Button>
          <Button 
            fullWidth
            sx={{
              ...navButtonStyles,
              justifyContent: 'flex-start',
              backgroundColor: location.pathname === '/certificate-analysis' ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
            }}
            onClick={() => navigate('/certificate-analysis')}
          >
            검정증명서 검증
          </Button>
        </Box>
      )}
      </AppBar>
    </Box>
  );
};

export default NewHeader;