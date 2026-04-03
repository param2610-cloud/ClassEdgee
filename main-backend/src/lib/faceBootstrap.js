import { consumeFaceResults, getFaceQueueChannel } from "./faceQueue.js";
import { processFaceResultMessage } from "./faceResultProcessor.js";

let started = false;

export const startFaceInfrastructure = async () => {
  if (started) {
    return;
  }

  await getFaceQueueChannel();
  await consumeFaceResults(processFaceResultMessage);
  started = true;
};
