# pesticide_project/api/tests/test_api.py
import requests
import os
from dotenv import load_dotenv


def test_pesticide_api():
    # .env 파일 로드
    load_dotenv()

    # 환경변수에서 API 키 가져오기
    api_key = os.getenv('PESTICIDE_API_KEY')
    print(f"Using API Key: {api_key}")

    url = f"http://openapi.foodsafetykorea.go.kr/api/{api_key}/I1910/json/1/100/PRDLST_KOR_NM=만디프로파미드"
    print(f"Request URL: {url}")

    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")


if __name__ == '__main__':
    test_pesticide_api()