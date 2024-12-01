import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const saveSubscription = async (subscription) => {
  const response = await fetch(
    "https://192.168.0.102:3000/save-push-subscription",
    {
      method: "post",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(subscription),
    }
  );

  return response.json();
};

self.addEventListener("activate", async (e) => {
  const subscription = await self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      (await (await fetch("https://192.168.0.102:3000/public-key")).json()).key
    ),
  });
  const response = await saveSubscription(subscription);
});

let getVersionPort;
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INIT_PORT") {
    getVersionPort = event.ports[0];
  }
});

self.addEventListener("push", (e) => {
  const payload = e.data.json() ?? "";
  if (payload.data) {
    getVersionPort.postMessage(payload);
  } else {
    e.waitUntil(
      self.registration.showNotification(payload.title, {
        body: payload.message,
      })
    );
  }
});
