if ("serviceWorker" in navigator) {
  const messageChannel = new MessageChannel();
  navigator.serviceWorker.controller?.postMessage(
    {
      type: "INIT_PORT",
    },
    [messageChannel.port2]
  );

  messageChannel.port1.onmessage = (event) => {
    // update data got from server
    const data = event.data;

    // Your Code goes here
    console.log(data);

    
  };
}

if (!('serviceWorker' in navigator)) {
  throw new Error("No support for service worker!")
}

if (!('Notification' in window)) {
  throw new Error("No support for notification API");
}

if (!('PushManager' in window)) {
  throw new Error("No support for Push API")
}

// Cut this part
export async function requestPermission(){
  const permission = await Notification.requestPermission();

  if (permission !== 'granted') {
      throw new Error("Notification permission not granted")
  }
}