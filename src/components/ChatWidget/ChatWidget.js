import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import './ChatWidget.scss';
import MarkdownIt from 'markdown-it';
import { sendMessageToAI } from '../../services/chatService';

const STORAGE_KEY = 'ai_chat_history_v1';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      // backward compatibility: if a single saved item was written, wrap into array
      if (parsed && typeof parsed === 'object') return [parsed];
      return [];
    } catch (e) {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const reduxLang = useSelector((state) =>
    state.app && state.app.language ? state.app.language : 'vi'
  );
  const [language, setLanguage] = useState(reduxLang || 'en');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [supportsSpeech, setSupportsSpeech] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const listRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Configuration to avoid sending >1000 characters per API request
  const MAX_REQUEST_CHARS = 1000; // API limit per request
  const CONTEXT_MESSAGES = 6; // how many previous msgs to consider (will be truncated as needed)
  const PER_MSG_PREVIEW = 300; // max chars to include per message when adding context
  const STORE_AI_MAX = 2000; // cap how much of AI responses we store in localStorage

  const buildPromptWithLimit = (
    instruction,
    userText,
    previousMsgs = [],
    maxChars = MAX_REQUEST_CHARS,
    perMsgPreview = PER_MSG_PREVIEW
  ) => {
    const safeInstr = instruction || '';
    const userLabel = `User: `;
    // ensure user text exists
    let safeUser = (userText || '').replace(/\s+/g, ' ').trim();

    // Start with instruction
    let prompt = safeInstr ? safeInstr + '\n\n' : '';

    // We'll attempt to add a Context section built from previousMsgs (oldest->newest)
    if (previousMsgs && previousMsgs.length) {
      prompt += 'Context:\n';
      for (let i = 0; i < previousMsgs.length; i++) {
        const m = previousMsgs[i];
        if (!m || !m.text) continue;
        const who = m.from === 'ai' ? 'AI: ' : 'User: ';
        // take small preview of the message to keep size low
        const preview =
          m.text.length > perMsgPreview
            ? m.text.slice(0, perMsgPreview) + '...'
            : m.text;
        const line = `${who}${preview}\n`;
        // if adding this line plus the eventual user line would overflow, stop adding more context
        if (
          prompt.length + line.length + userLabel.length + safeUser.length >
          maxChars
        ) {
          // try to add a shortened placeholder for remaining context if there is space
          const remaining =
            maxChars - (prompt.length + userLabel.length + safeUser.length) - 3;
          if (remaining > 10) {
            prompt += '...\n';
          }
          break;
        }
        prompt += line;
      }
      prompt += '\n';
    }

    // Append the user's message
    // If still too long, truncate the user's message to fit the maxChars
    if (prompt.length + userLabel.length + safeUser.length > maxChars) {
      const allowed = Math.max(
        20,
        maxChars - prompt.length - userLabel.length - 3
      );
      safeUser = safeUser.slice(0, allowed) + '...';
    }
    prompt += `${userLabel}${safeUser}`;

    // Final safety: if still longer, hard-truncate the whole prompt
    if (prompt.length > maxChars) {
      prompt = prompt.slice(0, maxChars - 3) + '...';
    }

    return prompt;
  };

  useEffect(() => {
    // Initialize SpeechRecognition if available
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        recognitionRef.current = rec;
        setSupportsSpeech(true);
      } catch (e) {
        setSupportsSpeech(false);
      }
    } else {
      setSupportsSpeech(false);
    }
    // cleanup when unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
        } catch (e) {}
      }
    };
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle click outside to close chat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open]);

  const startRecording = () => {
    const rec = recognitionRef.current;
    if (!rec)
      return alert('Trình duyệt không hỗ trợ microphone (SpeechRecognition).');
    rec.lang = language === 'vi' ? 'vi-VN' : 'en-US';
    rec.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('')
        .trim();
      if (transcript) {
        // append transcript to input for user to edit/send
        setInput((cur) => (cur ? cur + ' ' + transcript : transcript));
      }
    };
    rec.onend = () => {
      setIsRecording(false);
    };
    rec.onerror = (e) => {
      console.error('SpeechRecognition error', e);
      setIsRecording(false);
    };
    try {
      rec.start();
      setIsRecording(true);
    } catch (e) {
      console.error('startRecording error', e);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch (e) {}
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (!supportsSpeech)
      return alert('Speech API không khả dụng trên trình duyệt này.');
    if (isRecording) stopRecording();
    else startRecording();
  };

  const speakText = (text, lang) => {
    if (!text) return;
    if (!window.speechSynthesis)
      return alert('SpeechSynthesis không được hỗ trợ trên trình duyệt này.');
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
      utt.rate = 1;
      utt.pitch = 1;
      window.speechSynthesis.speak(utt);
    } catch (e) {
      console.error('speakText error', e);
    }
  };
  // Use markdown-it to render Markdown safely (no raw HTML)
  const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
  // effect: Store a truncated copy of messages to avoid very large localStorage entries
  useEffect(() => {
    try {
      const msgArray = Array.isArray(messages)
        ? messages
        : messages
        ? [messages]
        : [];
      const toStore = msgArray.map((m) => {
        if (m && m.from === 'ai' && m.text) {
          return {
            ...m,
            text:
              m.text.length > STORE_AI_MAX
                ? m.text.slice(0, STORE_AI_MAX) + '\n\n[Truncated]'
                : m.text,
          };
        }
        return m;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      // fallback
      try {
        const safe = Array.isArray(messages)
          ? messages
          : messages
          ? [messages]
          : [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
      } catch (err) {
        // ignore storage errors
      }
    }
    // update unread count when new message from AI arrives and widget closed
    const last = messages[messages.length - 1];
    if (last && last.from === 'ai' && !open) {
      setUnread((n) => n + 1);
    }
    // scroll to bottom
    scrollToBottom();
  }, [messages, open]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const scrollToBottom = () => {
    const el = listRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      if (!el) return;
      try {
        el.scrollTop = el.scrollHeight;
      } catch (e) {
        // ignore if element was removed between frames
      }
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = {
      id: Date.now() + '_u',
      from: 'user',
      text,
      time: new Date().toISOString(),
      language,
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Build a safe prompt (never exceed MAX_REQUEST_CHARS)
      const recentMsgs = messages
        .filter((m) => m && m.text)
        .slice(-CONTEXT_MESSAGES); // oldest->newest order kept

      let instruction = '';
      if (language === 'vi') {
        instruction = 'trả lời bằng tiếng Việt, ngắn gọn, súc tích';
      } else {
        instruction = 'Answer concisely and to the point';
      }

      const prompt = buildPromptWithLimit(
        instruction,
        text,
        recentMsgs,
        MAX_REQUEST_CHARS,
        PER_MSG_PREVIEW
      );
      if (prompt.length >= MAX_REQUEST_CHARS) {
        console.warn('Prompt length reached maximum limit and was truncated.');
      }

      const res = await sendMessageToAI({ message: prompt, language });
      // emulate streaming by revealing characters progressively
      const aiText = res.response || '...';
      const aiMsg = {
        id: Date.now() + '_ai',
        from: 'ai',
        text: '',
        time: res.timestamp || new Date().toISOString(),
        language: res.language || language,
      };
      setMessages((m) => [...m, aiMsg]);

      // progressively reveal
      for (let i = 0; i <= aiText.length; i++) {
        await new Promise((r) => setTimeout(r, 12));
        setMessages((cur) => {
          const copy = cur.slice();
          const lastIdx = copy.findIndex((x) => x.id === aiMsg.id);
          if (lastIdx >= 0) {
            copy[lastIdx] = { ...copy[lastIdx], text: aiText.slice(0, i) };
          }
          return copy;
        });
      }
    } catch (err) {
      const errMsg = {
        id: Date.now() + '_ai_err',
        from: 'ai',
        text: 'Xin lỗi, có lỗi khi gọi API.',
        time: new Date().toISOString(),
        language,
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    if (reduxLang && reduxLang !== language) {
      setLanguage(reduxLang);
    }
  }, [reduxLang]);

  return (
    <div className={`chat-widget ${open ? 'open' : ''}`} ref={chatContainerRef}>
      <div
        className="chat-toggle"
        onClick={() => setOpen((s) => !s)}
        title="Chat với AI"
      >
        <div className="chat-toggle-content">
          <img
            src="https://cdn.bookingcare.vn/fo/w128/2024/03/27/151956-chatboticon.png"
            alt="Chat AI"
            className="chat-icon-img"
          />
          <div className="chat-toggle-text">Trợ lý AI</div>
        </div>
        {unread > 0 && <div className="unread">{unread}</div>}
      </div>

      <div className="chat-panel" role="dialog" aria-hidden={!open}>
        <div className="chat-header">
          <div className="title">Chat với AI</div>
          <div className="controls">
            {/* attachment removed from chat widget - use Diagnosis widget for analysis uploads */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="lang-select"
            >
              <option value="en">EN</option>
              <option value="vi">VI</option>
            </select>
            <button
              className="clear-btn"
              onClick={clearHistory}
              title="Xóa lịch sử"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
            <button className="close-btn" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
        </div>

        <div className="chat-body" ref={listRef}>
          {messages.length === 0 && (
            <div className="empty">
              <div>
                Chào bạn! Bạn có thể hỏi về đặt lịch khám, bác sĩ, và dịch vụ.
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`msg ${m.from === 'ai' ? 'ai' : 'user'}`}
            >
              <div className="bubble">
                <div
                  className="bubble-html"
                  dangerouslySetInnerHTML={{
                    __html: md.render(m.text || ''),
                  }}
                />
                {m.from === 'ai' && (
                  <button
                    className="play-btn"
                    onClick={() => speakText(m.text, m.language || language)}
                    title="Phát âm"
                  >
                    🔊
                  </button>
                )}
              </div>
              <div className="time">
                {new Date(m.time).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="msg ai typing">
              <div className="bubble">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <textarea
            placeholder="Gõ tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {/* mic placed next to send button for quick voice input */}
          <button
            className={`voice-btn input-voice ${
              isRecording ? 'recording' : ''
            }`}
            onClick={toggleRecording}
            title={isRecording ? 'Dừng ghi âm' : 'Ghi âm (nói)'}
          >
            {isRecording ? '●' : '🎤'}
          </button>
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            title="Gửi"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
