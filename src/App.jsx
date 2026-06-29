/* cSpell:words Redrob maincat Supabase Vercel DeepMind */
import { useEffect, useRef, useState } from "react";
import "./App.css";
import catVideo from "/maincat.webm";

const QUICK_ACTIONS = [
  {
    id: "jobs",
    title: "Find Jobs",
    label: "AI internships",
    prompt: "Find AI internships for me",
    tool: "Job Search",
  },
  {
    id: "resume",
    title: "Rank Resume",
    label: "Why low score?",
    prompt: "Why is my resume score low?",
    tool: "Resume Ranker",
  },
  {
    id: "companies",
    title: "Explore Companies",
    label: "Startups hiring",
    prompt: "Find startups hiring backend engineers",
    tool: "Company Search",
  },
  {
    id: "people",
    title: "Find People",
    label: "Hiring managers",
    prompt: "Find hiring managers in AI companies",
    tool: "People Search",
  },
];

const STARTER_MESSAGES = [
  "I can search jobs, companies, people, or rank your resume.",
  "Tell me your goal naturally. I will pick the right Redrob capability.",
  "Try: Find AI internships, or Why is my resume score low?",
];

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function detectIntent(text) {
  const value = text.toLowerCase();

  if (/\b(resume|cv|ats|score|rank|profile)\b/.test(value)) {
    return {
      tool: "Resume Ranker",
      mood: "focused",
      response:
        "I would use Resume Ranker for this. Your score usually drops because of weak role keywords, missing impact numbers, or unclear project outcomes. I can help rewrite the weakest bullets.",
    };
  }

  if (/\b(company|companies|startup|startups|employer|firm|culture)\b/.test(value)) {
    return {
      tool: "Company Search",
      mood: "curious",
      response:
        "I would use Company Search here. I found a good direction: filter for fast-growing teams, active hiring signals, and roles matching your target domain.",
    };
  }

  if (/\b(people|person|manager|recruiter|founder|connect|network|referral)\b/.test(value)) {
    return {
      tool: "People Search",
      mood: "social",
      response:
        "This belongs to People Search. I would look for recruiters, hiring managers, and warm connections connected to the role you want.",
    };
  }

  if (/\b(job|jobs|intern|internship|role|roles|hiring|opening|career)\b/.test(value)) {
    return {
      tool: "Job Search",
      mood: "excited",
      response:
        "I would use Job Search for this. I found matching opportunities and would rank them by fit, freshness, location, and required skills.",
    };
  }

  if (/\b(hi|hello|hey|start|help)\b/.test(value)) {
    return {
      tool: "Redrob AI",
      mood: "happy",
      response:
        "Hey, I am your Redrob companion. Tell me what you want: jobs, companies, people, or resume help. I will choose the right Redrob tool.",
    };
  }

  return {
    tool: "Redrob AI Router",
    mood: "thinking",
    response:
      "I understand the goal. I would first classify your request, then route it to the best Redrob capability and return the most useful next step.",
  };
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}

function TypingDots() {
  return (
    <div className="message message--ai">
      <div className="message__bubble message__bubble--typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      text: "Hi, I am Redrob Companion. Tell me your goal and I will choose the right Redrob capability.",
      tool: "Redrob AI",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [mood, setMood] = useState("idle");
  const [nudgeText, setNudgeText] = useState(pick(STARTER_MESSAGES));
  const [catPosition, setCatPosition] = useState({ x: 28, y: 24 });

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;

    const interval = setInterval(() => {
      setNudgeText(pick(STARTER_MESSAGES));
      setMood("curious");

      setTimeout(() => {
        setMood("idle");
      }, 1600);
    }, 9000);

    return () => clearInterval(interval);
  }, [isOpen]);

  function openPanel() {
    setIsOpen(true);
    setMood("happy");
  }

  function closePanel() {
    setIsOpen(false);
    setMood("idle");
  }

  function togglePanel() {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const intent = detectIntent(trimmed);
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setMood("thinking");

    window.setTimeout(() => {
      const aiMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        text: intent.response,
        tool: intent.tool,
      };

      setMessages((current) => [...current, aiMessage]);
      setIsTyping(false);
      setMood(intent.mood);

      window.setTimeout(() => {
        setMood("idle");
      }, 1800);
    }, 750);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(inputValue);
    }
  }

  function handleQuickAction(action) {
    openPanel();
    sendMessage(action.prompt);
  }

  function clearChat() {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "ai",
        text: "Fresh start. Tell me what you want to do inside Redrob.",
        tool: "Redrob AI",
      },
    ]);
    setMood("happy");
  }

  function startDrag(event) {
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: catPosition.x,
      originY: catPosition.y,
      moved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    const drag = dragRef.current;
    if (!drag) return;

    const deltaX = drag.startX - event.clientX;
    const deltaY = drag.startY - event.clientY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      drag.moved = true;
    }

    setCatPosition({
      x: Math.max(12, Math.min(window.innerWidth - 96, drag.originX + deltaX)),
      y: Math.max(12, Math.min(window.innerHeight - 110, drag.originY + deltaY)),
    });
  }

  function endDrag(event) {
    const drag = dragRef.current;
    dragRef.current = null;

    if (!drag?.moved) {
      togglePanel();
    }

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
  }

  const latestTool = [...messages].reverse().find((message) => message.tool)?.tool || "Redrob AI";

  return (
    <main className="app-shell">
      <section className="ambient-copy" aria-hidden="true">
        <p>Redrob Companion AI</p>
        <h1>Ask naturally. Let the companion route the work.</h1>
      </section>

      {isOpen && (
        <section className="companion-panel" aria-label="Redrob Companion AI">
          <div className="panel-header">
            <div className="panel-avatar">
              <video src={catVideo} autoPlay loop muted playsInline />
            </div>

            <div className="panel-title">
              <p>Redrob Companion</p>
              <span>
                <i /> Online
              </span>
            </div>

            <button className="ghost-btn" onClick={clearChat} type="button">
              Reset
            </button>

            <button className="close-btn" onClick={closePanel} type="button" aria-label="Close">
              x
            </button>
          </div>

          <div className="route-card">
            <span>Current route</span>
            <strong>{latestTool}</strong>
          </div>

          <div className="panel-body">
            <div className="messages">
              {messages.map((message) => (
                <div key={message.id} className={`message message--${message.role}`}>
                  <div className="message__bubble">
                    {message.tool && <span className="tool-pill">{message.tool}</span>}
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && <TypingDots />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="quick-grid">
            {QUICK_ACTIONS.map((action) => (
              <button key={action.id} type="button" onClick={() => handleQuickAction(action)}>
                <span>{action.title}</span>
                <small>{action.label}</small>
              </button>
            ))}
          </div>

          <div className="input-row">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Redrob AI..."
              rows={1}
            />

            <button
              className="send-btn"
              type="button"
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
        </section>
      )}

      <div
        className={`cat-zone cat-zone--${mood} ${isOpen ? "cat-zone--open" : ""}`}
        style={{
          right: `${catPosition.x}px`,
          bottom: `${catPosition.y}px`,
        }}
      >
        {!isOpen && <div className="cat-nudge">{nudgeText}</div>}

        <button
          className="cat-button"
          type="button"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          aria-label={isOpen ? "Close Redrob Companion" : "Open Redrob Companion"}
        >
          <span className="cat-glow" />
          <video className="cat-video" src={catVideo} autoPlay loop muted playsInline />
        </button>

        <span className="cat-label">Redrob AI</span>
      </div>
    </main>
  );
}