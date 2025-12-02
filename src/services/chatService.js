import axios from 'axios';

const CHAT_API = 'http://localhost:8000/api/chat';
const ANALYZE_TEXT_API = 'http://localhost:8000/api/analyze-text';

export async function sendMessageToAI(body) {
  // body: { message: string, language: string }
  const resp = await axios.post(CHAT_API, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000,
  });
  // expecting { response, language, timestamp }
  return resp.data ? resp.data : resp;
}

// image analysis removed from frontend services; diagnosis uses text analysis only

export async function analyzeText(body) {
  // body: { text, context?, language }
  const resp = await axios.post(ANALYZE_TEXT_API, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000,
  });
  return resp.data ? resp.data : resp;
}
export default { sendMessageToAI };
