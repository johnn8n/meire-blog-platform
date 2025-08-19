const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 연결
const db = new sqlite3.Database(path.join(__dirname, '../database.db'));

// 약 100자(3배) 길이의 상세한 회사 설명
const detailedDescriptions = {
  // 🇰🇷 한국 주요 종목
  '005930': '세계 최대 메모리 반도체 제조사이자 갤럭시 스마트폰으로 글로벌 모바일 시장을 선도하는 삼성그룹의 핵심 계열사. HBM 메모리와 파운드리 사업으로 AI 반도체 생태계를 주도하며 연매출 200조원 규모의 글로벌 IT 공룡',
  
  '000660': '세계 2위 메모리 반도체 제조사로 DRAM과 NAND 플래시를 주력 생산하며, 최근 AI 데이터센터 핵심 부품인 HBM 메모리 분야에서 삼성전자와 함께 글로벌 독점 체제를 구축하여 차세대 반도체 시장을 선도',
  
  'TSLA': '일론 머스크가 CEO로 이끄는 전기차 혁신 기업으로 Model S/3/X/Y 라인업과 Cybertruck으로 글로벌 전기차 시장을 개척. FSD 자율주행 기술, 슈퍼차저 네트워크, 에너지 저장 시스템을 통해 지속가능한 에너지 생태계 구축',
  
  'NVDA': 'GPU 기술로 시작해 ChatGPT 등 생성형 AI 혁명의 핵심 인프라인 H100, A100 AI 칩을 독점 공급하며 AI 시대의 절대 강자로 부상. 데이터센터, 자율주행, 메타버스 전 분야에서 AI 컴퓨팅 플랫폼 지배',
  
  'AAPL': '아이폰으로 스마트폰 혁명을 이끌고 iOS 생태계, 앱스토어, 애플 실리콘으로 하드웨어와 소프트웨어를 통합한 독자적 플랫폼을 구축. 연매출 400조원, 시가총액 3조달러의 세계 최대 기술기업',
  
  'GOOGL': '구글 검색엔진으로 인터넷 생태계를 장악하고 유튜브, 안드로이드 OS, 구글 클라우드를 통해 디지털 인프라를 제공. AI 기술 Bard와 Gemini로 차세대 인공지능 경쟁을 선도하는 알파벳의 핵심 자회사',
  
  '373220': 'LG화학에서 분사한 세계 2위 배터리 제조사로 테슬라, GM, 볼보 등 글로벌 완성차 업체에 전기차용 리튬이온 배터리를 공급. ESS와 소형 배터리까지 전 분야를 아우르는 배터리 생태계 완성',
  
  'LLY': '1876년 창립된 글로벌 제약 대기업으로 당뇨병 치료제 인슐린을 최초 상용화한 역사를 보유. 최근 비만치료제 Mounjaro와 알츠하이머 치료제로 제약업계 혁신을 주도하며 연매출 30조원 규모 달성',
  
  'INTC': '반도체 산업의 50년 선구자로 x86 CPU 아키텍처를 개발해 PC 혁명을 이끌었으며, 현재 데이터센터용 Xeon 프로세서와 AI 칩 Gaudi, 파운드리 사업으로 반도체 생태계 전반에서 재도약 추진',
  
  'UNH': '미국 최대 건강보험회사이자 의료서비스 통합 제공업체로 5000만명 이상에게 보험 서비스를 제공하며, Optum 헬스케어 플랫폼을 통해 의료 데이터 분석과 원격진료까지 아우르는 디지털 헬스케어 생태계 구축',
  
  // 추가 주요 종목들
  'AMZN': '세계 최대 전자상거래 플랫폼이자 AWS 클라우드로 전 세계 인터넷 인프라의 30%를 담당하는 클라우드 공룡. 프라임 멤버십, 알렉사 스마트홈, 원데이 배송으로 소비자 경험을 혁신하며 연매출 500조원 달성',
  
  'TSM': '애플 아이폰 A시리즈 칩과 엔비디아 GPU를 위탁생산하는 세계 1위 파운드리 기업. 첨단 3나노 공정 기술로 글로벌 반도체 생산의 50% 이상을 담당하며 대만 경제의 핵심축 역할',
  
  '042660': 'LNG선과 해양플랜트 건조 전문 조선기업으로 친환경 선박 기술을 보유한 한화그룹 계열사. 해상풍력 발전설비 제작과 수소 추진 선박 개발로 그린 에너지 해양 솔루션 분야 선도기업으로 전환',
  
  '035420': '국내 최대 포털사이트 네이버를 운영하며 웹툰, 클로바 AI, 네이버 클라우드로 디지털 콘텐츠와 B2B 서비스까지 확장. 라인과 함께 아시아 디지털 플랫폼 생태계를 구축하는 글로벌 IT 기업',
  
  '035720': '카카오톡 메신저로 국내 모바일 생활 인프라를 장악하고 카카오페이, 카카오택시, 카카오뱅크로 핀테크와 O2O 서비스를 통합 제공. 디지털 플랫폼을 통한 생활밀착형 서비스 생태계 완성',
  
  '006400': '삼성그룹 계열의 배터리 소재와 반도체 소재 전문기업으로 전기차 배터리용 양극재와 반도체 공정용 특수 소재를 생산. 차세대 전고체 배터리와 첨단 반도체 소재 개발로 미래 성장 동력 확보',
  
  'JPM': '미국 최대 투자은행이자 상업은행으로 자산규모 4조달러를 보유한 월스트리트의 금융 공룡. 투자은행업무, 자산관리, 개인금융, 상업금융을 아우르며 글로벌 금융시장에서 독보적 영향력 행사',
  
  'ASML': '반도체 제조의 핵심 장비인 극자외선(EUV) 노광장비를 전 세계에서 유일하게 생산하는 네덜란드 기업. 삼성, TSMC, 인텔 등 모든 반도체 제조사가 의존하는 첨단 반도체 생산의 절대 필수 기업',
  
  'AMD': '인텔의 최대 경쟁사로 고성능 CPU Ryzen과 GPU Radeon을 제조하며 최근 AI 분야에서도 급성장. 데이터센터용 EPYC 프로세서와 AI 가속기 Instinct로 엔비디아와 인텔에 도전하는 반도체 강자'
};

