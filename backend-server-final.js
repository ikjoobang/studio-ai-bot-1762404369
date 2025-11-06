// Studio AI Bot - 프로덕션 백엔드 서버
// 일반 상담 + 전문 컨설팅 통합

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// OpenAI 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 미들웨어
app.use(cors());
app.use(express.json());

// 루트 경로 - API 정보 페이지
app.get('/', (req, res) => {
  const baseUrl = req.protocol + '://' + req.get('host');
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Studio AI Bot API</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 800px;
          width: 100%;
          padding: 40px;
        }
        h1 {
          color: #667eea;
          font-size: 2.5em;
          margin-bottom: 10px;
        }
        .status {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.9em;
          margin-bottom: 30px;
        }
        h2 {
          color: #374151;
          margin-top: 30px;
          margin-bottom: 15px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .endpoint {
          background: #f3f4f6;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin: 10px 0;
          border-radius: 5px;
        }
        .method {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 3px 10px;
          border-radius: 3px;
          font-size: 0.85em;
          font-weight: bold;
          margin-right: 10px;
        }
        .method.post { background: #10b981; }
        code {
          background: #1f2937;
          color: #10b981;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        pre {
          background: #1f2937;
          color: #e5e7eb;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
          margin: 10px 0;
        }
        .contact {
          background: #eff6ff;
          padding: 20px;
          border-radius: 10px;
          margin-top: 30px;
        }
        .contact a {
          color: #667eea;
          text-decoration: none;
          font-weight: bold;
        }
        .contact a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 Studio AI Bot API</h1>
        <span class="status">✅ 서버 정상 작동 중</span>
        
        <h2>📡 API 엔드포인트</h2>
        
        <div class="endpoint">
          <span class="method">GET</span>
          <code>${baseUrl}/health</code>
          <p style="margin-top: 10px; color: #6b7280;">서버 상태 확인</p>
        </div>
        
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>${baseUrl}/api/chat</code>
          <p style="margin-top: 10px; color: #6b7280;">AI 챗봇 API (일반 상담 / 전문 컨설팅)</p>
        </div>
        
        <h2>📝 사용 예시</h2>
        <pre>{
  "message": "AI 영상 제작 서비스에 대해 알려주세요",
  "mode": "inquiry",
  "history": []
}</pre>
        
        <p style="margin: 10px 0; color: #6b7280;">
          <strong>mode:</strong> <code>inquiry</code> (일반 상담) 또는 <code>consulting</code> (전문 컨설팅)
        </p>
        
        <div class="contact">
          <h3 style="margin-bottom: 10px;">📧 문의</h3>
          <p>이메일: <a href="mailto:studio.ikjoo@gmail.com">studio.ikjoo@gmail.com</a></p>
          <p>웹사이트: <a href="https://studiojuai.com" target="_blank">@studiojuai.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Studio AI Bot',
    timestamp: new Date().toISOString()
  });
});

