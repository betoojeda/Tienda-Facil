import { GoogleGenAI } from "@google/genai";
import { Sale, Product } from '../types';

const getAiClient = () => {
  // In a real production PWA, this should be handled via a proxy backend to hide the key,
  // or prompt the user to enter their key for a "BYOK" (Bring Your Own Key) model.
  // For this demo, we assume the environment variable is injected.
  if (!process.env.API_KEY) {
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeBusiness = async (sales: Sale[], products: Product[], query: string): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // Prepare context
    const salesSummary = sales.slice(-50).map(s => ({
      date: s.date,
      total: s.total,
      items: s.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
    }));
    
    const inventorySummary = products.map(p => ({
      name: p.name,
      stock: p.stock,
      price: p.price
    }));

    const context = `
      Actúa como un consultor de negocios experto.
      Aquí tienes los datos recientes del negocio:
      
      Inventario actual: ${JSON.stringify(inventorySummary)}
      Últimas ventas: ${JSON.stringify(salesSummary)}
      
      Responde a la siguiente consulta del usuario de forma concisa, profesional y útil en español: "${query}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context,
    });

    return response.text || "No pude generar una respuesta en este momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lo siento, hubo un error al consultar a la IA. Verifica tu conexión o clave API.";
  }
};