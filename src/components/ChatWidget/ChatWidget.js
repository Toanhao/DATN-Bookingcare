import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import './ChatWidget.scss';
import { sendMessageToAI } from '../../services/chatService';

const STORAGE_KEY = 'ai_chat_history_v1';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const reduxLang = useSelector((state) =>
    state.app && state.app.language ? state.app.language : 'vi'
  );
  const [language, setLanguage] = useState(reduxLang || 'en');
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    // update unread count when new message from AI arrives and widget closed
    const last = messages[messages.length - 1];
    if (last && last.from === 'ai' && !open) {
      setUnread((n) => n + 1);
    }
    // scroll to bottom
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const scrollToBottom = () => {
    if (listRef.current) {
      requestAnimationFrame(() => {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      });
    }
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
      // Build conversational context from recent messages so backend can answer cohesively
      const CONTEXT_MESSAGES = 8; // how many previous msgs to include
      const recent = messages
        .filter((m) => m && m.text)
        .slice(-CONTEXT_MESSAGES)
        .map((m) => (m.from === 'ai' ? `AI: ${m.text}` : `User: ${m.text}`))
        .join('\n');

      let prompt = '';
      if (recent) {
        prompt += `Context:\n${recent}\n\n`;
      }
      prompt += `User: ${text}`;

      // If app language is Vietnamese, append an instruction so backend replies in Vietnamese briefly and to-the-point
      let instruction = '';
      if (language === 'vi') {
        instruction =
          'Bạn là chatbot y tế, trả lời bằng tiếng Việt, ngắn gọn, súc tích, không dài dòng.\n\n';
      } else {
        instruction =
          'You are a health assistant chatbot, answer concisely and to the point, not long-winded.\n\n';
      }

      // nối instruction lên đầu prompt
      prompt = instruction + prompt;

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

  // sync with redux language changes
  useEffect(() => {
    if (reduxLang && reduxLang !== language) {
      setLanguage(reduxLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxLang]);

  return (
    <div className={`chat-widget ${open ? 'open' : ''}`}>
      <div
        className="chat-toggle"
        onClick={() => setOpen((s) => !s)}
        title="Chat với AI"
      >
        <div className="chat-icon">💬</div>
        {unread > 0 && <div className="unread">{unread}</div>}
      </div>

      <div className="chat-panel" role="dialog" aria-hidden={!open}>
        <div className="chat-header">
          <div className="title">Trợ lý ảo</div>
          <div className="controls">
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
              🗑
            </button>
            <button className="close-btn" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
        </div>

        <div className="chat-body" ref={listRef}>
          {messages.length === 0 && (
            <div className="empty">
              Chào bạn! Bạn có thể hỏi về đặt lịch khám, bác sĩ, và dịch vụ.
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`msg ${m.from === 'ai' ? 'ai' : 'user'}`}
            >
              <div className="bubble">{m.text}</div>
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
