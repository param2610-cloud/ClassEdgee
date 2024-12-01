import webpush from "web-push";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config();

const updatesQueue = [[], []];
const notificationQueue = [[], []];

const prisma = new PrismaClient();

function addToNotificationQueue(title, message, list, p) {
  if (p == 2) {
    executeHighPriorityNotification({ title, message, list });
    return;
  }
  notificationQueue[p].push({ title, message, list });
}

function addToUpdateQueue(data, updateId, updateName, list, p) {
  if (p == 2) {
    executeHighPriorityUpdate({ data, updateId, updateName, list });
    return;
  }
  updatesQueue[p].push({ data, updateId, updateName, list });
}

function postmaster(
  { isNotification, title, message, data, updateId, updateName, p },
  list
) {
  if (!list) throw new Error("List is required for postmaster");
  if (!Array.isArray(list)) list = [list];

  if (isNotification) {
    if (!title) throw new Error("Title is required for notification");
    if (!message) throw new Error("Message is required for notification");

    addToNotificationQueue(title, message, list, Math.max(0, Math.min(p, 2)));
  } else {
    if (!data) throw new Error("Data is required for update");
    if (!updateId) throw new Error("updateId is required for update");
    if (!updateName) throw new Error("updateName is required for update");

    addToUpdateQueue(
      data,
      updateId,
      updateName,
      list,
      Math.max(0, Math.min(p, 2))
    );
  }
}

function executeHighPriorityNotification(notification) {
  const { title, message, list } = notification;
  send(JSON.stringify({ title, message }), list);
}

function executeHighPriorityUpdate(update) {
  const { data, updateId, updateName, list } = update;
  send(JSON.stringify({ data, updateName, updateId }), list);
}

function executeLowPriority() {
  const notifications = notificationQueue[0];
  let to = Math.min(notifications.length - 1, 9);

  let nf,
    i = 0;
  while ((nf = notifications.pop())) {
    const { title, message, list } = nf;
    send(JSON.stringify({ title, message }), list);
    if (i == to) break;
    i++;
  }

  const updates = updatesQueue[0];
  (to = Math.min(updates.length - 1, 9)), (i = 0);
  let up;
  while ((up = updates.pop())) {
    const { data, updateName, updateId, list } = up;
    send(JSON.stringify({ data, updateName, updateId }), list);
    if (i == to) break;
    i++;
  }
}

function executeMediumPriority() {
  const notifications = notificationQueue[1];
  let to = Math.min(notifications.length - 1, 20);

  let nf,
    i = 0;
  while ((nf = notifications.pop())) {
    const { title, message, list } = nf;
    send(JSON.stringify({ title, message }), list);
    if (i == to) break;
    i++;
  }

  const updates = updatesQueue[1];
  (to = Math.min(updates.length - 1, 20)), (i = 0);
  let up;
  while ((up = updates.pop())) {
    const { data, updateName, updateId, list } = up;
    send(JSON.stringify({ data, updateName, updateId }), list);
    if (i == to) break;
    i++;
  }
}

const apiKeys = {
  publicKey: process.env.WEB_PUSH_PUBLIC_KEY,
  privateKey: process.env.WEB_PUSH_PRIVATE_KEY,
};

webpush.setVapidDetails(
  process.env.WEB_PUSH_CONTACT,
  apiKeys.publicKey,
  apiKeys.privateKey
);

let fetchAddress = null;

function setFetchAddress(fn) {
  fetchAddress = fn;
}

async function send(payload, list) {
  if (fetchAddress == null) throw new Error("fetchAddress function is not set");

  const addresses = fetchAddress(list);

  async function pushPayload(address) {
    if (!Array.isArray(address)) address = [address];
    address.forEach((e) => {
      console.log("sending message");
      return webpush.sendNotification(e, payload);
    });
  }

  await Promise.all(addresses.map(pushPayload));
}

const n1 = setInterval(executeMediumPriority, 5000);
const n2 = setInterval(executeLowPriority, 10000);

function setup(app) {
  app.get("/public-key", (req, res) => {
    try {
      res.json({ key: apiKeys.publicKey });
    } catch (err) {
      console.error(err);
    }
  });

  app.post("/save-push-subscription", (req, res) => {
    try {
      if (saveFunction == null) throw new Error("Save function is not set");
      saveFunction(JSON.stringify(req.body), req);
      res.json({ status: "Success", message: "Subscription saved!" });
    } catch (err) {
      console.error(err);
    }
  });
}

let saveFunction = null;
function setSaveFunction(fn) {
  saveFunction = fn;
}
setFetchAddress(async (userIds) => {
  return await prisma.UserPushStreams.findMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });
});
setSaveFunction(async (address, req) => {
  await prisma.UserPushStreams.create({
    data: {
      userId: req.query.id,
      address: address,
    },
  });
});

export { postmaster, setFetchAddress, setup, setSaveFunction };
