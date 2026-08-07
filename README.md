# AttendWise v2

Updated hackathon MVP:
- One-tap **Attended +1** on every subject card
- Instant percentage/progress/status updates
- LocalStorage persistence and rapid-click protection
- One-time class reminders with cancellation and duplicate prevention
- Browser notification permission handling
- Local timezone formatting
- PWA manifest + Service Worker offline shell

## Run
Use a local server:
```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

## Reminder limitation
The MVP schedules notifications with `setTimeout()`, so it works reliably while the app/page remains active. Browsers can suspend timers when an app is fully closed/backgrounded. Guaranteed closed-app delivery requires Web Push plus a backend scheduler/cron service.
