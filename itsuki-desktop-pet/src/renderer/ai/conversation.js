/**
 * Conversation Manager — 對話歷史管理
 */

class ConversationManager {
  constructor(systemPrompt, maxHistory = 20) {
    this.systemPrompt = systemPrompt;
    this.maxHistory = maxHistory;
    this.messages = [];
  }

  reset() {
    this.messages = [];
  }

  addUserMessage(text) {
    this.messages.push({ role: 'user', content: text });
    this._trim();
  }

  addAssistantMessage(text) {
    this.messages.push({ role: 'assistant', content: text });
    this._trim();
  }

  getMessagesForAPI() {
    return [
      { role: 'system', content: this.systemPrompt },
      ...this.messages,
    ];
  }

  _trim() {
    // 保留最近 N 條（user + assistant 成對保留）
    while (this.messages.length > this.maxHistory) {
      this.messages.shift();
    }
  }

  getLastMessages(count) {
    return this.messages.slice(-count);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConversationManager;
}
