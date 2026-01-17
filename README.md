# StylistAI - AI-Powered Fashion Recommendations

Get personalized outfit recommendations and style advice powered by AI. Upload your outfit photos and receive instant fashion tips tailored to your preferences.

## Features

- 🎨 **AI Style Analysis** - Upload outfit photos and get instant style advice
- 👗 **Outfit Recommendations** - Browse curated outfit suggestions
- 💡 **Style Inspiration** - Discover new fashion trends and ideas
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (database & functions)
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd AI-Fashion
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:8080](http://localhost:8080) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── services/       # API and business logic
├── integrations/   # Third-party integrations
└── lib/            # Utility functions
```

## Deployment

Build the project for production:

```bash
npm run build
```

The build output will be in the `dist` folder, ready to be deployed to any static hosting service.

## License

MIT License
