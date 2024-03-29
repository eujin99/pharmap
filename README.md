# pharmap

## 위치기반 약국찾기 웹 서비스

  <img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> 
  <img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white"> 
  <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> 
<img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white">


### 소개페이지

![image](https://github.com/eujin99/pharmap/assets/155924495/189b8b16-3ee6-4f44-ba9c-04bef2f0a92c)


### 메인페이지

![image](https://github.com/eujin99/pharmap/assets/155924495/6437eae4-ad97-44e3-9e96-cab2637f3086)

네이버 지도 API , 국립중앙의료원_전국 약국 정보 조회 서비스 공공데이터 API 사용

사용자의 위치를 받아 위도 및 경도를 표시하고, 그에 따른 주변 약국 마커를 지도위에 표시되게 한다.

- [검색] 약국명과 지역을 입력 시 해당 검색어에 따라 지도가 자동 이동.

- [검색] 검색한 해당 약국 및 그 지역 주변의 약국을 마커한다. 
- [지도] 자유롭게 지도 확대 및 축소가 가능하다.

![image](https://github.com/eujin99/pharmap/assets/155924495/d8af99a0-3a74-41bc-ab2d-44e549e2d203)

[마커] 클릭 시 해당 약국의 이름, 주소, 전화번호, 영업시간 , 카카오맵 연결, 실시간 채팅하기 기능을 나열한다.

![image](https://github.com/eujin99/pharmap/assets/155924495/9893fb7b-1bec-4bea-af84-5c31f0ae45a4)

[실시간 채팅하기] 모든 사용자는 해당 약국의 채팅방을 열어 익명으로 채팅할 수 있다.

![image](https://github.com/eujin99/pharmap/assets/155924495/cdecd994-e992-4504-8467-6c4a2c1241bc)

[실시간 채팅하기] 각각의 사용자는 익명번호를 부여받고, 자신의 채팅은 회색으로 블럭처리 해 알아보기 쉽게 한다.

### 회원가입 페이지
![image](https://github.com/eujin99/pharmap/assets/155924495/4f6d2cfd-9dae-4931-9538-20837e8eda25)

[회원가입] ID , password 을 받아 회원가입 할 수 있게 하며, 약사와 일반회원으로 분류할 수 있다. 이미 회원일 경우 아래의 로그인 버튼을 눌러 로그인이 가능하다.

### 로그인 페이지

![image](https://github.com/eujin99/pharmap/assets/155924495/15401e05-ec4b-4f75-adf5-f9250b39d096)

[로그인] 가입된 ID 와 password 를 사용 시 로그인이 가능하다.


### 로그인 후 메인페이지
![image](https://github.com/eujin99/pharmap/assets/155924495/2a89f547-6a20-459b-ab91-0d7cc89b088f)

[로그인 확인] '사용자ID' 님 반갑습니다! 와 함께 로그인이 되었음을 확인할 수 있다.


### 수정할 사항

- 사용자가 위치 범위를 지정해서 범위 내의 약국들만 맵핑될 수 있도록 할 것.

- 사용자가 지도를 특정 크기 이하로 축소할 경우 마커 클러스터화 할 것.

- 회원가입 시 약사와 회원을 분류해 약사 회원일 경우 익명번호가 아닌 특정 이름으로 표기하며, 블럭 색상도 따로 분류해 약사의 채팅을 누구든지 알아볼 수 있게 할 것.
