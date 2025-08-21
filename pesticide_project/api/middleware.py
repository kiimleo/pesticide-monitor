import logging
import time
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('api')

class RequestLoggingMiddleware(MiddlewareMixin):
    """
    모든 HTTP 요청을 로깅하는 미들웨어
    """
    def process_request(self, request):
        # 요청 시작 시간 기록
        request._start_time = time.time()
        
        # 요청 정보 로깅
        logger.info(f"Request: {request.method} {request.path} from {request.META.get('REMOTE_ADDR', 'unknown')}")
        return None
    
    def process_response(self, request, response):
        # 응답 시간 계산
        if hasattr(request, '_start_time'):
            duration = time.time() - request._start_time
            logger.info(f"Response: {request.method} {request.path} - Status: {response.status_code} - Duration: {duration:.3f}s")
        
        return response
    
    def process_exception(self, request, exception):
        # 예외 발생 시 로깅
        logger.error(f"Exception in {request.method} {request.path}: {str(exception)}", exc_info=True)
        return None