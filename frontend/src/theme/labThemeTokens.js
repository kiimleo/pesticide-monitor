// Professional Laboratory Theme Design Tokens
export const labThemeTokens = {
  colors: {
    // Primary colors - 전문적인 네이비/블루 계열
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#1976d2',  // 메인 블루
      600: '#1565c0',
      700: '#0d47a1',
      800: '#0a3d8f',
      900: '#002171'
    },
    // Laboratory accent colors - 청록색 계열
    accent: {
      50: '#e0f7fa',
      100: '#b2ebf2',
      200: '#80deea',
      300: '#4dd0e1',
      400: '#26c6da',
      500: '#00acc1',
      600: '#00838f',
      700: '#006064',
      800: '#004d40',
      900: '#00251a'
    },
    // Data colors - 데이터 표시용
    data: {
      positive: '#00c853',  // 녹색 - 안전
      warning: '#ff6f00',   // 주황 - 주의
      danger: '#d50000',    // 빨강 - 위험
      neutral: '#616161'    // 회색 - 중립
    },
    // Neutral colors - 회색 계열
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121'
    },
    // Background variations
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
      elevated: '#ffffff',
      dark: '#263238',
      overlay: 'rgba(0, 0, 0, 0.6)'
    },
    // Text colors
    text: {
      primary: '#212121',
      secondary: '#616161',
      disabled: '#9e9e9e',
      inverse: '#ffffff',
      hint: '#757575'
    },
    // Status colors
    status: {
      info: '#0288d1',
      success: '#2e7d32',
      warning: '#ed6c02',
      error: '#d32f2f'
    },
    // Lab specific colors
    lab: {
      beaker: '#e3f2fd',      // 비커 배경
      solution: '#bbdefb',    // 용액 색상
      measurement: '#1976d2', // 측정값
      gridline: '#e0e0e0',    // 그리드라인
      highlight: '#fff59d'    // 하이라이트
    }
  },
  
  typography: {
    fontFamily: {
      primary: '"Roboto", "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"Roboto Mono", "Consolas", "Monaco", monospace',
      data: '"Inter", "Roboto", sans-serif'
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px  
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      data: 1.4
    }
  },
  
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    base: '0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    md: '0 4px 8px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 20px -3px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 30px -5px rgba(0, 0, 0, 0.08), 0 10px 15px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    card: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.05)',
    elevated: '0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)'
  },
  
  effects: {
    glass: {
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    glow: {
      primary: '0 0 20px rgba(25, 118, 210, 0.3)',
      accent: '0 0 20px rgba(0, 172, 193, 0.3)',
      danger: '0 0 20px rgba(213, 0, 0, 0.3)'
    }
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// Lab Theme MUI 설정
export const createLabMuiTheme = () => ({
  palette: {
    primary: {
      main: labThemeTokens.colors.primary[500],
      light: labThemeTokens.colors.primary[300],
      dark: labThemeTokens.colors.primary[700],
      contrastText: '#ffffff'
    },
    secondary: {
      main: labThemeTokens.colors.accent[500],
      light: labThemeTokens.colors.accent[300],
      dark: labThemeTokens.colors.accent[700],
      contrastText: '#ffffff'
    },
    background: {
      default: labThemeTokens.colors.background.default,
      paper: labThemeTokens.colors.background.paper
    },
    text: {
      primary: labThemeTokens.colors.text.primary,
      secondary: labThemeTokens.colors.text.secondary
    },
    error: {
      main: labThemeTokens.colors.status.error
    },
    warning: {
      main: labThemeTokens.colors.status.warning
    },
    info: {
      main: labThemeTokens.colors.status.info
    },
    success: {
      main: labThemeTokens.colors.status.success
    }
  },
  typography: {
    fontFamily: labThemeTokens.typography.fontFamily.primary,
    h1: {
      fontSize: labThemeTokens.typography.fontSize['5xl'],
      fontWeight: labThemeTokens.typography.fontWeight.bold,
      lineHeight: labThemeTokens.typography.lineHeight.tight
    },
    h2: {
      fontSize: labThemeTokens.typography.fontSize['4xl'],
      fontWeight: labThemeTokens.typography.fontWeight.bold,
      lineHeight: labThemeTokens.typography.lineHeight.tight
    },
    h3: {
      fontSize: labThemeTokens.typography.fontSize['3xl'],
      fontWeight: labThemeTokens.typography.fontWeight.semibold,
      lineHeight: labThemeTokens.typography.lineHeight.tight
    },
    h4: {
      fontSize: labThemeTokens.typography.fontSize['2xl'],
      fontWeight: labThemeTokens.typography.fontWeight.semibold,
      lineHeight: labThemeTokens.typography.lineHeight.normal
    },
    h5: {
      fontSize: labThemeTokens.typography.fontSize.xl,
      fontWeight: labThemeTokens.typography.fontWeight.semibold,
      lineHeight: labThemeTokens.typography.lineHeight.normal
    },
    h6: {
      fontSize: labThemeTokens.typography.fontSize.lg,
      fontWeight: labThemeTokens.typography.fontWeight.semibold,
      lineHeight: labThemeTokens.typography.lineHeight.normal
    },
    body1: {
      fontSize: labThemeTokens.typography.fontSize.base,
      fontWeight: labThemeTokens.typography.fontWeight.normal,
      lineHeight: labThemeTokens.typography.lineHeight.normal
    },
    body2: {
      fontSize: labThemeTokens.typography.fontSize.sm,
      fontWeight: labThemeTokens.typography.fontWeight.normal,
      lineHeight: labThemeTokens.typography.lineHeight.normal
    }
  },
  spacing: 8,
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: labThemeTokens.borderRadius.lg,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: labThemeTokens.shadows.sm
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: labThemeTokens.shadows.card,
          borderRadius: labThemeTokens.borderRadius.xl
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: labThemeTokens.borderRadius.lg,
            backgroundColor: labThemeTokens.colors.background.paper,
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: labThemeTokens.colors.primary[400]
              }
            }
          }
        }
      }
    }
  }
});