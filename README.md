# TASTE — Music SPA (Vite + JSON-Server)
## How to run (dev)
npm install

npm run start

npm build
npm run start:deploy




# App: http://localhost:5173
# API: http://localhost:3131 (GET /songs)


Jednostronicowa aplikacja muzyczna z trzema widokami: **Home**, **Search**, **Discover**.  
Dane ładowane są z `JSON-Server` (`app.json`), a odtwarzanie obsługuje **GreenAudioPlayer** ze stylizacją w czerwieni.  
Nawigacja oparta o **hash routing**, bez przeładowania strony.

## Live demo
- Replit: <REPL_URL>

## Tech stack
- **Vite** (dev/build), **Vanilla JS (ESM)**, **HTML**, **CSS (Sass)**
- **JSON-Server** – API z `app.json`
- **GreenAudioPlayer** – custom skin (red theme)

## Funkcje
- **Home** – dynamiczne karty z API + filtr kategorii (toggle/reset)  
- **Search** – wyszukiwanie po tytule/autorze, licznik wyników  
- **Discover** – losowanie utworu z najczęściej słuchanej kategorii (z `localStorage`)  
- **Subscribe box** – „JOIN NOW” → `/join-now` (placeholder)  
- Uppercase przez JS (zgodnie z wymogiem projektu)

## Struktura projektu

## 🇬🇧 English summary

# TASTE — Music SPA (Vite + JSON-Server)

A single-page music application with three main views: **Home**, **Search**, and **Discover**.  
Data is loaded from a local `JSON-Server` (`app.json`), and playback is handled by **GreenAudioPlayer** with a custom red theme.  
Navigation works via **hash routing**, so the app runs smoothly without page reloads.

## Live demo
- Replit: <REPL_URL>

## Tech stack
- **Vite** (dev/build), **Vanilla JS (ESM)**, **HTML**, **CSS (Sass)**
- **JSON-Server** — API based on `app.json`
- **GreenAudioPlayer** — red custom skin

## Features
- **Home** – dynamically renders songs from API + category filter (toggle/reset)  
- **Search** – search by title or author with a live counter  
- **Discover** – suggests a random song from the most played category (based on `localStorage`)  
- **Subscribe box** – “JOIN NOW” → `/join-now` (placeholder for future feature)  
- Automatic uppercase text formatting via JS (per client brief)

## Project structure


