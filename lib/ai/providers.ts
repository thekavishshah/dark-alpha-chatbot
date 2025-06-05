/**
 * Unified LLM provider registry – July 2025
 * Vendors:
 *   • OpenAI     – GPT-4o / 4.1 / 4.5-Orion + o-series
 *   • Google     – Gemini 1.5-pro (+Vision)
 *   • xAI        – Grok-3
 *   • Anthropic  – Claude-4 Opus / Sonnet
 *   • Perplexity – Labs
 *   • Meta       – Llama-4 (via Groq)
 */

import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createOpenAI }             from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic }          from '@ai-sdk/anthropic';
import { createXai }                from '@ai-sdk/xai';
import { createPerplexity }         from '@ai-sdk/perplexity';
import { createGroq }               from '@ai-sdk/groq';
import OpenAI                       from 'openai';

import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

/* ─────────────────────────────────────────────── */
/*  1. base provider handles per-vendor API keys   */
/* ─────────────────────────────────────────────── */
const openaiProvider    = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
const googleProvider    = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});
const anthropicProvider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
const pplxProvider      = createPerplexity({
  apiKey: process.env.PPLX_API_KEY!,
});
const llamaProvider     = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});
const xaiProvider       = createXai({
  apiKey: process.env.XAI_API_KEY!,
});

/* Helper → model-id ➜ LanguageModelV1 */
export const openai    = (id: string) => openaiProvider(id);
/** Default arg ensures callers can just `gemini()` */
export const gemini    = (id: string = 'gemini-1.5-pro-latest') =>
  googleProvider(id);
export const anthropic = (id: string) => anthropicProvider(id);
export const pplx      = (id: string) => pplxProvider(id);
export const llama     = (id: string) => llamaProvider(id);
export const grok      = (id: string) => xaiProvider(id as any); // typings missing

/* ─────────────────────────────────────────────── */
/*  2. provider exposed to the rest of the app     */
/* ─────────────────────────────────────────────── */
export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model':            chatModel,
        'chat-model-reasoning':  reasoningModel,
        'title-model':           titleModel,
        'artifact-model':        artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        /* —— OpenAI —— */
        'chat-model':            openai('gpt-4o'),
        'chat-model-reasoning':  wrapLanguageModel({
                                    model: openai('gpt-o3'),
                                    middleware: extractReasoningMiddleware(
                                      { tagName: 'think' },
                                    ),
                                  }),
        'title-model':           openai('gpt-4o'),
        'artifact-model':        openai('gpt-4o'),

        'gpt-4o':               openai('gpt-4o'),
        'gpt-4.1':              openai('gpt-4.1'),
        'gpt-4.5-orion':        openai('gpt-4.5-orion'),
        'gpt-o1':               openai('gpt-o1'),
        'gpt-o3':               openai('gpt-o3'),
        'gpt-o4-mini':          openai('gpt-o4-mini'),

        /* —— Google —— */
        'gemini-1.5-pro-latest': gemini(),
        'gemini-pro-vision':     gemini('gemini-pro-vision'),

        /* —— xAI —— */
        'grok-3':               grok('grok-3'),

        /* —— Anthropic —— */
        'claude-4-opus':        anthropic('claude-4-opus-202505'),
        'claude-4-sonnet':      anthropic('claude-4-sonnet-202505'),

        /* —— Perplexity —— */
        'pplx-labs':            pplx('pplx-labs'),

        /* —— Meta (Groq) —— */
        'llama4-scout':         llama('llama4-scout'),
        'llama4-maverick':      llama('llama4-maverick'),
      },
    });

/* ─────────────────────────────────────────────── */
export const openaiClient        = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
export const DEFAULT_CHAT_MODEL  = 'chat-model' as const;
