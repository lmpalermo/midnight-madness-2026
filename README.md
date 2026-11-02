# The Bruski's Midnight Mayhem 2026

Static New Year's Eve party site. Main deploys to Firebase Hosting project `midnight-madness-2026` through `.github/workflows/firebase-hosting.yml` using the existing repository secret.

## Available
- Black, gold, silver, and champagne arcade and TV welcome screen; local-time countdown to January 1, 2027.
- Name That Year: 24 original trivia prompts, randomized 6/12/24-question rounds, 1–8 named teams, 20/30/45/60-second pausable timer, answer reveal, host-awarded exact-match points with undo, and tied winners.
- Saved progress in localStorage; refresh resumes the game. Only one host window should control a game.
- Read-only TV display: open from the host, move the second window to a connected TV or mirror it. Both windows must use the same browser profile, device, and origin. A Fire TV/browser on a separate device does not synchronize. No Firebase database, account, or phone submissions are required or implemented.

## Host instructions
Open `game.html`, enter team names, choose a round length and timer, and start. Give teams paper and pens. Open the TV display, read each clue, start the timer, then reveal the year. Select each correct team once; select again to undo. Advance to the next question and finish with the leaderboard. Full screen depends on browser support. Browser storage must be available for recovery and TV synchronization.

## Pending
Who Said That?!, 60 Seconds to Midnight, Midnight Roulette, Most Likely in 2027, and Countdown Charades remain clearly labeled Coming Soon. Remote/device-to-device sessions, phone voting, and music clips are not implemented.

## Validation
Run `node --test trivia.test.js`. The deploy workflow runs the same logic tests before publishing. Browser verification also covered setup validation, HTML escaping, timer/pause/reload, TV synchronization, scoring/undo, full-round completion, winners/recovery, reset/cancel, and phone-width overflow. The pages require no build step. Fonts load from Google Fonts with local fallbacks.
