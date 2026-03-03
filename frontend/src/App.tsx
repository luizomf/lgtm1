import { useState, useEffect, useRef } from 'react';
import './App.css';

const COMPONENTS = [
  {
    id: 'loki',
    letter: 'L',
    name: 'Loki',
    tagline: 'O Detetive dos Logs',
    color: '#F97316',
    bgGrad: 'from-orange-500/20 to-orange-900/10',
    icon: '🔍',
    analogy:
      'Imagine um detetive que não lê todos os livros da biblioteca — ele apenas anota onde cada livro está na prateleira. Quando precisa de algo, vai direto ao ponto.',
    whatItDoes:
      'Loki agrega e armazena logs de todas as suas aplicações. Diferente do Elasticsearch, ele NÃO indexa o conteúdo dos logs — apenas os metadados (labels). Isso o torna absurdamente mais leve e barato.',
    keyInsight: 'Indexa só os labels, não o conteúdo → 10x mais barato que ELK',
    queryLang: 'LogQL',
    querySample: 'rate({job="api"} |= "error" [5m])',
    realWorld:
      'Sua API retorna 500 — você busca nos logs pelo label {service="checkout"} e filtra por |= "timeout" em segundos.',
    trivia:
      'Nomeado em homenagem ao deus nórdico da travessura. Logs podem ser traiçoeiros mesmo!',
    connects: ['grafana', 'tempo'],
    pillar: 'LOGS',
    pillarEmoji: '📜',
  },
  {
    id: 'grafana',
    letter: 'G',
    name: 'Grafana',
    tagline: 'O Painel de Controle',
    color: '#FACC15',
    bgGrad: 'from-yellow-500/20 to-yellow-900/10',
    icon: '📊',
    analogy:
      'Pense no painel de um carro: velocímetro, nível de combustível, temperatura. Grafana é o painel do seu sistema — tudo visível num só lugar.',
    whatItDoes:
      'Grafana é a camada de visualização. Ele conecta Loki, Tempo e Mimir em dashboards unificados, com alertas configuráveis por email, Slack, etc.',
    keyInsight:
      "O 'cérebro visual' — conecta logs, métricas e traces em um só lugar",
    queryLang: 'Vários (LogQL, PromQL, TraceQL)',
    querySample: 'Dashboard → Add Panel → Data Source: Mimir',
    realWorld:
      'Você cria um dashboard que mostra latência (Mimir), erros nos logs (Loki) e o trace da requisição lenta (Tempo) — tudo correlacionado.',
    trivia:
      'Começou como fork do Kibana em 2014. Hoje é usado por NASA, Bloomberg e milhares de empresas.',
    connects: ['loki', 'tempo', 'mimir'],
    pillar: 'VISUALIZAÇÃO',
    pillarEmoji: '👁️',
  },
  {
    id: 'tempo',
    letter: 'T',
    name: 'Tempo',
    tagline: 'O Rastreador de Jornadas',
    color: '#3B82F6',
    bgGrad: 'from-blue-500/20 to-blue-900/10',
    icon: '🔗',
    analogy:
      'Imagine rastrear uma encomenda: saiu do armazém → passou pela transportadora → chegou na sua casa. Tempo faz isso com requisições no seu sistema.',
    whatItDoes:
      'Tempo armazena distributed traces — o caminho completo que uma requisição percorre entre microserviços. Sem indexação, usando apenas o Trace ID para buscas rápidas.',
    keyInsight: 'Busca por Trace ID em tempo constante — sem indexar nada',
    queryLang: 'TraceQL',
    querySample: '{ resource.service.name = "checkout" && duration > 2s }',
    realWorld:
      'O checkout está lento. Você pega o Trace ID, abre no Tempo e vê: Auth (50ms) → Cart (80ms) → Payment Gateway (3.2s) 💥 — achamos o gargalo!',
    trivia:
      'Pode gerar métricas RED (Rate, Error, Duration) automaticamente dos traces e enviar ao Mimir!',
    connects: ['grafana', 'mimir'],
    pillar: 'TRACES',
    pillarEmoji: '🔗',
  },
  {
    id: 'mimir',
    letter: 'M',
    name: 'Mimir',
    tagline: 'A Memória das Métricas',
    color: '#A855F7',
    bgGrad: 'from-purple-500/20 to-purple-900/10',
    icon: '📈',
    analogy:
      'Pense num termômetro que registra a temperatura a cada segundo, por anos. Mimir é esse termômetro para CPU, memória, latência — qualquer número que muda no tempo.',
    whatItDoes:
      'Mimir é um banco de dados de séries temporais, compatível com Prometheus. Ele armazena e consulta métricas em escala massiva com sharding horizontal.',
    keyInsight:
      'Prometheus compatível + escalabilidade horizontal = métricas sem limite',
    queryLang: 'PromQL',
    querySample: 'rate(http_requests_total{status=~"5.."}[5m])',
    realWorld:
      'Alerta: taxa de erros 5xx subiu 300% nos últimos 5 minutos. Mimir dispara o alert, Grafana mostra o gráfico, você investiga no Loki e Tempo.',
    trivia:
      'Nomeado em homenagem a Mímir, o ser mais sábio da mitologia nórdica — guardião da fonte do conhecimento.',
    connects: ['grafana', 'tempo'],
    pillar: 'MÉTRICAS',
    pillarEmoji: '📈',
  },
];

