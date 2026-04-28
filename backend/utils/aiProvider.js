// ============================================
// DMap AI Provider — Abstraction Layer
// Swap providers by changing .env variables:
//   AI_PROVIDER=gemini|openai|anthropic|custom
//   AI_API_KEY=your_key
//   AI_MODEL=model_name
//   AI_BASE_URL=optional_custom_endpoint
// ============================================

const config = require('../config/aiConfig');

/**
 * Base class — all providers must implement generateText()
 */
class AIProvider {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.baseUrl = config.baseUrl;
  }

  /**
   * Generate text from conversation
   * @param {string} systemPrompt - System instructions
   * @param {Array<{role: string, content: string}>} history - Previous messages
   * @param {string} userMessage - Current user message
   * @returns {Promise<string>} - AI response text
   */
  async generateText(systemPrompt, history, userMessage) {
    throw new Error('generateText() must be implemented by subclass');
  }

  /**
   * Factory method — creates provider based on .env config
   */
  static create() {
    const provider = process.env.AI_PROVIDER || config.defaultProvider;
    const providerConfig = {
      apiKey: process.env.AI_API_KEY,
      model: process.env.AI_MODEL,
      baseUrl: process.env.AI_BASE_URL || null,
    };

    if (!providerConfig.apiKey) {
      console.warn('⚠️  AI_API_KEY not set in .env — AI features will return errors');
    }

    switch (provider) {
      case 'gemini':
        return new GeminiProvider(providerConfig);
      case 'openai':
      case 'anthropic':
      case 'custom':
        return new OpenAICompatibleProvider(providerConfig);
      default:
        console.warn(`Unknown AI_PROVIDER "${provider}", falling back to ${config.defaultProvider}`);
        return new GeminiProvider(providerConfig);
    }
  }
}

// ============================================
// Gemini Provider (Default)
// Uses @google/generative-ai SDK
// ============================================
class GeminiProvider extends AIProvider {
  constructor(providerConfig) {
    super(providerConfig);
    this.modelName = providerConfig.model || config.defaultGeminiModel;

    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const options = providerConfig.baseUrl
        ? { apiKey: providerConfig.apiKey, httpOptions: { baseUrl: providerConfig.baseUrl } }
        : providerConfig.apiKey;

      this.genAI = new GoogleGenerativeAI(options);
      this.ready = true;
    } catch (err) {
      console.error('Failed to initialize Gemini SDK:', err.message);
      this.ready = false;
    }
  }

  async generateText(systemPrompt, history = [], userMessage) {
    if (!this.ready) throw new Error('Gemini SDK not initialized. Check AI_API_KEY.');

    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt,
    });

    // Convert history to Gemini format
    const geminiHistory = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  }
}

// ============================================
// OpenAI-Compatible Provider
// Works with: OpenAI, OpenRouter, Ollama, vLLM,
//             LM Studio, Groq, Together AI, etc.
// Uses raw fetch() — no SDK dependency needed
// ============================================
class OpenAICompatibleProvider extends AIProvider {
  constructor(providerConfig) {
    super(providerConfig);
    this.model = providerConfig.model || config.defaultOpenAIModel;
    this.baseUrl = providerConfig.baseUrl || 'https://api.openai.com/v1';
    // Remove trailing slash
    this.baseUrl = this.baseUrl.replace(/\/+$/, '');
  }

  async generateText(systemPrompt, history = [], userMessage) {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const maxRetries = config.maxRetries;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), config.timeoutMs); 

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature: config.temperature,
            max_tokens: config.maxTokens,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          const errorBody = await response.text();
          if (response.status === 404) {
             throw new Error(`API endpoint not found (404): ${this.baseUrl}/chat/completions. Please check AI_BASE_URL in .env. Your local server might use a different path.`);
          }
          throw new Error(`AI API error (${response.status}): ${errorBody}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      } catch (err) {
        if (err.name === 'AbortError') {
           console.warn(`[AI Provider] Attempt ${attempt + 1} timed out.`);
           if (attempt === maxRetries) throw new Error('AI API request timed out after multiple attempts.');
        } else {
           console.warn(`[AI Provider] Attempt ${attempt + 1} failed: ${err.message}`);
           if (attempt === maxRetries) throw err;
        }
        // Exponential backoff
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }
}

// Singleton instance — reused across requests
let _instance = null;

function getAIProvider() {
  if (!_instance) {
    _instance = AIProvider.create();
  }
  return _instance;
}

module.exports = { AIProvider, getAIProvider };
