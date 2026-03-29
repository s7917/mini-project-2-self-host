import { useState, useRef, useEffect, useCallback } from 'react';

const SUGGESTIONS = {
  course_titles: {
    javascript: ['Mastering JavaScript: From Zero to Hero', 'Modern JavaScript ES6+ Complete Guide', 'JavaScript for Beginners: Build Real Projects'],
    python: ['Python Programming Masterclass', 'Python for Data Science & Machine Learning', 'Learn Python: Complete Beginner to Advanced'],
    react: ['React.js Complete Developer Course', 'Building Modern UIs with React & Hooks', 'React from Scratch: Projects & Best Practices'],
    css: ['CSS & Tailwind: Modern Web Design', 'Advanced CSS Animations & Layouts', 'CSS Mastery: Flexbox, Grid & Responsive Design'],
    node: ['Node.js Backend Development Bootcamp', 'REST APIs with Node.js & Express', 'Full Stack Node.js: Build & Deploy Apps'],
    sql: ['SQL for Beginners: Complete Database Guide', 'Advanced SQL & Database Design', 'MySQL Mastery: Queries to Optimization'],
    default: ['Complete Guide to {topic}', 'Mastering {topic}: Beginner to Advanced', '{topic} Fundamentals & Real-World Projects', 'Learn {topic} in 30 Days'],
  },
  quiz_questions: {
    javascript: [
      { prompt: 'What does `typeof null` return in JavaScript?', options: ['null', 'object', 'undefined', 'string'], answer: 'object' },
      { prompt: 'Which method removes the last element from an array?', options: ['shift()', 'pop()', 'splice()', 'slice()'], answer: 'pop()' },
      { prompt: 'What is a closure in JavaScript?', options: ['A loop construct', 'A function with access to its outer scope', 'An error handler', 'A class method'], answer: 'A function with access to its outer scope' },
    ],
    python: [
      { prompt: 'Which keyword is used to define a function in Python?', options: ['func', 'def', 'function', 'define'], answer: 'def' },
      { prompt: 'What data type is the result of: type([])?', options: ['array', 'tuple', 'list', 'dict'], answer: 'list' },
      { prompt: 'How do you start a comment in Python?', options: ['//', '#', '--', '/*'], answer: '#' },
    ],
    react: [
      { prompt: 'Which hook is used to manage state in a functional component?', options: ['useEffect', 'useRef', 'useState', 'useContext'], answer: 'useState' },
      { prompt: 'What does JSX stand for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extra'], answer: 'JavaScript XML' },
      { prompt: 'Which hook runs after every render by default?', options: ['useState', 'useCallback', 'useEffect', 'useMemo'], answer: 'useEffect' },
    ],
    default: [
      { prompt: 'What is the main purpose of {topic}?', options: ['To organize data', 'To build interfaces', 'To manage servers', 'To write scripts'], answer: 'To organize data' },
      { prompt: 'Which of the following is a key concept in {topic}?', options: ['Abstraction', 'Compilation', 'Rendering', 'Routing'], answer: 'Abstraction' },
      { prompt: 'What is a best practice when working with {topic}?', options: ['Write clean code', 'Avoid comments', 'Use global variables', 'Skip testing'], answer: 'Write clean code' },
    ],
  },
};

const getKey = (topic) => {
  const t = topic.toLowerCase();
  if (t.includes('javascript') || t.includes('js')) return 'javascript';
  if (t.includes('python')) return 'python';
  if (t.includes('react')) return 'react';
  if (t.includes('css') || t.includes('tailwind')) return 'css';
  if (t.includes('node')) return 'node';
  if (t.includes('sql') || t.includes('mysql') || t.includes('database')) return 'sql';
  return 'default';
};

const QUICK_PROMPTS = [
  'Suggest course titles for React',
  'Quiz questions for Python',
  'Course titles for JavaScript',
  'Quiz questions for SQL',
];

const INTRO = { from: 'bot', text: "Hi! I'm your **Instructor Assistant** 🎓\n\nI can help you:\n• Generate **course title ideas**\n• Create **quiz questions**\n\nTry one of the suggestions below or type your own!" };

function renderText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(99,102,241,0.12);padding:1px 5px;border-radius:4px;font-size:0.9em">$1</code>')
    .replace(/\n/g, '<br/>');
}

