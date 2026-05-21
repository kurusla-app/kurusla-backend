import { Request, Response } from 'express';
import { z } from 'zod';
import {
  sendChatMessage,
  CHAT_LIMITS,
  type ChatMessage,
} from '../../services/chat.service';
import { getAuthenticatedUserId, handleAuthError } from '../../utils/authUser';

const ChatRoleSchema = z.enum(['user', 'assistant', 'system']);

const ChatMessageSchema = z.object({
  role: ChatRoleSchema,
  content: z
    .string()
    .min(1)
    .max(CHAT_LIMITS.maxContentLength),
});

const ChatBodySchema = z
  .object({
    message: z.string().min(1).max(CHAT_LIMITS.maxContentLength).optional(),
    messages: z.array(ChatMessageSchema).min(1).max(CHAT_LIMITS.maxMessages).optional(),
  })
  .refine((data) => Boolean(data.message?.trim() || data.messages?.length), {
    message: 'message veya messages alanı zorunludur.',
  });

function resolveMessages(body: z.infer<typeof ChatBodySchema>): ChatMessage[] {
  if (body.messages?.length) {
    return body.messages;
  }
  return [{ role: 'user', content: body.message!.trim() }];
}

/**
 * AI sohbet — mobil uygulama tek mesaj veya konuşma geçmişi gönderebilir.
 */
export async function postChat(req: Request, res: Response): Promise<void> {
  try {
    const userId = getAuthenticatedUserId(req);
    const parsed = ChatBodySchema.parse(req.body);
    const messages = resolveMessages(parsed);

    const result = await sendChatMessage(userId, messages);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    if (handleAuthError(res, error)) return;

    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Geçersiz istek',
        details: error.issues,
      });
      return;
    }

    const statusCode =
      error instanceof Error &&
      'statusCode' in error &&
      typeof (error as Error & { statusCode?: number }).statusCode === 'number'
        ? (error as Error & { statusCode: number }).statusCode
        : 500;

    const message =
      error instanceof Error ? error.message : 'Sohbet işlenirken hata oluştu.';

    if (statusCode >= 500) {
      console.error('[Chat]', message);
    }

    res.status(statusCode).json({ error: message });
  }
}
