# AI Component Builder

Generate React components from natural language prompts using OpenAI, preview them live, and save your favorites to a Firebase-backed gallery.

## Features

- **Prompt-to-component generation** — describe a UI in plain English and get back a styled React component.
- **Live preview** — generated JSX is rendered immediately in an isolated preview panel.
- **Syntax-highlighted code view** — inspect and copy the generated source via `prism-react-renderer`.
- **Gallery** — save generated components to Firestore and browse past variants from the side gallery.
- **Tailwind styling** — generated components use Tailwind CSS classes for consistent look-and-feel.
- **BYO API key** — your OpenAI key is stored locally in `localStorage`; no backend required.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 7](https://vitejs.dev/) for dev/build
- [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- [OpenAI SDK](https://github.com/openai/openai-node) (`gpt-4o`)
- [Firebase Firestore](https://firebase.google.com/docs/firestore) for gallery persistence
- [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer) for code highlighting

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)
- (Optional) A [Firebase project](https://console.firebase.google.com/) with Firestore enabled if you want to save components

### Installation

```bash
git clone https://github.com/<your-username>/ai-component-builder.git
cd ai-component-builder
npm install
```

### Environment Variables

Create a `.env` file in the project root with your Firebase config (only needed if you want gallery persistence):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Your OpenAI API key is entered through the UI and saved in `localStorage`.

### Run

```bash
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── App.tsx              # Root component, generation + save handlers
├── prompt-input.tsx     # Sidebar with prompt input + API key field
├── preview-panel.tsx    # Live preview + code view
├── gallery.tsx          # Saved components sidebar
├── firebase.ts          # Firestore client + CRUD helpers
├── type.ts              # Shared types and discriminated unions
└── components/          # UI building blocks (CodeBlock, WebPreview, etc.)
```

## How It Works

1. Enter your OpenAI API key in the left sidebar (stored in `localStorage`).
2. Type a prompt describing the component you want (e.g. *"A pricing card with three tiers and a highlighted middle plan"*).
3. The app sends the prompt to `gpt-4o` with a system instruction to return raw JSX with Tailwind classes only.
4. The response is cleaned (stripping fences, imports, exports, function wrappers) and rendered live.
5. Hit **Save** to persist the prompt + code to Firestore; saved components appear in the right gallery.