const QUIZ_QUESTIONS = [
  {
    q: 'Qual componente NÃO indexa o conteúdo dos logs, apenas os labels?',
    options: ['Mimir', 'Loki', 'Tempo', 'Grafana'],
    correct: 1,
    explanation:
      'Loki indexa apenas metadados (labels), não o conteúdo — isso o torna muito mais eficiente em armazenamento.',
  },
  {
    q: 'Qual é a linguagem de consulta do Mimir?',
    options: ['LogQL', 'TraceQL', 'PromQL', 'GraphQL'],
    correct: 2,
    explanation:
      'Mimir é compatível com Prometheus, então usa PromQL para consultar métricas.',
  },
  {
    q: 'Tempo busca traces usando qual identificador?',
    options: ['Service Name', 'Trace ID', 'Span Name', 'Log Label'],
    correct: 1,
    explanation:
      'Tempo usa o Trace ID para busca em tempo constante, sem necessidade de indexação.',
  },
  {
    q: "Qual componente é o 'centro visual' que conecta todos os outros?",
    options: ['Loki', 'Tempo', 'Mimir', 'Grafana'],
    correct: 3,
    explanation:
      'Grafana é a camada de visualização que unifica logs, métricas e traces em dashboards.',
  },
  {
    q: 'Em um cenário real: o checkout está lento. Qual componente mostra o caminho da requisição entre serviços?',
    options: ['Loki', 'Grafana', 'Tempo', 'Mimir'],
    correct: 2,
    explanation:
      'Tempo armazena distributed traces — o caminho completo que uma requisição percorre entre microserviços.',
  },
  {
    q: 'Qual componente pode gerar métricas RED automaticamente a partir de traces?',
    options: ['Loki', 'Grafana', 'Mimir', 'Tempo'],
    correct: 3,
    explanation:
      'Tempo pode gerar métricas de Rate, Error e Duration automaticamente e enviá-las ao Mimir!',
  },
];

const tabs = [
  { id: 'explore', label: '🧭 Explorar', desc: 'Componentes' },
  { id: 'flow', label: '⚡ Fluxo', desc: 'Como funciona' },
  { id: 'quiz', label: '🧠 Quiz', desc: 'Teste seus conhecimentos' },
  { id: 'cheat', label: '📋 Cola', desc: 'Referência rápida' },
];

function TypeWriter({ text, speed = 25, onDone }) {
  const [displayed, setDisplayed] = useState('');
  const idx = useRef(0);
  useEffect(() => {
    setDisplayed('');
    idx.current = 0;
    const interval = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1));
        idx.current++;
      } else {
        clearInterval(interval);
        onDone && onDone();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);
  return (
    <span>
      {displayed}
      <span className='animate-pulse'>▌</span>
    </span>
  );
}

