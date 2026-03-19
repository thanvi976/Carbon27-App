# Carbon27 (Expo SDK 54)

Production-grade React Native app scaffold for the Carbon27 assessment + streaks + org leaderboard experience.

## Versions (locked by `package.json`)

- Expo SDK: `~54.0.0`
- React: `18.3.1`
- React Native: `0.76.3`

## Install

Required (per project rules):

```bash
npm install --legacy-peer-deps
```

## Run

```bash
npm run start
```

## App structure

`src/`

- `constants/`: colors, typography, questions, levels, badge rules, cache keys
- `services/`: `firebase.ts` (exact config), `auth.ts`, `firestore.ts`, `notifications.ts`
- `store/`: Zustand stores (all persisted via `persist` + AsyncStorage)
- `navigation/`: Root gate + auth stack + tabs + nested stacks
- `screens/`: all screens described in the spec
- `components/`: UI primitives + charts
- `utils/`: scoring, certificate HTML, date helpers, share text

## Firebase model

- `users/{uid}`: profile + score/level/badges + responses + streak + orgId
- `organisations/{orgId}`: org data + members[] + inviteCode
- `assessments/{id}`: assessment snapshots

## Notes

- Email/password auth only (Expo Go compatible).
- Notifications request permissions before scheduling (9am daily).
- Certificate generation uses `expo-print` + `expo-sharing` and inline/system-font HTML only.

