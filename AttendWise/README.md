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


## v4 fix
The subject-card template now explicitly renders the **✕ Absent +1** button. The card footer also uses a responsive grid so the four actions (Edit, Attended, Absent, Delete) remain visible on desktop and wrap cleanly on smaller screens.

\n## v5 fixes\n- Fixed stale Service Worker caching that could keep an older JavaScript file in the browser.\n- Forced asset versioning so the **Absent +1** button appears immediately after updating.\n- Added stronger responsive breakpoints for tablets and phones.\n- Subject action buttons use a responsive 4-column/2-column/1-column layout without clipping.\n