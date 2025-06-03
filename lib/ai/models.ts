/**
 * Models surfaced in the dropdown UI – June 2025 edition.
 */
export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

/** Default model the app uses when you open a new chat */
export const DEFAULT_CHAT_MODEL = 'chat-model' as const;

/** All models that should appear in the selector */
export const chatModels: ChatModel[] = [
  /* ---------- OpenAI ---------- */
  { id: 'chat-model',            name: 'GPT-4o (Omni)',                 description: 'fast, multimodal default' },
  { id: 'gpt-4.1',               name: 'GPT-4.1',                      description: '1 M-token context' },
  { id: 'gpt-4.5-orion',         name: 'GPT-4.5 Orion',                description: 'accuracy / EQ boost' },
  { id: 'gpt-o1',                name: 'GPT-o1',                    description: 'STEM-focused' },
  { id: 'gpt-o3',                name: 'GPT-o3',                    description: 'reasoning powerhouse' },
  { id: 'gpt-o4-mini',           name: 'GPT-o4-mini',               description: 'smallest o-series' },
  { id: 'chat-model-reasoning',  name: 'GPT-4o (w/ chain-of-thought)', description: 'debug & planning' },

  /* ---------- Google ---------- */
  { id: 'gemini-2.5-pro',            name: 'Gemini 2.5 Pro',            description: 'next-gen multimodal' },
  { id: 'gemini-2.5-pro-deepthink',  name: 'Gemini Deep Think',         description: 'experimental reasoning' },

  /* ---------- xAI ---------- */
  { id: 'grok-3',                 name: 'Grok-3',                       description: 'real-time web access' },

  /* ---------- Anthropic ---------- */
  { id: 'claude-4-opus',          name: 'Claude 4 Opus',                description: 'largest Claude 4' },
  { id: 'claude-4-sonnet',        name: 'Claude 4 Sonnet',              description: 'mid-tier Claude 4' },

  /* ---------- Perplexity ---------- */
  { id: 'pplx-labs',              name: 'Perplexity Labs',              description: 'research-grade agent' },

  /* ---------- Meta ---------- */
  { id: 'llama4-scout',           name: 'Llama-4 Scout',                description: 'multimodal open weights' },
  { id: 'llama4-maverick',        name: 'Llama-4 Maverick',             description: 'flagship Meta model' },
];


console.log('💡 chatModels length:', chatModels.length);