/* Fleet Identifier Admin — Phase 5.0 push service worker */

self.addEventListener("push", event => {
  let payload = {
    title: "Fleet Identifier Admin",
    body: "You have a new admin notification.",
    url: "./admin.html"
  };

  if (event.data) {
    try {
      payload = {
        ...payload,
        ...event.data.json()
      };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || "./apple-touch-icon.png",
      badge: payload.badge || "./apple-touch-icon.png",
      data: {
        url: payload.url || "./admin.html"
      }
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "./admin.html",
    self.location.origin
  ).href;

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true
      })
      .then(windowClients => {
        for (const client of windowClients) {
          if (
            client.url.startsWith(self.location.origin) &&
            "focus" in client
          ) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        return clients.openWindow
          ? clients.openWindow(targetUrl)
          : undefined;
      })
  );
});
