// Design Tokens based on Figma design
export const designTokens = {
  colors: {
    primary: {
      50: '#E8F5E8',
      100: '#C8E8C8', 
      200: '#A5D9A5',
      300: '#81CA81',
      400: '#66BE66',
      500: '#4A7C59', // Main green from design
      600: '#3E6B4A',
      700: '#32583C',
      800: '#26452E',
      900: '#1A3220'
    },
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    },
    white: '#FFFFFF',
    black: '#000000',
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
      inverse: '#FFFFFF'
    },
    status: {
      info: '#3B82F6',
      success: '#10B981', 
      warning: '#F59E0B',
      error: '#EF4444'
    }
  },
  
  typography: {
    fontFamily: {
      primary: '"Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      english: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
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
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// MUI Theme 생성
export const createMuiTheme = () => ({
  palette: {
    primary: {
      main: designTokens.colors.primary[500],
      light: designTokens.colors.primary[300],
      dark: designTokens.colors.primary[700],
      contrastText: designTokens.colors.white
    },
    secondary: {
      main: designTokens.colors.gray[600],
      light: designTokens.colors.gray[400],
      dark: designTokens.colors.gray[800]
    },
    background: {
      default: designTokens.colors.background.default,
      paper: designTokens.colors.background.paper
    },
    text: {
      primary: designTokens.colors.text.primary,
      secondary: designTokens.colors.text.secondary
    }
  },
  typography: {
    fontFamily: designTokens.typography.fontFamily.primary,
    h1: {
      fontSize: designTokens.typography.fontSize['5xl'],
      fontWeight: designTokens.typography.fontWeight.bold,
      lineHeight: designTokens.typography.lineHeight.tight
    },
    h2: {
      fontSize: designTokens.typography.fontSize['4xl'],
      fontWeight: designTokens.typography.fontWeight.bold,
      lineHeight: designTokens.typography.lineHeight.tight
    },
    h3: {
      fontSize: designTokens.typography.fontSize['3xl'],
      fontWeight: designTokens.typography.fontWeight.semibold,
      lineHeight: designTokens.typography.lineHeight.tight
    },
    h4: {
      fontSize: designTokens.typography.fontSize['2xl'],
      fontWeight: designTokens.typography.fontWeight.semibold,
      lineHeight: designTokens.typography.lineHeight.normal
    },
    h5: {
      fontSize: designTokens.typography.fontSize.xl,
      fontWeight: designTokens.typography.fontWeight.semibold,
      lineHeight: designTokens.typography.lineHeight.normal
    },
    h6: {
      fontSize: designTokens.typography.fontSize.lg,
      fontWeight: designTokens.typography.fontWeight.semibold,
      lineHeight: designTokens.typography.lineHeight.normal
    },
    body1: {
      fontSize: designTokens.typography.fontSize.base,
      fontWeight: designTokens.typography.fontWeight.normal,
      lineHeight: designTokens.typography.lineHeight.normal
    },
    body2: {
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.normal,
      lineHeight: designTokens.typography.lineHeight.normal
    }
  },
  spacing: 8, // Base spacing unit (8px)
  shape: {
    borderRadius: parseInt(designTokens.borderRadius.md) * 16 // Convert to px
  }
});