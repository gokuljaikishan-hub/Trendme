# TrendMe - Your Personal Fashion Assistant

TrendMe is a sophisticated mobile-first web application that uses Google's Gemini AI to provide personalized fashion recommendations and high-fidelity virtual try-ons.

## 🌟 Features

- **Full-Body Photo Upload**: Securely upload your full-body photo for accurate analysis.
- **Occasion-Based Styling**: Choose from various occasions like Weddings, Formals, Casual, Date Nights, and Traditional Indian festivities.
- **Top 5 AI Suggestions**: Receive exactly five curated outfit recommendations tailored to your physique, skin tone, and selected occasion.
- **Virtual AI Try-on**: Preview the suggested outfit by replacing your current clothes while maintaining your face and features for a realistic experience.
- **Smart Shopping Integration**: Direct links to major Indian e-commerce sites (Myntra, Ajio, Amazon, Flipkart) matching the suggested style and color.

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animations**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **AI Backend**: Google Gemini API
  - `gemini-3-flash-preview`: For rapid image analysis and structured JSON output of outfit suggestions.
  - `gemini-2.5-flash-image`: For photorealistic virtual try-on generation via image-to-image prompting.

## 🚀 Deployment

### Vercel
1. Push this code to a GitHub repository.
2. Link the repository to a new project on Vercel.
3. In the Vercel Dashboard, go to **Settings > Environment Variables**.
4. Add `GEMINI_API_KEY` with your Google AI Studio API key.
5. Deploy! The `vercel.json` ensures all routes are correctly handled for the SPA.

## 📁 Project Structure

- `src/App.tsx`: Main application logic and mobile-first UI components.
- `src/services/geminiService.ts`: Core AI integration logic for analysis and generation.
- `src/lib/utils.ts`: Utility helpers for styling and class merging.
- `metadata.json`: Application metadata and permissions.

## 📝 License

Apache-2.0
