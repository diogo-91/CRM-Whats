import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateResponseSuggestion = async (contactName: string, lastMessage: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Configurar API KEY para sugestões.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Contexto: Eu sou um atendente usando um CRM de WhatsApp.
      Cliente: ${contactName}
      Última interação/tópico: ${lastMessage || "Iniciar conversa"}
      
      Tarefa: Gere uma resposta curta, profissional e amigável em Português do Brasil para este cliente. Máximo 15 palavras.`,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating suggestion:", error);
    return "Erro ao gerar sugestão.";
  }
};
