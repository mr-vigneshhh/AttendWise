# AttendWise v3

Added:
- Attended +1
- Absent +1
- Instant percentage/risk updates
- Rapid-click protection
- Redesigned reminders with date/time, countdown, cancel, duplicate prevention and notification status
- PWA manifest + Service Worker

Run:
```bash
python -m http.server 8000
```
Open http://localhost:8000.

Browser-only timers cannot guarantee notifications after a browser fully kills the app. Guaranteed closed-app delivery needs Web Push + a backend scheduler.
