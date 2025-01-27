class RequestLoggerMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print(f"Method: {request.method}, Path: {request.path}, Headers: {request.headers}")
        response = self.get_response(request)
        return response
