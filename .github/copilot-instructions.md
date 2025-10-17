### Quick repository briefing for AI assistants

This is a small Spring Boot application that acts as a STOMP-over-WebSocket message broker plus a tiny HTML5/JS client to exercise it.

Primary purpose
- Educational lab for collaborative drawing via STOMP/WebSockets. The server exposes a SockJS endpoint and a simple topic broker; the client connects, subscribes and publishes drawing events.

Big-picture architecture
- Server: Java Spring Boot application in `src/main/java/edu/eci/arsw/collabpaint`.
  - `CollabPaintApplication.java` — Spring Boot entry point.
  - `CollabPaintWebSocketConfig.java` — WebSocket/STOMP configuration: enables a simple broker under `/topic` and sets application prefix `/app`. SockJS endpoint is `/stompendpoint`.
  - `model/Point.java` — POJO used as the message payload (fields: `x`, `y`).
- Client: static files in `src/main/resources/static`.
  - `index.html` — simple page that loads WebJars for jQuery, SockJS and STOMP, and `app.js`.
  - `app.js` — client logic: builds a `Point` object, draws to `<canvas>`, connects to `/stompendpoint`, and currently subscribes to `/topic/TOPICXX` (exercise placeholder).

Key runtime conventions and topics
- STOMP endpoints:
  - SockJS connect: `/stompendpoint` (server registers this).
  - Broker prefix: `/topic` (messages published by server to clients).
  - Application prefix: `/app` (client -> server endpoints handled by @MessageMapping controllers).
- Message shape: JSON representing `Point` with integer fields `x` and `y`. Example: `{ "x": 10, "y": 20 }`.

Developer workflows (fast commands, Windows / PowerShell)
- Build and run the app locally (uses Maven wrapper):

```powershell
.\mvnw.cmd clean package
.\mvnw.cmd spring-boot:run
```

- The app serves static content at `http://localhost:8080/` by default.

Project-specific patterns and gotchas for agents
- The project uses Spring's simple message broker (configured in `CollabPaintWebSocketConfig`). Do not assume a full STOMP broker (RabbitMQ) exists.
- Client `app.js` contains placeholders that exercises expect you to change:
  - `connectAndSubscribe()` currently subscribes to `/topic/TOPICXX` — tests and READMEs expect `/topic/newpoint` (or dynamic topics like `/topic/newpoint.{id}`).
  - `publishPoint(px,py)` draws locally then must publish using `stompClient.send(...)` with `JSON.stringify(pt)` to the configured topic.
- Message routing in later exercises may require publishing to `/app/newpoint.{id}` so the server controller can re-publish to `/topic/newpoint.{id}` — watch the README for Part III/IV instructions.

Files to inspect when changing behavior
- WebSocket config: `src/main/java/edu/eci/arsw/collabpaint/CollabPaintWebSocketConfig.java`
- Client JS: `src/main/resources/static/app.js` (connect/subscribe/publish functions) and `index.html` (UI inputs & canvas)
- Model: `src/main/java/edu/eci/arsw/collabpaint/model/Point.java`

Testing and manual verification
- Open multiple browser tabs (or incognito windows) to `http://localhost:8080/` and perform drawing actions. The expected behavior for exercises:
  - Part I: sending points from inputs publishes to `/topic/newpoint` and all tabs receive them.
  - Part II: mouse/touch events draw points and publish them.
  - Part III/IV: dynamic topics and server-side handling use `/app/newpoint.{id}` and `/topic/newpolygon.{id}` as described in README.

Examples (concrete snippets from this repo)
- Subscribe example (replace placeholder in `app.js`):
```javascript
stompClient.subscribe('/topic/newpoint', function(message){
  var pt = JSON.parse(message.body);
  addPointToCanvas(pt);
});
```

- Publish example (use in `publishPoint`):
```javascript
var pt = new Point(px,py);
stompClient.send('/topic/newpoint', {}, JSON.stringify(pt));
```

If modifying server behavior
- Add controllers under `edu.eci.arsw.collabpaint` and use `@MessageMapping("/newpoint.{num}")` for app destinations. Inject `SimpMessagingTemplate` to re-publish to `/topic/newpoint{num}`.

When you are unsure
- Prefer changing `app.js` and `index.html` first: smaller surface and easy to test in browser.
- If tests or runtime fail after edits, run `mvnw.cmd spring-boot:run` and check console logs (server prints are useful — Point.toString() exists).

What I left out / questions for the maintainer
- Preferred port (default 8080 is used). If you use a different port in CI, tell the agent.
- Any CI/test commands beyond the Maven wrapper.

Please review this file and tell me if you want more detail on: preferred run flags, additional topics, or CI steps.
