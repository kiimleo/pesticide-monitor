def list(self, request):
    pesticide = request.query_params.get('pesticide', '').strip().replace(' ', '')
    food = request.query_params.get('food', '').strip()

    if not pesticide or not food:
        queryset = self.queryset
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    # 1. 농약 존재 여부 확인
    pesticide_exists = PesticideLimit.objects.filter(
        Q(pesticide_name_kr__icontains=pesticide) |
        Q(pesticide_name_en__icontains=pesticide)
    ).exists()

    # 2. 식품 존재 여부 확인
    food_exists = FoodCategory.objects.filter(food_name__iexact=food).exists()

    # 3. 둘 중 하나라도 존재하지 않으면 입력 오류로 판단
    if not pesticide_exists or not food_exists:
        return Response({
            "error": "no_match",
            "error_type": "input_error",
            "message": "해당하는 잔류허용기준이 없습니다. 입력하신 내용을 다시 확인해 주세요.",
            "details": {
                "pesticide_exists": pesticide_exists,
                "food_exists": food_exists,
                "searched_pesticide": pesticide,
                "searched_food": food
            }
        }, status=status.HTTP_404_NOT_FOUND)

    # 4. 기존 검색 로직 수행
    pesticide_query = Q(pesticide_name_kr__icontains=pesticide) | Q(pesticide_name_en__icontains=pesticide)
    queryset = self.queryset.filter(pesticide_query)

    # 직접 매칭 및 부분 매칭 결과 모두 가져오기
    base_food_name = food.split('(')[0] if '(' in food else food  # '무(뿌리)' -> '무'
    matches = queryset.filter(
        Q(food_name__iexact=food) |  # 정확한 매칭
        Q(food_name__icontains=base_food_name)  # 부분 매칭
    ).order_by(
        Case(
            When(food_name__iexact=food, then=0),  # 정확한 매칭을 먼저
            default=1
        ),
        'food_name'  # 그 다음 식품명 알파벳 순
    )

    if matches.exists():
        serializer = self.get_serializer(matches, many=True)
        return Response(serializer.data)

    # 카테고리 매칭 시도
    try:
        category = FoodCategory.objects.get(food_name__iexact=food)

        # 소분류 매칭
        if category.sub_category:
            sub_matches = queryset.filter(food_name__iexact=category.sub_category)
            if sub_matches.exists():
                serializer = self.get_serializer(sub_matches, many=True)
                return Response(serializer.data)

        # 대분류 매칭
        main_matches = queryset.filter(food_name__iexact=category.main_category)
        if main_matches.exists():
            serializer = self.get_serializer(main_matches, many=True)
            return Response(serializer.data)

    except FoodCategory.DoesNotExist:
        pass

    # 매칭되는 데이터가 없는 경우
    return Response({
        "error": "no_match",
        "error_type": "not_permitted",
        "message": f"'{pesticide}'은(는) '{food}'에 사용이 허가되지 않은 농약입니다.",
        "searched_pesticide": pesticide,
        "searched_food": food
    }, status=status.HTTP_404_NOT_FOUND)