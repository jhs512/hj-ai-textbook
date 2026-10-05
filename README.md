# 생성형 AI 업무 활용 교재 (ChatGPT · Claude · Gemini)

공공기관 실무자 대상 6시간 과정의 교안/교재 초안. 빌드 도구 없이 정적 HTML로 구성되어 GitHub Pages에서 바로 서비스됩니다.

## 구성

| 파일 | 내용 | 시간 |
|---|---|---|
| `index.html` | 과정 소개, 세부 강의내용 표, 하루 흐름 | - |
| `pre-workbook.html` | 모듈 0. 사전 워크북 (계정·인터페이스·프롬프트 기초) | 사전 |
| `m1-ot.html` | 모듈 1. OT & 생성형 AI 업무 활용 개요 | 0.5H |
| `m2-chatgpt.html` | 모듈 2. ChatGPT 업무 활용 (캔버스, 맞춤형 GPT, ALIO 비교표) | 1.5H |
| `m3-claude.html` | 모듈 3. Claude 업무 활용 (Artifact, Projects, 나라장터 조항) | 1.5H |
| `m4-gemini.html` | 모듈 4. Gemini 업무 활용 (Docs/Sheets, NotebookLM, Gems, 시트 집계) | 1.5H |
| `m5-apply.html` | 모듈 5. 내 업무 적용 & 정리 (보안, 무료 한도) | 1H |
| `print.html` | 전체를 한 페이지로 모아 PDF 출력 (강사 노트/워크북 포함 여부 선택) | - |

`assets/style.css` 가 화면·인쇄 스타일을, `assets/site.js` 가 사이드바·목차·이전/다음·프롬프트 복사 버튼을 담당합니다.

## PDF 만들기

1. GitHub Pages 주소에서 `print.html` 을 연다 (로컬 파일로 열면 `fetch` 가 막혀 모듈이 로드되지 않음. 로컬에서는 `python -m http.server` 로 띄워서 연다).
2. 상단 바에서 강사 노트·사전 워크북 포함 여부를 선택한다.
3. Chrome 인쇄 → 대상 "PDF로 저장" → 용지 A4 → "배경 그래픽" 켜기.

## 교재 기호

- 어두운 상자 = 프롬프트 (복사 버튼, 노란 글씨는 바꿔 쓸 부분)
- 파란 상자 = 학습 목표 / 노란 = 강사 노트 / 빨간 = 보안 주의 / 초록 = 체크포인트 / 보라 = 공공 예제

## 로컬에서 보기

```bash
python -m http.server 8000
```

후 http://localhost:8000 접속.
