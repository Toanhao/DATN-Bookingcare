import axios from 'axios';

const CHAT_API = 'http://localhost:8000/api/chat';

export async function sendMessageToAI(body) {
  // body: { message: string, language: string }
  const resp = await axios.post(CHAT_API, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000,
  });
  // expecting { response, language, timestamp }
  return resp.data ? resp.data : resp;
}

export default { sendMessageToAI };