export default function InstructorHelpBot({ onUseTitles, onUseQuiz }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([INTRO]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [pos, setPos] = useState({ x: window.innerWidth - 440, y: window.innerHeight - 640 });

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const dragState = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, minimized]);

  // Drag logic
  const onMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('textarea') || e.target.closest('input')) return;
    e.preventDefault();
    dragState.current = {
      startX: e.clientX - pos.x,
      startY: e.clientY - pos.y,
    };

    const onMove = (e) => {
      if (!dragState.current) return;
      const newX = Math.max(0, Math.min(window.innerWidth - 420, e.clientX - dragState.current.startX));
      const newY = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragState.current.startY));
      setPos({ x: newX, y: newY });
    };

    const onUp = () => {
      dragState.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pos]);

  const addMsg = (from, text, extra) =>
    setMessages((prev) => [...prev, { from, text, extra }]);

  const processInput = (trimmed) => {
    if (!trimmed) return;
    addMsg('user', trimmed);
    setInput('');
    setTyping(true);
    const lower = trimmed.toLowerCase();
    const key = getKey(trimmed);

    setTimeout(() => {
      setTyping(false);
      if (lower.includes('title') || lower.includes('course') || lower.includes('heading') || lower.includes('name')) {
        const topic = trimmed.replace(/title|course|heading|name|suggest|give|me|for|a|an|the/gi, '').trim() || trimmed;
        const titles = SUGGESTIONS.course_titles[key] || SUGGESTIONS.course_titles.default.map((t) => t.replace('{topic}', topic));
        addMsg('bot', `Here are **course title ideas** for *${topic}*:`, { type: 'titles', titles });
      } else if (lower.includes('quiz') || lower.includes('question') || lower.includes('mcq')) {
        const topic = trimmed.replace(/quiz|question|mcq|suggest|give|me|for|a|an|the|create|make/gi, '').trim() || trimmed;
        const questions = (SUGGESTIONS.quiz_questions[key] || SUGGESTIONS.quiz_questions.default).map((q) => ({
          ...q,
          prompt: q.prompt.replace('{topic}', topic),
          options: q.options.map((o) => o.replace('{topic}', topic)),
        }));
        addMsg('bot', `Here are **quiz questions** for *${topic}*:`, { type: 'quiz', questions });
      } else {
        addMsg('bot', `I can help with **course titles** or **quiz questions**.\n\nTry:\n• *"Suggest course titles for React"*\n• *"Give me quiz questions for Python"*`);
      }
    }, 800);
  };

  const handleSend = () => processInput(input.trim());

  if (!open) {
    return (
      <button className="hb-fab" onClick={() => { setOpen(true); setMinimized(false); }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>Help</span>
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      className={`hb-panel ${minimized ? 'hb-panel-minimized' : ''}`}
      style={{ left: pos.x, top: pos.y, bottom: 'auto', right: 'auto' }}
    >
      {/* Header — drag handle */}
      <div className="hb-header" onMouseDown={onMouseDown} style={{ cursor: 'grab' }}>
        <div className="hb-header-left">
          <div className="hb-avatar-bot">AI</div>
          <div>
            <div className="hb-header-title">Instructor Assistant</div>
            {!minimized && <div className="hb-header-sub">● Online</div>}
          </div>
        </div>
        <div className="hb-header-actions">
          {/* Minimize */}
          <button className="hb-icon-btn" title="Minimize" onClick={() => setMinimized((m) => !m)}>
            {minimized
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            }
          </button>
          {/* Close */}
          <button className="hb-icon-btn" title="Close" onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="hb-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`hb-row hb-row-${msg.from}`}>
                {msg.from === 'bot' && <div className="hb-avatar-bot hb-avatar-sm">AI</div>}
                <div className="hb-msg-wrap">
                  <div className={`hb-bubble hb-bubble-${msg.from}`}
                    dangerouslySetInnerHTML={{ __html: renderText(msg.text) }}
                  />
                  {msg.extra?.type === 'titles' && (
                    <div className="hb-cards">
                      {msg.extra.titles.map((title, ti) => (
                        <div key={ti} className="hb-card">
                          <span>{title}</span>
                          <button className="hb-use-btn" onClick={() => onUseTitles?.(title)}>Use ↗</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.extra?.type === 'quiz' && (
                    <div className="hb-cards">
                      {msg.extra.questions.map((q, qi) => (
                        <div key={qi} className="hb-card">
                          <div className="hb-card-q">
                            <span className="hb-q-num">Q{qi + 1}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{q.prompt}</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {q.options.filter(Boolean).map((opt, oi) => (
                                  <span key={oi} style={{
                                    fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px',
                                    background: opt === q.answer ? 'rgba(16,163,127,0.15)' : 'var(--bg-elevated)',
                                    border: `1px solid ${opt === q.answer ? '#10a37f' : 'var(--border-subtle)'}`,
                                    color: opt === q.answer ? '#10a37f' : 'var(--text-secondary)',
                                    fontWeight: opt === q.answer ? 700 : 400
                                  }}>{opt === q.answer ? '✓ ' : ''}{opt}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button className="hb-use-btn" onClick={() => onUseQuiz?.(q)}>Use ↗</button>
                        </div>
                      ))}
                      <button className="hb-use-all-btn" onClick={() => msg.extra.questions.forEach((q) => onUseQuiz?.(q))}>
                        ✦ Use All Questions
                      </button>
                    </div>
                  )}
                </div>
                {msg.from === 'user' && <div className="hb-avatar-user">You</div>}
              </div>
            ))}
            {typing && (
              <div className="hb-row hb-row-bot">
                <div className="hb-avatar-bot hb-avatar-sm">AI</div>
                <div className="hb-bubble hb-bubble-bot hb-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 2 && (
            <div className="hb-quick-prompts">
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} className="hb-quick-btn" onClick={() => processInput(p)}>{p}</button>
              ))}
            </div>
          )}

          <div className="hb-input-row">
            <textarea
              ref={inputRef}
              className="hb-input"
              placeholder="Ask me anything..."
              value={input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
            />
            <button className={`hb-send ${input.trim() ? 'hb-send-active' : ''}`} onClick={handleSend} disabled={!input.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