function GlowDot({ color, size = 8 }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}40`,
      }}
    />
  );
}

function ComponentCard({ comp, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className='relative text-left w-full group'
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${comp.color}18, ${comp.color}08)`
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isActive ? comp.color + '60' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 16,
        padding: '20px 22px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
        cursor: 'pointer',
      }}
    >
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: -1,
            left: 20,
            right: 20,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${comp.color}, transparent)`,
            borderRadius: 2,
          }}
        />
      )}
      <div className='flex items-center gap-3 mb-2'>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${comp.color}30, ${comp.color}10)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            border: `1px solid ${comp.color}30`,
          }}
        >
          {comp.icon}
        </div>
        <div>
          <div className='flex items-center gap-2'>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 800,
                fontSize: 18,
                color: comp.color,
                letterSpacing: '-0.02em',
              }}
            >
              {comp.name}
            </span>
            <span
              style={{
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 6,
                background: `${comp.color}15`,
                color: comp.color,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}
            >
              {comp.pillar}
            </span>
          </div>
          <span
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.45)',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {comp.tagline}
          </span>
        </div>
      </div>
      {isActive && (
        <div
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.6,
            marginTop: 8,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {comp.analogy}
        </div>
      )}
    </button>
  );
}

function DetailPanel({ comp }) {
  const [section, setSection] = useState('what');
  const sections = [
    { id: 'what', label: 'O que faz' },
    { id: 'query', label: 'Query' },
    { id: 'real', label: 'Caso Real' },
    { id: 'fun', label: 'Curiosidade' },
  ];
  const content = {
    what: comp.whatItDoes,
    query: `Linguagem: ${comp.queryLang}\n\nExemplo:\n${comp.querySample}`,
    real: comp.realWorld,
    fun: comp.trivia,
  };
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 24,
        minHeight: 280,
      }}
    >
      <div className='flex items-center gap-2 mb-1'>
        <GlowDot color={comp.color} size={10} />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: 22,
            color: comp.color,
          }}
        >
          {comp.name}
        </span>
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: `${comp.color}AA`,
          padding: '6px 12px',
          background: `${comp.color}10`,
          borderRadius: 8,
          marginBottom: 18,
          border: `1px solid ${comp.color}20`,
          display: 'inline-block',
        }}
      >
        💡 {comp.keyInsight}
      </div>

      <div className='flex gap-1 mb-4 flex-wrap'>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              background:
                section === s.id ? `${comp.color}20` : 'rgba(255,255,255,0.04)',
              color: section === s.id ? comp.color : 'rgba(255,255,255,0.4)',
              border: `1px solid ${section === s.id ? comp.color + '30' : 'transparent'}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        style={{
          fontFamily:
            section === 'query'
              ? "'JetBrains Mono', monospace"
              : "'Space Grotesk', sans-serif",
          fontSize: section === 'query' ? 13 : 14,
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
          background: section === 'query' ? 'rgba(0,0,0,0.3)' : 'transparent',
          padding: section === 'query' ? 16 : 0,
          borderRadius: 10,
        }}
      >
        {content[section]}
      </div>

      <div className='mt-5 flex items-center gap-2 flex-wrap'>
        <span
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          CONECTA COM →
        </span>
        {comp.connects.map(c => {
          const target = COMPONENTS.find(x => x.id === c);
          return (
            <span
              key={c}
              style={{
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 6,
                background: `${target.color}15`,
                color: target.color,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}
            >
              {target.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function FlowView() {
  const steps = [
    {
      emoji: '🖥️',
      label: 'Sua Aplicação',
      desc: 'Gera logs, métricas e traces via OpenTelemetry SDK',
      color: '#6EE7B7',
    },
    {
      emoji: '📡',
      label: 'OTel Collector',
      desc: 'Coleta, processa e roteia os dados para cada backend',
      color: '#93C5FD',
    },
    {
      emoji: '📜',
      label: 'Loki (Logs)',
      desc: 'Armazena logs indexando apenas labels',
      color: '#F97316',
    },
    {
      emoji: '🔗',
      label: 'Tempo (Traces)',
      desc: 'Armazena traces sem indexação, busca por Trace ID',
      color: '#3B82F6',
    },
    {
      emoji: '📈',
      label: 'Mimir (Métricas)',
      desc: 'Armazena séries temporais compatíveis com Prometheus',
      color: '#A855F7',
    },
    {
      emoji: '📊',
      label: 'Grafana',
      desc: 'Visualiza tudo em dashboards correlacionados + alertas',
      color: '#FACC15',
    },
  ];

  return (
    <div>
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 14,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 28,
          lineHeight: 1.7,
        }}
      >
        Acompanhe a jornada dos dados — de onde nascem até onde você os vê. Cada
        passo mostra como os sinais fluem pela stack.
      </p>
      <div className='relative'>
        {steps.map((step, i) => (
          <div
            key={i}
            className='flex items-start gap-4 mb-1'
            style={{ position: 'relative' }}
          >
            <div className='flex flex-col items-center' style={{ width: 40 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${step.color}15`,
                  border: `2px solid ${step.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {step.emoji}
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    width: 2,
                    height: 52,
                    background: `linear-gradient(180deg, ${step.color}40, ${steps[i + 1].color}40)`,
                  }}
                />
              )}
            </div>
            <div style={{ paddingTop: 4, paddingBottom: 28 }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  fontSize: 15,
                  color: step.color,
                  marginBottom: 4,
                }}
              >
                {i + 1}. {step.label}
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.55)',
                  lineHeight: 1.6,
                }}
              >
                {step.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          borderRadius: 14,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: '#6EE7B7',
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          🔄 O PODER DA CORRELAÇÃO
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.8,
          }}
        >
          O verdadeiro superpoder da LGTM Stack é a correlação entre sinais. No
          Grafana, você pode saltar de um alerta de métrica (Mimir) → para os
          logs daquele momento (Loki) → para o trace exato da requisição
          problemática (Tempo). Tudo conectado via labels e Trace IDs.
        </div>
      </div>
    </div>
  );
}

function QuizView() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const q = QUIZ_QUESTIONS[current];

  function handleAnswer(idx) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) setScore(s => s + 1);
    setAnswered(a => a + 1);
  }

  function next() {
    if (current < QUIZ_QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setAnswered(0);
    setShowResult(false);
  }

  if (showResult) {
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    const msg =
      pct === 100
        ? '🏆 Perfeito! Você domina a LGTM Stack!'
        : pct >= 66
          ? '🎯 Muito bem! Quase lá — revise os pontos que errou.'
          : "📚 Continue estudando! Explore a aba 'Explorar' e tente novamente.";
    return (
      <div className='text-center' style={{ paddingTop: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>
          {pct === 100 ? '🏆' : pct >= 66 ? '🎯' : '📚'}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 48,
            fontWeight: 800,
            background:
              'linear-gradient(135deg, #F97316, #FACC15, #3B82F6, #A855F7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}
        >
          {score}/{QUIZ_QUESTIONS.length}
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 16,
            color: 'rgba(255,255,255,0.6)',
            marginBottom: 32,
            maxWidth: 360,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {msg}
        </div>
        <button
          onClick={restart}
          style={{
            padding: '12px 32px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #F97316, #A855F7)',
            color: '#fff',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          PERGUNTA {current + 1}/{QUIZ_QUESTIONS.length}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: '#6EE7B7',
          }}
        >
          ACERTOS: {score}
        </span>
      </div>

      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 17,
          color: 'rgba(255,255,255,0.85)',
          lineHeight: 1.6,
          marginBottom: 24,
          fontWeight: 600,
        }}
      >
        {q.q}
      </div>

      <div className='grid gap-3'>
        {q.options.map((opt, i) => {
          let bg = 'rgba(255,255,255,0.03)';
          let border = 'rgba(255,255,255,0.08)';
          let textColor = 'rgba(255,255,255,0.6)';
          if (selected !== null) {
            if (i === q.correct) {
              bg = 'rgba(16,185,129,0.15)';
              border = '#10B981';
              textColor = '#6EE7B7';
            } else if (i === selected && i !== q.correct) {
              bg = 'rgba(239,68,68,0.15)';
              border = '#EF4444';
              textColor = '#FCA5A5';
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              style={{
                padding: '14px 18px',
                borderRadius: 12,
                background: bg,
                border: `1px solid ${border}`,
                color: textColor,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14,
                textAlign: 'left',
                cursor: selected === null ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontWeight: 700, marginRight: 10, opacity: 0.5 }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            background:
              selected === q.correct
                ? 'rgba(16,185,129,0.08)'
                : 'rgba(239,68,68,0.08)',
            border: `1px solid ${selected === q.correct ? '#10B98130' : '#EF444430'}`,
          }}
        >
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13,
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.7,
            }}
          >
            {selected === q.correct ? '✅ ' : '❌ '}
            {q.explanation}
          </div>
          <button
            onClick={next}
            style={{
              marginTop: 12,
              padding: '8px 24px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            {current < QUIZ_QUESTIONS.length - 1
              ? 'Próxima →'
              : 'Ver Resultado'}
          </button>
        </div>
      )}
    </div>
  );
}

function CheatSheet() {
  return (
    <div>
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13,
          color: 'rgba(255,255,255,0.45)',
          marginBottom: 20,
        }}
      >
        Referência rápida para consultar quando precisar. Cola de sobrevivência
        da LGTM Stack.
      </p>
      <div className='grid gap-4'>
        {COMPONENTS.map(c => (
          <div
            key={c.id}
            style={{
              padding: '16px 20px',
              borderRadius: 14,
              background: `${c.color}06`,
              border: `1px solid ${c.color}18`,
            }}
          >
            <div className='flex items-center justify-between mb-2 flex-wrap gap-2'>
              <div className='flex items-center gap-2'>
                <GlowDot color={c.color} />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: 15,
                    color: c.color,
                  }}
                >
                  {c.name}
                </span>
                <span style={{ fontSize: 12, opacity: 0.5 }}>
                  {c.pillarEmoji} {c.pillar}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: `${c.color}12`,
                  color: `${c.color}AA`,
                }}
              >
                {c.queryLang}
              </span>
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                background: 'rgba(0,0,0,0.25)',
                padding: '8px 12px',
                borderRadius: 8,
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {c.querySample}
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12,
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.6,
              }}
            >
              💡 {c.keyInsight}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 20,
          borderRadius: 14,
          background: 'rgba(110,231,183,0.04)',
          border: '1px solid rgba(110,231,183,0.12)',
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: '#6EE7B7',
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          🗺️ MAPA MENTAL
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 2,
            whiteSpace: 'pre',
          }}
        >
          {`  App → OTel Collector → ┬─ Loki   (Logs)
                          ├─ Tempo  (Traces)
                          └─ Mimir  (Métricas)
                               ↓
                           Grafana  (Visualiza tudo)`}
        </div>
      </div>
    </div>
  );
}

