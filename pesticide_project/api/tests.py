def list(self, request):
    pesticide = request.query_params.get('pesticide', '').strip().replace(' ', '')
    food = request.query_params.get('food', '').strip()
    get_all_foods = request.query_params.get('getAllFoods', '').lower() == 'true'

    pesticide_query = Q(pesticide_name_kr__icontains=pesticide) | Q(pesticide_name_en__icontains=pesticide)
    queryset = self.queryset.filter(pesticide_query)

    # 식품 카테고리 조회
    try:
        # 1. 입력된 식품명이 다른 식품의 상위분류인지 먼저 확인
        is_category = FoodCategory.objects.filter(
            Q(main_category__iexact=food) | Q(sub_category__iexact=food)
        ).exists()

        if is_category:
            # 상위분류명으로 직접 검색
            category_matches = queryset.filter(food_name__iexact=food)
            if category_matches.exists():
                for match in category_matches:
                    match.matching_type = 'direct'
                    match.original_food = food
                return Response(self.get_serializer(category_matches, many=True).data)

        # 2. 일반 식품명으로 처리
        category = FoodCategory.objects.get(food_name__iexact=food)

        # 직접 매칭 시도
        direct_matches = queryset.filter(food_name__iexact=food)
        if direct_matches.exists():
            return Response(self.get_serializer(direct_matches, many=True).data)

        # 소분류 매칭 시도
        if category.sub_category:
            sub_matches = queryset.filter(food_name__iexact=category.sub_category)
            if sub_matches.exists():
                for match in sub_matches:
                    match.matching_type = 'sub'
                    match.original_food = food
                return Response(self.get_serializer(sub_matches, many=True).data)

        # 대분류 매칭 시도
        if category.main_category:
            main_matches = queryset.filter(food_name__iexact=category.main_category)
            if main_matches.exists():
                for match in main_matches:
                    match.matching_type = 'main'
                    match.original_food = food
                return Response(self.get_serializer(main_matches, many=True).data)

    except FoodCategory.DoesNotExist:
        pass

    return Response({
        "error": "no_match",
        "error_type": "not_found",
        "message": "해당하는 잔류허용기준이 없습니다.",
        "searched_food": food
    }, status=status.HTTP_404_NOT_FOUND)