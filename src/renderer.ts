/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import { screen } from "electron";
import { ipcRenderer } from "electron-better-ipc";
import "./index.css";
const captureScreenshot = async () => {
  const sourceId = await ipcRenderer.callMain("get-source-id");
  const { width, height } = await ipcRenderer.callMain("get-screen-dimensions");
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: sourceId,
      },
    } as unknown,
  });
  const video = document.createElement("video");
  video.style.position = "absolute";
  video.style.top = "-10000px";
  video.style.left = "-10000px";

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      video.play();
      const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      video.remove();
      try {
        stream.getTracks()[0].stop();
      } catch (e) {
        console.log(e);
      }
      resolve(canvas);
    };
    video.srcObject = stream;
    document.body.appendChild(video);
  });
};

captureScreenshot();
