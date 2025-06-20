# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build` (runs TypeScript compiler first, then Vite build)
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Project Architecture

This is a React + TypeScript + Vite application with the following key characteristics:

- **Build System**: Vite with SWC for fast React refresh
- **Language**: TypeScript with strict configuration
- **Framework**: React 19.1.0 with modern hooks
- **Entry Point**: `src/main.tsx` renders `App.tsx` into `#root` element
- **Styling**: CSS modules with `App.css` and `index.css`
- **Configuration**: 
  - TypeScript uses project references (`tsconfig.app.json` for app code, `tsconfig.node.json` for build tools)
  - ESLint configured with React hooks and React refresh plugins
  - Uses ES modules (`"type": "module"` in package.json)

## Key Files

- `src/App.tsx`: Main application component
- `src/main.tsx`: Application entry point with React 19 createRoot
- `vite.config.ts`: Vite configuration with React SWC plugin
- `eslint.config.js`: ESLint configuration with TypeScript and React rules

## Development Notes

- Uses React 19's `createRoot` API
- Configured for modern React patterns with hooks
- TypeScript strict mode enabled with `verbatimModuleSyntax`
- ESLint enforces React hooks rules and component refresh patterns
- Tailwind CSS v3 with PostCSS for styling
- AWS SDK v3 for S3 operations with signed URLs
- Images stored in S3 following `/lifelog/yyyy/mm/dd/yyyy-mm-dd-hhmmss.jpg` pattern