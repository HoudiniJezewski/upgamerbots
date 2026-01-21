const { GPUQueue } = require('./queues');

class OllamaClient {
  constructor(model) {
    this.model = model;
  }

  async generateResponse(prompt) {
    return GPUQueue.enqueue(async () => {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: this.model, prompt, stream: false }),
      });

      if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);

      const data = await response.json();
      return data.response.trim();
    });
  }
}

module.exports = OllamaClient;
