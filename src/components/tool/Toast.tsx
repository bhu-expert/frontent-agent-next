"use client";

interface Props {
  msg: string;
  visible: boolean;
}

export default function Toast({ msg, visible }: Props) {
  return (
    <div className={`t-toast${visible ? " show" : ""}`}>
      {msg}
    </div>
  );
}
