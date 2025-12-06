import axios from 'axios';
import Axios from '../axios';
const CHAT_API = 'http://localhost:8000/api/chat';
const ANALYZE_TEXT_API = 'http://localhost:8000/api/analyze-text';

const sendMessageToAI = async function (body) {
  // body: { message: string, language: string }
  const resp = await axios.post(CHAT_API, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000,
  });
  // expecting { response, language, timestamp }
  return resp.data ? resp.data : resp;
};

// image analysis removed from frontend services; diagnosis uses text analysis only

const analyzeText = async function (body) {
  // body: { text, context?, language }
  const resp = await axios.post(ANALYZE_TEXT_API, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000,
  });
  return resp.data ? resp.data : resp;
};

const sendChatBooking = (data) => {
  return Axios.post('/api/chat-booking', data);
};
export { sendMessageToAI, sendChatBooking, analyzeText };
