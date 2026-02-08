# Video & Blog Expo App 2026

A high-performance, universal mobile application built with **Expo Stack**. This project serves as a content delivery platform for videos and blogs, featuring a secure authentication flow and a modern, utility-first UI.

## 🚀 Tech Stack

* **Framework:** [Expo](https://expo.dev/) (SDK 50+)
* **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based, Type-safe)
* **UI Components:** [Gluestack UI v2](https://gluestack.io/) (Headless components)
* **Styling:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for Native)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Data Fetching:** [TanStack Query v5](https://tanstack.com/query/latest)
* **Media:** `expo-video` for native high-performance playback
* **Storage:** `expo-secure-store` for encrypted credential persistence

---

## 📂 Project Structure

* `app/`: File-based routes. Handles authentication gating and navigation layouts.
* `components/ui/`: Gluestack-generated components (Buttons, Cards, Inputs).
* `store/`: Global state logic (Auth, User preferences).
* `hooks/`: Custom hooks for API integration and data fetching.
* `assets/`: Local media and fonts.

---

## 🛠 Getting Started

### Prerequisites

* [pnpm](https://pnpm.io/) installed globally (`npm install -g pnpm`)
* Expo Go app on your phone or an Emulator (iOS/Android)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

```


2. **Install dependencies:**
```bash
pnpm install

```


3. **Environment Setup:**
Create a `.env` file in the root directory:
```text
EXPO_PUBLIC_API_URL=https://your-backend-api.com

```


4. **Start the development server:**
```bash
pnpm start

```



---

## 🔐 Authentication Flow

The app uses a **Protected Routes** pattern via Expo Router:

1. Tokens are stored securely in `expo-secure-store`.
2. The `app/_layout.tsx` checks for a session.
3. Unauthenticated users are automatically redirected to the `(auth)/login` group.

---

## 🎥 Video Features

* Adaptive streaming support via `expo-video`.
* Picture-in-Picture (PiP) enabled.
* Native full-screen controller integration.

---

## 🧹 Maintenance Commands

**Check for SDK-compatible library updates:**

```bash
npx expo install --check

```

**Clean cache (if native modules act up):**

```bash
pnpm start --clear

```

---

## 📄 License

This project is licensed under the MIT License.

---

**Next Step:** I can now write that **Zustand Auth Store** we discussed to link your login screen to your backend. Ready to see the code?