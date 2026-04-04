import amqp from "amqplib";

export const FACE_REGISTER_QUEUE = "face.register";
export const FACE_RECOGNIZE_QUEUE = "face.recognize";
export const FACE_RESULTS_QUEUE = "face.results";

let channelPromise = null;
let consumerStarted = false;

const assertFaceQueues = async (channel) => {
  await channel.assertQueue(FACE_REGISTER_QUEUE, { durable: true });
  await channel.assertQueue(FACE_RECOGNIZE_QUEUE, { durable: true });
  await channel.assertQueue(FACE_RESULTS_QUEUE, { durable: true });
};

export const getFaceQueueChannel = async () => {
  if (!channelPromise) {
    channelPromise = (async () => {
      const rabbitUrl =
        process.env.RABBITMQ_URL || "amqp://classedgee:classedgee@localhost:5672";
      const connection = await amqp.connect(rabbitUrl);
      const channel = await connection.createChannel();

      channel.on("error", (error) => {
        console.error("Face queue channel error:", error.message);
      });

      connection.on("error", (error) => {
        console.error("Face queue connection error:", error.message);
      });

      connection.on("close", () => {
        // Let the next request rebuild the connection.
        channelPromise = null;
      });

      await assertFaceQueues(channel);
      return channel;
    })().catch((error) => {
      channelPromise = null;
      throw error;
    });
  }

  return channelPromise;
};

export const publishFaceJob = async (queueName, payload) => {
  const channel = await getFaceQueueChannel();
  await assertFaceQueues(channel);

  return channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
    contentType: "application/json",
    persistent: true,
  });
};

export const consumeFaceResults = async (handler) => {
  if (consumerStarted) {
    return;
  }

  const channel = await getFaceQueueChannel();
  await channel.prefetch(1);
  await assertFaceQueues(channel);

  await channel.consume(
    FACE_RESULTS_QUEUE,
    async (message) => {
      if (!message) {
        return;
      }

      try {
        const payload = JSON.parse(message.content.toString());
        await handler(payload);
        channel.ack(message);
      } catch (error) {
        console.error("Failed to process face result message:", error.message);
        channel.nack(message, false, false);
      }
    },
    { noAck: false }
  );

  consumerStarted = true;
};
