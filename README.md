# Keta Akademi — mobil

The [KetaLearn](https://ketalearn.cloud) web app ported to React Native with [Expo](https://expo.dev/) and [Expo Router](https://expo.dev/router). Every user-facing page of the Next.js frontend (`../frontend`) has a native screen here, backed by the same Strapi API.

Styled with [Tailwind CSS](https://tailwindcss.com/) via [Uniwind](https://uniwind.dev/); UI primitives from [React Native Reusables](https://reactnativereusables.com).

## Getting Started

```bash
pnpm install
cp .env.example .env   # then edit if you need a non-default API URL
pnpm dev
```

`pnpm dev` starts Metro and prints a QR code plus a menu. From there:

- press `w` to open the app in a browser — no emulator needed, the fastest way to check routing and rendering
- press `a` to launch on an Android emulator or connected device
- press `i` to launch on the iOS simulator (macOS only)
- scan the QR code with [Expo Go](https://expo.dev/go) on a physical phone

### Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_STRAPI_URL` | `https://admin.ketalearn.cloud` | Strapi API base URL |
| `EXPO_PUBLIC_KETA_DEMO_LOGIN` | unset | Set to `true` to show the demo-student sign-in button |

Only `EXPO_PUBLIC_`-prefixed variables are inlined into the bundle, and they are baked in at build time — after changing `.env` you must restart Metro with `pnpm dev` (the `-c` flag also clears the cache).

## Choosing a test target

Pick the cheapest target that can actually exercise what you changed.

| Target | Setup cost | Use it for | Cannot do |
| --- | --- | --- | --- |
| Web (`pnpm web`) | none | routing, layout, data fetching, empty/error states | native modules, gestures, real video playback |
| Physical phone + Expo Go | none | quick UI checks, touch behaviour, camera-free flows | libraries whose native code is not bundled into Expo Go |
| Android emulator | medium | the default day-to-day target; works on Windows, Linux **and** macOS; `adb` access | iOS-only behaviour |
| iOS simulator | high (macOS + Xcode) | iOS layout, safe areas, navigation transitions | anything on Windows/Linux — Apple does not ship a simulator for them |
| Development build | medium | release-like behaviour, profiling, and **any** native module | — |

**Which one does this app need?** Today every native module actually imported by `src/` is part of Expo Go, so Expo Go and the emulator both work without extra setup. Two caveats:

- `react-native-keyboard-controller` is in `package.json` but **never imported** — a leftover from the React Native Reusables template. It contains native code, which Expo Go does not ship. The moment you import it, Expo Go stops working and you need a development build. Either remove the dependency or keep it unused.
- Adding any other library with native code has the same effect. Check with `pnpm exec expo install --check` after adding dependencies.

### When you need a development build

A development build is your own custom Expo Go containing this project's native code. You need one for native modules outside Expo Go, for release-mode profiling, and for anything involving `expo-updates`.

```bash
pnpm add expo-dev-client     # once
pnpm ios                     # builds + installs on the simulator (macOS)
pnpm android                 # builds + installs on the emulator/device
```

Both commands require the platform toolchain below. First run compiles native code and takes several minutes; afterwards it is incremental. Alternatively use [EAS Build](https://docs.expo.dev/build/introduction/) with a `development` profile to build in the cloud — that is the only way to get an iOS build without a Mac.

## Emulator setup

You need a JDK (17) and the Android SDK. Android Studio bundles both and is the easiest route; the CLI-only path is further down if you would rather not install an IDE.

### macOS

**iOS simulator**

```bash
xcode-select --install
```

Then install Xcode from the App Store, open it once so it installs its components, and accept the licence:

```bash
sudo xcodebuild -license accept
xcrun simctl list devices        # confirm a simulator runtime is present
```

In Xcode → Settings → Platforms, download an iOS runtime if none is listed.

**Android**

Install [Android Studio](https://developer.android.com/studio), then in Settings → Languages & Frameworks → Android SDK install **Android SDK Platform**, **Android Emulator** and **Android SDK Platform-Tools**. Create a device in Device Manager (a Pixel profile, newest stable API level, **arm64-v8a** image on Apple Silicon).

Add the SDK to your shell profile (`~/.zshrc`):

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
```

Acceleration uses Apple's Hypervisor.framework, which is built in — nothing to install.

### Windows

**Enable the emulator accelerator first.** Intel HAXM is deprecated (Intel stopped development in January 2023 and emulator 36.2+ refuses to use it). Use **WHPX** — the Windows Hypervisor Platform:

```powershell
# elevated PowerShell
Enable-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform
```

Then reboot. WHPX needs CPU virtualisation enabled in BIOS/UEFI, and unlike the older AEHD driver it coexists happily with Hyper-V, WSL2 and Docker Desktop — so you do not have to choose between the emulator and your other tooling. If WHPX is genuinely unavailable on your machine, AEHD is the fallback, but it requires Hyper-V to be turned **off**.

There is no iOS simulator on Windows. Test Android and web locally, and use EAS Build or a macOS runner when you need iOS.

**Android**

Install [Android Studio](https://developer.android.com/studio) (bundles a JDK), install the same three SDK packages as above, and create a Pixel AVD on the newest stable API level with an **x86_64** image.

Set the environment variables (elevated PowerShell, then reopen your terminal):

```powershell
setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
setx PATH "$env:PATH;$env:LOCALAPPDATA\Android\Sdk\emulator;$env:LOCALAPPDATA\Android\Sdk\platform-tools"
```

Verify with `emulator -list-avds` and `adb devices`.

### Linux

**Enable KVM** — without it the emulator is unusably slow:

```bash
sudo apt install qemu-kvm libvirt-daemon-system   # Debian/Ubuntu
sudo usermod -aG kvm $USER
sudo usermod -aG libvirt $USER                     # Ubuntu 22.04+
```

Log out and back in, then confirm you can access the device without sudo:

```bash
ls -l /dev/kvm
```

**Android** — either Android Studio as above, or the CLI-only path (below), which is much lighter on a server or in CI. Set in `~/.bashrc`:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
```

There is no iOS simulator on Linux; same guidance as Windows.

### CLI-only Android setup (no IDE)

Grab the [command-line tools](https://developer.android.com/studio#command-line-tools-only), unzip them to `$ANDROID_HOME/cmdline-tools/latest`, then:

```bash
sdkmanager "platform-tools" "emulator" \
  "platforms;android-35" \
  "system-images;android-35;google_apis;x86_64"

avdmanager create avd -n pixel -k "system-images;android-35;google_apis;x86_64" -d pixel_7

emulator -avd pixel
```

Swap `android-35` for the newest API level you installed, and `x86_64` → `arm64-v8a` on Apple Silicon. Prefer the `google_apis` image over `google_play`: Play images lock down `adb root` and the system partition, which you occasionally want while debugging.

For CI or a headless box, add `-no-window -no-audio -no-boot-anim`, and wait for boot before installing:

```bash
adb wait-for-device shell 'while [ "$(getprop sys.boot_completed)" != "1" ]; do sleep 2; done'
```

### Running against the emulator

```bash
pnpm android     # or press `a` in the Metro menu
```

Metro serves the bundle over the network. Emulators reach the host automatically, but a **physical device over USB** needs port forwarding:

```bash
adb reverse tcp:8081 tcp:8081
```

For a device on the same Wi-Fi, run `pnpm dev` and scan the QR code, or press `s` in Metro to switch to tunnel mode if the network blocks the connection.

## Routes

Four tabs (`Ana Sayfa`, `Dersler`, `Blog`, `Profil`) plus a stack screen per web page. `Profil` is the hub for the stack screens.

| Screen | Web equivalent |
| --- | --- |
| `/` | `/` (home: slider, exams, courses, tutor & parent sections) |
| `/courses` | `/kurslar` |
| `/courses/[slug]` | `/kurslar/[slug]` (lesson player + quiz) |
| `/konular/[slug]` | `/konular/[slug]` |
| `/derslerim` | `/derslerim` |
| `/deneme-sinavlari` | `/deneme-sinavlari` |
| `/deneme-sinavlari/[slug]` | `/deneme-sinavlari/[slug]` (exam runner + PDF report flow) |
| `/rapor/[key]/veli` | `/rapor/[key]/veli` |
| `/ozel-ders` | `/ozel-ders` |
| `/ozel-ders/[slug]` | `/ozel-ders/[slug]` (profile + reviews) |
| `/sayfalar` | `/sayfalar` |
| `/sayfalar/[slug]` | `/sayfalar/[slug]` (taban puanları / videolar / bloglar) |
| `/sayfalar/[slug]/[subSlug]` | `/sayfalar/[slug]/[subSlug]` |
| `/blog` | blogs, otherwise reached via `/sayfalar/[slug]` |
| `/sikca-sorulan-sorular` | `/sikca-sorulan-sorular` |
| `/iletisim` | `/iletisim` |
| `/gizlilik-politikasi`, `/hizmet-sartlari` | same |
| `/giris`, `/kayit-ol` | `/giris`, `/kayit-ol` |

Not ported, because they are web-only: `sitemap.ts`, `robots.ts`, `/api/*` route handlers and `/auth/callback` (native Google sign-in uses the deep-link handler in `src/app/_layout.tsx` instead). GA4 tracking and JSON-LD structured data are omitted; there is no analytics in the mobile app.

## Layout

```
src/
  app/            # expo-router screens
  components/
    features/     # per-domain components (deneme, quiz, tutoring, admission, blog, video)
    shared/       # cross-screen components (rich-text, course-card, cards, states, …)
    ui/           # React Native Reusables primitives
  hooks/          # use-async
  lib/            # strapi + deneme API clients, formatting, icons, routes
  stores/         # zustand auth store (persisted to SecureStore)
```

`src/lib/strapi.ts` mirrors the web app's data layer: same endpoints, `populate`/`filters`/`fields` params, pagination walking and Bearer-token handling. Strapi media URLs come back relative, so resolve them with `mediaUrl()`.

Several API field names are misspelled upstream and are reproduced deliberately: `StrapiDepartment.titile`, `StrapiTutoringProfile.experties`, `StrapiTutoringProfile.exprienceYears`.

Turkish dates and numbers are formatted by hand in `src/lib/utils.ts` — Hermes' `Intl` coverage is partial, and `toLocaleDateString('tr-TR')` silently falls back to an English layout.

## Tooling

Two linters, deliberately split so neither duplicates the other:

- **Biome** — formatter plus fast lint, and Tailwind class sorting (`useSortedClasses`). Owns all formatting. Config in `biome.json`.
- **ESLint** with `eslint-config-expo` — Expo/React Native correctness that Biome has no rules for: Metro `require` semantics, env-var inlining, and the React hooks rules. Config in `eslint.config.js`. Formatting is left to Biome, and `react/no-unescaped-entities` is off because HTML entity escaping does not exist in React Native — `&apos;` would render literally inside a `<Text>`, and Turkish copy is full of apostrophes.

`src/uniwind-types.d.ts` is ignored by both: Uniwind's Metro plugin regenerates it on every build with formatting that contradicts the Biome config, so linting it only creates churn.

### Commands

```bash
pnpm verify        # typecheck + biome + eslint — run before every commit
pnpm typecheck     # tsc --noEmit
pnpm lint          # biome --write (auto-fixes formatting and safe lint fixes)
pnpm lint:eslint   # eslint only, no writes
pnpm lint:ci       # biome check + eslint, no writes (what CI runs)
pnpm doctor        # expo-doctor
```

**How to work with them.** `pnpm lint` rewrites files, so run it after finishing an edit and review the diff. It applies only *safe* fixes — unsafe ones (for example removing a hook dependency) are reported and must be handled by hand. `pnpm lint:ci` never writes and exits non-zero on anything unresolved, which makes it the right gate for CI.

If a hook dependency warning is intentional, suppress it on the line directly above the hook with a reason attached:

```ts
// biome-ignore lint/correctity/useExhaustiveDependencies: depsKey and nonce are re-run triggers, not values read inside the effect.
```

`pnpm doctor` runs [expo-doctor](https://docs.expo.dev/workflow/expo-doctor/): 18 checks covering dependency version alignment with the installed Expo SDK, native config sanity in `app.json`, and common misconfigurations. Run it after upgrading Expo, after adding a native dependency, and whenever a build fails for a reason you cannot explain. It is read-only — it reports, it never changes your project.

## Adding components

```bash
npx react-native-reusables/cli@latest add [...components]
```

> e.g. `npx react-native-reusables/cli@latest add input textarea`

Without component names you are prompted to select interactively; `--all` installs everything.

## Deploy with EAS

- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)

## Learn More

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Uniwind Docs](https://docs.uniwind.dev/)
- [React Native Reusables](https://reactnativereusables.com)
