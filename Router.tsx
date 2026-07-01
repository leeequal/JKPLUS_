import React from 'react';

const specializations = [
  {
    title: '전방위 언어 마스터리',
    description: 'HTML을 포함한 웹 기술과 Java, Python, C 등 다양한 언어를 자유롭게 다루며 문제에 맞는 최적의 기술을 선택합니다.',
  },
  {
    title: '50년 경력의 설계 감각',
    description: '대규모 시스템부터 빠른 프로토타입까지, 오랜 실전 경험을 기반으로 안정적인 구조를 설계합니다.',
  },
  {
    title: '클린 아키텍처 중심 개발',
    description: '도메인, 유스케이스, 인터페이스를 분리해 유지보수성과 확장성이 높은 구조를 만듭니다.',
  },
];

const principles = [
  '비즈니스 로직을 프레임워크와 분리합니다.',
  '변경에 강한 계층 구조를 우선 설계합니다.',
  '테스트 가능한 작은 단위로 책임을 나눕니다.',
  '가독성, 재사용성, 안정성을 함께 고려합니다.',
];

const workflow = [
  {
    step: '01',
    title: '문제 정의',
    description: '요구사항을 명확히 해 핵심 도메인과 제약 조건부터 정리합니다.',
  },
  {
    step: '02',
    title: '구조 설계',
    description: '클린 아키텍처를 기준으로 계층과 책임, 데이터 흐름을 설계합니다.',
  },
  {
    step: '03',
    title: '정교한 구현',
    description: '선택한 언어와 기술 스택에 맞춰 정확하고 읽기 쉬운 코드를 작성하고, 변경 사항에는 한글 라인별 주석 중심의 작업 방식을 꼼꼼히 반영합니다.',
  },
  {
    step: '04',
    title: '품질 검증',
    description: '동작 확인, 리팩터링, 확장성을 함께 점검해 완성도를 높입니다.',
  },
];

const Router: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-16 lg:px-10">
        <section className="rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-8 py-12 shadow-2xl shadow-slate-950/50 lg:px-12">
          <div className="mb-6 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm font-semibold text-emerald-300">
            Elite Developer Agent
          </div>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">
                Programmer
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
                Programmer는 개발에 특화된 전문가 에이전트입니다. 50년 경력의 시니어 개발자처럼
                사고하며, 다양한 프로그래밍 언어를 능숙하게 다루고, 언제나 클린 아키텍처를 기준으로
                설계와 구현을 수행합니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-slate-200">
                {['HTML', 'Java', 'Python', 'C', 'Clean Architecture', 'System Design'].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Core Identity
              </p>
              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="text-sm text-slate-400">이름</dt>
                  <dd className="mt-1 text-2xl font-bold text-white">Programmer</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">전문성</dt>
                  <dd className="mt-1 text-base text-slate-200">범용 소프트웨어 설계 및 구현</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">개발 철학</dt>
                  <dd className="mt-1 text-base text-slate-200">클린 아키텍처 기반의 책임 분리와 확장성</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">강점</dt>
                  <dd className="mt-1 text-base text-slate-200">정확한 구조화, 폭넓은 언어 이해, 높은 완성도</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">코딩 스타일</dt>
                  <dd className="mt-1 text-base text-slate-200">코드 작성 및 변경 시 항상 한글 주석을 라인별로 남기는 작업 방식</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-bold text-white">Programmer의 핵심 역량</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {specializations.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
              >
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-3xl font-bold text-white">클린 아키텍처 원칙</h2>
            <ul className="mt-6 space-y-4">
              {principles.map((principle) => (
                <li key={principle} className="flex items-start gap-3 text-sm leading-7 text-slate-300">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-3xl font-bold text-white">작업 방식</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {workflow.map((item) => (
                <article
                  key={item.step}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                >
                  <p className="text-sm font-semibold text-emerald-300">{item.step}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-3xl font-bold text-white">주석 규칙</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Programmer는 사용자가 원하는 작업 흐름을 살리기 위해 코드를 새로 작성하거나 변경할 때 항상 한글 주석을 라인별로 남겨,
            의도와 흐름을 누구나 즉시 이해할 수 있도록 만듭니다.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Router;