export default function LGTMExplorer() {
  const [activeTab, setActiveTab] = useState('explore');
  const [activeComp, setActiveComp] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        color: '#fff',
        fontFamily: "'Space Grotesk', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <link
        href='https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap'
        rel='stylesheet'
      />
      {/* Ambient background glow */}
      <div
        style={{
          position: 'fixed',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: -200,
          left: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: '32px 20px',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div className='text-center' style={{ marginBottom: 40 }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: 4,
              color: 'rgba(255,255,255,0.25)',
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            GUIA INTERATIVO DE OBSERVABILIDADE
          </div>
          <div className='flex items-center justify-center gap-3 flex-wrap'>
            {COMPONENTS.map((c, i) => (
              <span
                key={c.id}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 800,
                  fontSize: 36,
                  color: c.color,
                  textShadow: `0 0 30px ${c.color}30`,
                  lineHeight: 1,
                }}
              >
                {c.letter}
              </span>
            ))}
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 800,
                fontSize: 36,
                color: 'rgba(255,255,255,0.15)',
                lineHeight: 1,
              }}
            >
              Stack
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
              color: 'rgba(255,255,255,0.35)',
              marginTop: 8,
            }}
          >
            Loki · Grafana · Tempo · Mimir — Observabilidade descomplicada
          </div>
        </div>

        {/* Tabs */}
        <div
          className='flex gap-2 flex-wrap justify-center'
          style={{ marginBottom: 32 }}
        >
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                fontWeight: 600,
                background:
                  activeTab === t.id
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(255,255,255,0.02)',
                color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.35)',
                border: `1px solid ${activeTab === t.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'explore' && (
          <div
            className='grid gap-6'
            style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
          >
            <div
              className='grid gap-3'
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              }}
            >
              {COMPONENTS.map((c, i) => (
                <ComponentCard
                  key={c.id}
                  comp={c}
                  isActive={activeComp === i}
                  onClick={() => setActiveComp(i)}
                />
              ))}
            </div>
            <DetailPanel comp={COMPONENTS[activeComp]} />
          </div>
        )}

        {activeTab === 'flow' && <FlowView />}
        {activeTab === 'quiz' && <QuizView />}
        {activeTab === 'cheat' && <CheatSheet />}

        {/* Footer */}
        <div
          className='text-center'
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.04)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: 1,
          }}
        >
          LGTM = LOOKS GOOD TO ME 🚀
        </div>
      </div>
    </div>
  );
}
