import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import './BookingChat.scss';
import MarkdownIt from 'markdown-it';
import { sendChatBooking } from '../../services/chatService';

const STORAGE_KEY = 'ai_chat_history_v2';

const BookingChat = () => {
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
  const recognitionRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const listRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {

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
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
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
      // Lấy 3-4 tin nhắn user trước đó + message hiện tại
      const userMessages = messages
        .filter((m) => m.from === 'user')
        .slice(-4)
        .map((m) => m.text);
      
      // Ghép tất cả thành 1 string với label
      let fullMessage = text;
      if (userMessages.length > 0) {
        fullMessage = `Câu hỏi trước đó: ${userMessages.join(' | ')}\n\nCâu hỏi hiện tại: ${text}`;
      }
      
      const res = await sendChatBooking({ message: fullMessage, language });
      // emulate streaming by revealing characters progressively
      const aiText = res.reply || 'Hệ thống đang bận, vui lòng thử lại sau.';
      const aiMsg = {
        id: Date.now() + '_ai',
        from: 'ai',
        text: '',
        time: res.timestamp || new Date().toISOString(),
        language: res.language || language,
      };
      setMessages((m) => [...m, aiMsg]);

      // progressively reveal
      for (let i = 0; i <= aiText.length; i+=2) {
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
    <div className={`booking-chat ${open ? 'open' : ''}`} ref={chatContainerRef}>
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

export default BookingChat;
