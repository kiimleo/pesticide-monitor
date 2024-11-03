def _log_search(self, pesticide, food):
    """검색 로그를 기록하는 내부 메서드"""
    # 클라이언트 IP 가져오기
    x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = self.request.META.get('REMOTE_ADDR')

    # 검색어 조합
    search_term = f"농약: {pesticide if pesticide else '-'}, 식품: {food if food else '-'}"

    # 검색 결과 개수 확인
    results_count = self.get_queryset().count()

    # 검색 로그 저장
    SearchLog.objects.create(
        search_term=search_term,
        pesticide_term=pesticide,          # 농약명 입력
        food_term=food,                    # 식품명 입력
        results_count=results_count,       # 검색 결과 개수 입력
        ip_address=ip,
        user_agent=self.request.META.get('HTTP_USER_AGENT')
    )
