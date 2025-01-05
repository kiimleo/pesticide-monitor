def list(self, request):
    pesticide = request.query_params.get('pesticide', '').strip().replace(' ', '')
    food = request.query_params.get('food', '').strip()
    get_all_foods = request.query_params.get('getAllFoods', '').lower() == 'true'

    pesticide_query = Q(pesticide_name_kr__icontains=pesticide) | Q(pesticide_name_en__icontains=pesticide)
    queryset = self.queryset.filter(pesticide_query)

    if get_all_foods and pesticide:
        queryset = queryset.order_by('food_name')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    if not pesticide or not food:
        return Response([])

    pesticide_exists = queryset.exists()

    # 먼저 직접 매칭 시도
    direct_matches = queryset.filter(food_name__iexact=food).order_by(
        Case(
            When(food_name__iexact=food, then=0),
            default=1
        ),
        'food_name'
    )

    if direct_matches.exists():
        serializer = self.get_serializer(direct_matches, many=True)
        return Response(serializer.data)

    # 직접 매칭이 없는 경우에만 FoodCategory 확인
    try:
        category = FoodCategory.objects.get(food_name__iexact=food)
        if category.sub_category:
            sub_matches = queryset.filter(food_name__iexact=category.sub_category)
            if sub_matches.exists():
                for match in sub_matches:
                    match.matching_type = 'sub'
                    match.original_food_name = food
                serializer = self.get_serializer(sub_matches, many=True)
                return Response(serializer.data)

        if category.main_category:
            main_matches = queryset.filter(food_name__iexact=category.main_category)
            if main_matches.exists():
                for match in main_matches:
                    match.matching_type = 'main'
                    match.original_food_name = food
                serializer = self.get_serializer(main_matches, many=True)
                return Response(serializer.data)

    except FoodCategory.DoesNotExist:
        pass

    pesticide_info = queryset.first()
    return Response({
        "error": "no_match",
        "error_type": "not_permitted",
        "message": f"'{pesticide}'은(는) '{food}'에 사용이 허가되지 않은 농약성분입니다.",
        "searched_pesticide": pesticide,
        "pesticide_name_kr": pesticide_info.pesticide_name_kr if pesticide_info else pesticide,
        "pesticide_name_en": pesticide_info.pesticide_name_en if pesticide_info else pesticide,
        "searched_food": food
    }, status=status.HTTP_404_NOT_FOUND)