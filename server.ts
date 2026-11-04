import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI();

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, langMode } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const formattedContents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history) {
        if (h && h.content) {
          formattedContents.push({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.content }],
          });
        }
      }
    }

    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const systemInstruction = `You are the Executive Industrial Operations AI Copilot for Machinery Engineering Group (MEG) · Agro-Machinery Industry.
The factory structure comprises the official 13 departments:
1. Production (Fabrication Shop, Welding Shop, Machine Shop)
2. Assembling and Finishing
3. Quality Control
4. Machinery and Vehicle Maintenance
5. Marketing
6. Human Resource
7. Logistics
8. General Service
9. Change Management and Safety (Kaizen 5S)
10. Procurement and Finance
11. Internal Audit
12. ICT
13. Disc Blade (Agricultural tractor disc manufacturing)

Provide concise, executive-level industrial advice on:
- Root cause analysis for scrap spikes (e.g. quenching furnace temperature drift, weld arc instability).
- OEE recovery directives (e.g. pneumatic air compressor servicing, CNC spindle maintenance).
- Weekly task bottleneck mitigations and deadline prioritization.
- Budget variance controls (in Ethiopian Birr / ETB).
- 5S Kaizen safety and shop floor discipline.

If the user writes in Amharic, respond fluently in Amharic with appropriate technical terminology.
If the user writes in English, reply in professional industrial English.`;

    let replyText: string | null = null;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: {
            systemInstruction,
          },
        });
        replyText = response.text || null;
        break;
      } catch (err: any) {
        console.warn(`gemini-3.8-flash attempt ${attempts} failed:`, err?.message);
        if (attempts >= maxAttempts) {
          throw err;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: err.message || 'Failed to generate response' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MEG Agro-Machinery server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
