import axios from 'axios';
import prisma from '../config/db';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatResult {
  reply: string;
  conversationId?: string;
  simulated?: boolean;
}

const DEFAULT_MAX_MESSAGES = 20;
const DEFAULT_MAX_CONTENT = 4000;
const DEFAULT_TIMEOUT_MS = 30_000;

function getAiServiceUrl(): string {
  return (process.env.AI_SERVICE_URL || 'http://localhost:8001').replace(/\/$/, '');
}

/** Yerel geliştirme: Python AI servisi yokken mock yanıt */
export function isChatSimulationMode(): boolean {
  if (process.env.CHAT_SIMULATE === 'true') return true;
  const url = getAiServiceUrl();
  return (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('0.0.0.0')
  );
}

function buildSimulationReply(messages: ChatMessage[]): ChatResult {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const preview = lastUser?.content?.slice(0, 80) ?? '';

  return {
    reply:
      `Merhaba! Kurusla AI asistanı şu an simülasyon modunda çalışıyor. ` +
      `Birikimlerin, yuvarlama adımın ve rozetlerin hakkında sorular sorabilirsin. ` +
      (preview ? `Son mesajın: "${preview}${preview.length >= 80 ? '…' : ''}"` : ''),
    simulated: true,
  };
}

async function logChat(
  userId: number,
  parameters: Record<string, unknown>,
  response: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.aILog.create({
      data: {
        userId,
        toolName: 'CHAT',
        parameters,
        response,
      },
    });
  } catch (err) {
    console.error('[Chat] AILog yazılamadı:', err);
  }
}

function truncateForLog(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((m) => ({
    role: m.role,
    content:
      m.content.length > 200 ? `${m.content.slice(0, 200)}…` : m.content,
  }));
}

function normalizeAiResponse(data: unknown): ChatResult {
  if (!data || typeof data !== 'object') {
    throw new Error('AI servisi geçersiz yanıt döndü.');
  }
  const d = data as Record<string, unknown>;
  const reply =
    (typeof d.reply === 'string' && d.reply) ||
    (typeof d.message === 'string' && d.message) ||
    (typeof d.content === 'string' && d.content) ||
    '';

  if (!reply.trim()) {
    throw new Error('AI servisi boş yanıt döndü.');
  }

  return {
    reply: reply.trim(),
    conversationId:
      typeof d.conversationId === 'string' ? d.conversationId : undefined,
  };
}

/**
 * Mobil uygulama → Python FastAPI AI servisi köprüsü.
 * Finansal yan etki yok; kritik işlemler /api/ai/execute-action üzerinden kalır.
 */
export async function sendChatMessage(
  userId: number,
  messages: ChatMessage[]
): Promise<ChatResult> {
  const logParams = {
    messageCount: messages.length,
    messages: truncateForLog(messages),
  };

  if (isChatSimulationMode()) {
    const result = buildSimulationReply(messages);
    await logChat(userId, logParams, {
      ...result,
      mode: 'simulation',
    });
    return result;
  }

  const aiServiceUrl = getAiServiceUrl();
  const timeout = Number(process.env.CHAT_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  try {
    const response = await axios.post(
      `${aiServiceUrl}/chat`,
      { userId, messages },
      { timeout, headers: { 'Content-Type': 'application/json' } }
    );

    const result = normalizeAiResponse(response.data);
    await logChat(userId, logParams, {
      replyLength: result.reply.length,
      conversationId: result.conversationId ?? null,
    });
    return result;
  } catch (error: unknown) {
    const message =
      axios.isAxiosError(error) && error.code === 'ECONNABORTED'
        ? 'AI servisi zaman aşımına uğradı.'
        : 'AI servisine şu an ulaşılamıyor.';

    await logChat(userId, logParams, { error: message });

    const err = new Error(message);
    (err as Error & { statusCode?: number }).statusCode = 503;
    throw err;
  }
}

export const CHAT_LIMITS = {
  maxMessages: Number(process.env.CHAT_MAX_MESSAGES) || DEFAULT_MAX_MESSAGES,
  maxContentLength:
    Number(process.env.CHAT_MAX_CONTENT_LENGTH) || DEFAULT_MAX_CONTENT,
};