// 챗봇 API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, mode, history } = req.body;
    
    // 입력 검증
    if (!message || !mode) {
      return res.status(400).json({ error: '메시지와 모드가 필요합니다.' });
    }
    
    if (!['inquiry', 'consulting'].includes(mode)) {
      return res.status(400).json({ error: '유효하지 않은 모드입니다.' });
    }
    
    let systemPrompt = '';
    let temperature = 0.7;
    let maxTokens = 500;
    
    if (mode === 'inquiry') {
      // 일반 상담 모드
      systemPrompt = `당신은 Studio AI의 고객 상담 담당자입니다.

🎯 회사 소개:
Studio AI는 AI 기반 마케팅 솔루션 전문 기업입니다.

📦 제공 서비스:
1. AI 영상 제작
   - B2B 전문 영상 (LinkedIn, YouTube 최적화)
   - 포트폴리오 영상, 프로모션 영상
   - 교육 콘텐츠, 브랜딩 영상
   
2. AI 마케팅 자동화
   - 30개 AI 봇으로 구성된 통합 플랫폼
   - 블로그 작성, SNS 콘텐츠 생성
   - 캠페인 자동화, 리드 생성
   
3. 통합 컨설팅
   - 콘텐츠 전략 수립
   - 마케팅 파이프라인 구축
   - 블로그 → 영상 → 컨설팅 통합 솔루션

💰 가격 (참고):
- AI 영상 제작: 프로젝트별 견적 (₩300만~)
- 마케팅 자동화: 월 구독 (₩30만~)
- 통합 컨설팅: 맞춤 견적

👤 상담 목표:
1. 빠르고 친절한 안내
2. 고객 니즈 정확히 파악
3. 적합한 서비스 추천
4. 구체적 문의 시 이메일 안내

📧 연락처:
- 이메일: studio.ikjoo@gmail.com
- 홈페이지: @studiojuai.com

✨ 답변 스타일:
- 친절하고 전문적
- 간결하고 명확 (200-300자)
- 구체적인 예시 포함
- 행동 유도 (CTA)

⚠️ 주의사항:
- 가격은 "견적 상담 필요" 안내
- 과도한 약속 금지
- 전문성 유지
- 이메일로 상세 상담 유도`;

      temperature = 0.7;
      maxTokens = 400;
      
    } else if (mode === 'consulting') {
      // 전문 컨설팅 모드 (BEAI 구조)
      systemPrompt = `당신은 Studio AI의 수석 컨설턴트입니다.

🎯 전문 분야:
- AI 마케팅 전략
- 영상 콘텐츠 전략  
- 비즈니스 성장 컨설팅
- 자동화 시스템 구축
- 디지털 트랜스포메이션

📋 답변 구조 (BEAI 7단계):

❶ 문제 재해석
- 사용자의 질문 이면에 숨겨진 진짜 문제 파악
- 표면적 요구 vs 근본적 니즈 구분
- 맥락과 배경 이해

❷ 표준 해법
- 업계 일반적 접근법 제시
- 대부분의 사람들이 시도하는 방법
- 검증된 기본 전략

❸ 한계 인식
- 표준 해법의 문제점과 한계 지적
- 왜 많은 사람들이 실패하는가
- 간과되는 리스크

❹ 역발상 전략
- 새로운 시각과 접근법 제안
- 경쟁자들과 다른 방법
- 창의적 솔루션

❺ 사례 연결
- 성공/실패 사례 활용
- 구체적 데이터와 결과
- 실전 적용 가능한 인사이트

❻ 통합 전략
- 실행 가능한 구체적 계획
- 단계별 로드맵
- 필요한 리소스와 도구

❼ 실행 유도
- 즉시 시작할 수 있는 첫 단계
- 명확한 액션 아이템
- 다음 단계 안내

🧠 사고 프레임워크 (프랙탈):
모든 문제를 4개 축으로 분석:
1. 심리: 사람들의 동기와 감정
2. 구조: 시스템과 프로세스
3. 관계: 네트워크와 연결
4. 실행: 구체적 행동과 결과

✨ 답변 스타일:
- 깊이 있는 분석 (500-800자)
- 구체적이고 실행 가능
- 통찰력 있는 관점
- 데이터/사례 기반
- 전문성과 신뢰감

⚠️ 중요:
- 단순 정보 전달이 아닌 "통찰" 제공
- 고객의 비즈니스 맥락 이해
- 실행 가능한 조언
- 필요시 심화 상담 유도 (studio.ikjoo@gmail.com)

💡 예시 구조:
"[질문 재해석] → [표준 접근의 문제] → [새로운 관점] → [구체적 전략] → [첫 단계]"`;

      temperature = 0.8;
      maxTokens = 1000;
    }
    
    // 대화 히스토리 구성
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // 최근 6개 메시지만 포함
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-6);
      recentHistory.forEach(msg => {
        if (msg.sender === 'user') {
          messages.push({ role: 'user', content: msg.text });
        } else if (msg.sender === 'bot') {
          // HTML 태그 제거
          const cleanText = msg.text.replace(/<[^>]*>/g, '');
          messages.push({ role: 'assistant', content: cleanText });
        }
      });
    }
    
    // 현재 메시지 추가
    messages.push({ role: 'user', content: message });
    
    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
    });
    
    const reply = completion.choices[0].message.content;
    
    // 응답 포맷팅 (줄바꿈 → <br>)
    const formattedReply = reply.replace(/\n/g, '<br>');
    
    res.json({ 
      reply: formattedReply,
      mode: mode,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat API Error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({ 
        error: 'OpenAI API 할당량이 초과되었습니다.' 
      });
    }
    
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    });
  }
});
