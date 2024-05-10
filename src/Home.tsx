import React from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  async function loadModel() {
    try {
      await window.ipc.startServer();
    } catch (error) {
      toast.error("Failed to start model");
    }
  }

  async function unloadModel() {
    try {
      await window.ipc.killServer();
    } catch (error) {
      toast.error("Failed to stop model");
    }
  }

  return (
    <div>
      <button onClick={loadModel}>Load model</button>
      <button onClick={unloadModel}>Unload</button>
    </div>
  );
}
