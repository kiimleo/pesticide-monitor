import logging
import time
from django.utils.deprecation import MiddlewareMixin


class AutocompleteFilter(logging.Filter):
    """
    autocomplete 요청에 대한 로그를 필터링하는 클래스
    """
    def filter(self, record):
        # 로그 메시지에 'autocomplete'가 포함되어 있으면 필터링 (False 반환)
        if hasattr(record, 'getMessage'):
            message = record.getMessage()
            if 'autocomplete' in message:
                return False
        return True

# 미들웨어가 로드될 때 즉시 로그 출력
print("=" * 60)
print("RequestLoggingMiddleware is being loaded!")
print("=" * 60)

logger = logging.getLogger('api')

class RequestLoggingMiddleware(MiddlewareMixin):
    """
    모든 HTTP 요청을 로깅하는 미들웨어
    """
    def __init__(self, get_response):
        super().__init__(get_response)
        self.get_response = get_response
        # 미들웨어 초기화 시 로그
        print(f"RequestLoggingMiddleware initialized with logger: {logger.name}")
        logger.info("RequestLoggingMiddleware initialized!")
    
    def __call__(self, request):
        # autocomplete 요청은 로깅하지 않음
        skip_logging = 'autocomplete' in request.path
        
        if not skip_logging:
            # __call__ 메소드에서도 로깅
            print(f"[MIDDLEWARE __call__] Processing: {request.method} {request.path}")
        
        # 요청 시작 시간 기록
        request._start_time = time.time()
        
        if not skip_logging:
            # 요청 정보 로깅
            msg = f"Request: {request.method} {request.path} from {request.META.get('REMOTE_ADDR', 'unknown')}"
            print(f"[REQUEST] {msg}")
            logger.info(msg)
        
        response = self.get_response(request)
        
        if not skip_logging:
            # 응답 로깅
            if hasattr(request, '_start_time'):
                duration = time.time() - request._start_time
                msg = f"Response: {request.method} {request.path} - Status: {response.status_code} - Duration: {duration:.3f}s"
                print(f"[RESPONSE] {msg}")
                logger.info(msg)
        
        return response
    
    def process_request(self, request):
        # 요청 시작 시간 기록
        request._start_time = time.time()
        
        # 요청 정보 로깅 - print와 logger 둘 다 사용
        msg = f"Request: {request.method} {request.path} from {request.META.get('REMOTE_ADDR', 'unknown')}"
        print(f"[REQUEST process_request] {msg}")  # 강제로 stdout에 출력
        logger.info(msg)
        return None
    
    def process_response(self, request, response):
        # 응답 시간 계산
        if hasattr(request, '_start_time'):
            duration = time.time() - request._start_time
            msg = f"Response: {request.method} {request.path} - Status: {response.status_code} - Duration: {duration:.3f}s"
            print(f"[RESPONSE] {msg}")  # 강제로 stdout에 출력
            logger.info(msg)
        
        return response
    
    def process_exception(self, request, exception):
        # 예외 발생 시 로깅
        logger.error(f"Exception in {request.method} {request.path}: {str(exception)}", exc_info=True)
        return None