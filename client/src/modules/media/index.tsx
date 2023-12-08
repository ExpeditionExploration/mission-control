import React, { useEffect, useRef, useState } from "react";
import { Module, Location } from "../../types";
import clsx from "clsx";
import { hostname } from "../../env";

export const Media: Module = ({ events, on, emit }) => {
  const videoSteamSocket = useRef<WebSocket>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function connectVideoStream() {
    console.log("Connecting video stream");
    if (
      !videoSteamSocket.current ||
      videoSteamSocket.current?.readyState == WebSocket.CLOSED
    ) {
      const socket = new WebSocket(`ws://${hostname}:16502`);

      const canvas = canvasRef.current as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      const img = new Image();
      img.onload = function () {
        let width = img.width;
        let height = img.height;

        canvas.width = width;
        canvas.height = height;

        // get the scale
        // it is the min of the 2 ratios
        let scale_factor = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );

        // Lets get the new width and height based on the scale factor
        let newWidth = img.width * scale_factor;
        let newHeight = img.height * scale_factor;

        // get the top left position of the image
        // in order to center the image within the canvas
        let x = canvas.width / 2 - newWidth / 2;
        let y = canvas.height / 2 - newHeight / 2;

        // When drawing the image, we have to scale down the image
        // width and height in order to fit within the canvas
        ctx.drawImage(img, x, y, newWidth, newHeight);
        // ctx?.drawImage(img, 0, 0);
      };

      socket.binaryType = "arraybuffer";
      socket.onmessage = (event) => {
        var blob = new Blob([event.data], { type: "image/jpeg" });
        img.src = URL.createObjectURL(blob);
      };

      socket.onopen = (event) => {
        console.debug("Media stream connected");
      };

      socket.onclose = (event) => {
        console.debug("Media stream closed, retrying in 1s");
        setTimeout(() => connectVideoStream(), 1000);
      };

      console.debug("Setting stream socket", socket);
      videoSteamSocket.current = socket;
    }
  }

  useEffect(() => {
    // const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    connectVideoStream();
    return () => {
      console.debug("Cleaning up");
      if (videoSteamSocket.current) {
        console.debug("Cleaning up socket", videoSteamSocket.current);
        videoSteamSocket.current.onclose = null;
        videoSteamSocket.current.onopen = null;
        videoSteamSocket.current.onmessage = null;
        videoSteamSocket.current.close();
        videoSteamSocket.current = undefined;
      }
    };
  }, []);

  return (
    <div
      id="viewer"
      className="fixed z-0 flex justify-center items-stretch inset-0"
    >
      <canvas ref={canvasRef} id="canvas"></canvas>
    </div>
  );
};

Media.location = Location.Window;