console.log('🔄 상세한 회사 설명(약 100자) 업데이트 시작...');
console.log(`📊 총 ${Object.keys(detailedDescriptions).length}개 종목 업데이트 예정\n`);

// 각 회사 설명을 업데이트
const updatePromises = Object.entries(detailedDescriptions).map(([ticker, description]) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE stocks SET description = ? WHERE ticker = ?',
      [description, ticker],
      function(err) {
        if (err) {
          console.error(`❌ ${ticker} 업데이트 실패:`, err);
          reject(err);
        } else {
          if (this.changes > 0) {
            console.log(`✅ ${ticker}: "${description.substring(0, 50)}..." (${description.length}자)`);
          } else {
            console.log(`⚠️ ${ticker}: 해당 종목을 찾을 수 없습니다`);
          }
          resolve();
        }
      }
    );
  });
});

// 모든 업데이트 완료 후 확인
Promise.all(updatePromises)
  .then(() => {
    console.log('\n🎯 업데이트 완료! 최종 확인:');
    db.all(
      'SELECT ticker, company_name, description, LENGTH(description) as len FROM stocks WHERE ticker IN (' + 
      Object.keys(detailedDescriptions).map(() => '?').join(',') + ') ORDER BY len DESC',
      Object.keys(detailedDescriptions),
      (err, rows) => {
        if (err) {
          console.error('❌ 확인 쿼리 실패:', err);
        } else {
          console.log('\n📋 업데이트된 종목들:');
          rows.forEach(row => {
            const length = row.description?.length || 0;
            const preview = row.description ? row.description.substring(0, 60) + '...' : 'N/A';
            console.log(`${row.ticker} (${row.company_name}): ${length}자`);
            console.log(`   "${preview}"`);
          });
          
          const avgLength = rows.reduce((sum, row) => sum + (row.len || 0), 0) / rows.length;
          console.log(`\n📊 평균 설명 길이: ${Math.round(avgLength)}자`);
          
          const shortDescriptions = rows.filter(row => row.len < 80);
          const longDescriptions = rows.filter(row => row.len > 120);
          
          if (shortDescriptions.length > 0) {
            console.log(`\n⚠️ 80자 미만 종목 (${shortDescriptions.length}개):`);
            shortDescriptions.forEach(row => console.log(`${row.ticker}: ${row.len}자`));
          }
          
          if (longDescriptions.length > 0) {
            console.log(`\n📝 120자 초과 종목 (${longDescriptions.length}개):`);
            longDescriptions.forEach(row => console.log(`${row.ticker}: ${row.len}자`));
          }
          
          console.log(`\n✅ 상세 설명 업데이트 완료! 평균 ${Math.round(avgLength)}자`);
        }
        
        db.close((err) => {
          if (err) {
            console.error('❌ DB 연결 종료 실패:', err);
          } else {
            console.log('\n✅ 데이터베이스 연결 종료');
          }
        });
      }
    );
  })
  .catch((error) => {
    console.error('❌ 업데이트 실패:', error);
    db.close();
  });