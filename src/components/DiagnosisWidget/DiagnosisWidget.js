import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import './DiagnosisWidget.scss';
import MarkdownIt from 'markdown-it';
import { analyzeText } from '../../services/chatService';

const STORAGE_KEY = 'ai_diag_history_v1';

export default function DiagnosisWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // if old format was an array, take the first saved item
      if (Array.isArray(parsed)) return parsed[0] || null;
      // if parsed already looks like the stored item with a `content` property
      if (parsed && parsed.content !== undefined) return parsed;
      // otherwise wrap raw response into item shape (backwards-compatible)
      return {
        id: Date.now(),
        time: new Date().toISOString(),
        content: parsed,
      };
    } catch (e) {
      return null;
    }
  });
  // get app language from redux (fallback to 'vi')
  const reduxLang = useSelector((state) =>
    state.app && state.app.language ? state.app.language : 'vi'
  );
  const lang = reduxLang || 'en';

  const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

  const saveResult = (res) => {
    const item = {
      id: Date.now(),
      time: res && res.timestamp ? res.timestamp : new Date().toISOString(),
      content: res,
    };
    setResult(item);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(item));
    } catch (e) {}
  };

  const handleAnalyze = async () => {
    const text = input.trim();
    if (!text) return;
    setIsLoading(true);
    try {
      // Send a context instructing the backend to reply concisely in Vietnamese when appropriate
      const ctx = lang === 'vi' ? 'Hãy trả lời ngắn gọn bằng tiếng Việt.' : '';
      // if user provided extra context, append it (user context takes precedence)
      const finalContext = context ? `${context}\n${ctx}`.trim() : ctx;
      const res = await analyzeText({
        text,
        context: finalContext,
        language: lang,
      });
      saveResult(res);
      // after analysis, always clear inputs for a simple flow
      setInput('');
      setContext('');
    } catch (err) {
      console.error('Diag analyze error', err);
      alert('Không thể phân tích. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={`diagnosis-widget ${open ? 'open' : ''}`}>
      <div
        className="diag-toggle"
        onClick={() => setOpen((s) => !s)}
        title="Phân tích hồ sơ y tế"
      >
        <div className="icon">🩺</div>
      </div>

      <div className="diag-panel" role="dialog" aria-hidden={!open}>
        <div className="diag-header">
          <div className="title">Phân tích hồ sơ y tế</div>
          <div className="controls">
            <button className="close-btn" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
        </div>

        <div className="diag-body">
          <div className="diag-input">
            <textarea
              placeholder="Hồ sơ y tế, biểu hiện cơ thể..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <input
              className="diag-context"
              placeholder="Hoàn cảnh (Ví dụ: bệnh sử, tuổi, giới tính...)"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />

            <div className="diag-actions">
              <button
                className="analyze-btn"
                onClick={handleAnalyze}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? 'Đang...' : 'Phân tích'}
              </button>
            </div>
          </div>

          <div className="diag-history">
            {!result && <div className="empty">Chưa có phân tích nào. </div>}

            {result && (
              <div className="diag-card" key={result.id}>
                <div className="card-top">
                  <div className="card-time">
                    {new Date(result.time).toLocaleString()}
                  </div>
                </div>

                <div className="card-content">
                  {
                    // normalize content: some backends may return raw string or different shape
                    (() => {
                      const content =
                        result.content !== undefined ? result.content : null;
                      if (!content)
                        return (
                          <div className="empty">Không có nội dung trả về.</div>
                        );
                      if (typeof content === 'string') {
                        return (
                          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                            {content}
                          </pre>
                        );
                      }

                      return (
                        <>
                          {content.summary && (
                            <div
                              className="summary"
                              dangerouslySetInnerHTML={{
                                __html: md.render(content.summary || ''),
                              }}
                            />
                          )}
                          {Array.isArray(content.key_findings) &&
                            content.key_findings.length > 0 && (
                              <div className="section">
                                <strong>Phát hiện chính:</strong>
                                <div className="chips">
                                  {content.key_findings.map((kf, i) => (
                                    <div
                                      className="chip"
                                      key={i}
                                      dangerouslySetInnerHTML={{
                                        __html: md.renderInline(kf || ''),
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                          {Array.isArray(content.recommendations) &&
                            content.recommendations.length > 0 && (
                              <div className="section recommendations">
                                <strong>Khuyến nghị:</strong>
                                <ul>
                                  {content.recommendations.map((rec, i) => (
                                    <li
                                      key={i}
                                      dangerouslySetInnerHTML={{
                                        __html: md.renderInline(rec || ''),
                                      }}
                                    />
                                  ))}
                                </ul>
                              </div>
                            )}

                          {Array.isArray(content.next_steps) &&
                            content.next_steps.length > 0 && (
                              <div className="section next-steps">
                                <strong>Bước tiếp theo:</strong>
                                <ul>
                                  {content.next_steps.map((ns, i) => (
                                    <li
                                      key={i}
                                      dangerouslySetInnerHTML={{
                                        __html: md.renderInline(ns || ''),
                                      }}
                                    />
                                  ))}
                                </ul>
                              </div>
                            )}

                          {content.disclaimer && (
                            <div
                              className="disclaimer"
                              dangerouslySetInnerHTML={{
                                __html: md.renderInline(
                                  'Phân tích này chỉ mang tính chất tham khảo. Hãy luôn tham khảo ý kiến ​​chuyên gia y tế có trình độ. Hãy chắc chắn rằng bạn đến bệnh viện.'
                                ),
                              }}
                            />
                          )}
                        </>
                      );
                    })()
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
