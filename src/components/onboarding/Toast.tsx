"use client";

import { ToastProps } from "@/props/Toast";

/**
 * Lightweight toast notification that slides in/out with a message.
 */
export default function Toast({ msg, visible }: ToastProps) {
  return (
    <div className={`t-toast${visible ? " show" : ""}`}>
      {msg}
    </div>
  );
}
