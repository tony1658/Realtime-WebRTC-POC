"use client";
import { Peer } from "peerjs";

import { useEffect, useState, useRef, type MutableRefObject } from "react";

export default function Home() {
  const peerRef = useRef<undefined | Peer>();

  const [message, setMessage] = useState<string>();

  const [peerId, setPeerId] = useState<string>();
  const [friendId, setFriendId] = useState<string>();

  const [messageList, setMessageList] = useState<String[]>([]);

  const closeConnection = (peerRef: MutableRefObject<undefined | Peer>) => {
    if (peerRef.current) {
      peerRef.current.disconnect();
      peerRef.current.destroy();
    }
    peerRef.current = undefined;
    setPeerId(undefined);
  };

  const sendMessage = () => {
    if (peerRef.current && friendId) {
      const connection = peerRef.current.connect(friendId);
      connection.on("open", () => {
        connection.send(message);
        setMessage("");
      });
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // PeerJS only works on the clientside, so return early.
      if (peerRef.current === undefined) {
        peerRef.current = new Peer();
        peerRef.current.on("open", (id) => {
          setPeerId(id);
        });
        peerRef.current.on("connection", (conn) => {
          conn.on("data", (data) => {
            if (typeof data === "string") {
              setMessageList((previousMessageList) => [
                ...previousMessageList,
                data,
              ]);
            }
          });
        });
      }
      console.log(peerRef.current.eventNames());
    }
    return () => {
      if (typeof window !== "undefined") {
        // PeerJS only works on the clientside, so return early.
        closeConnection(peerRef);
      }
    };
  }, []);
  return (
    <main className="grid place-items-center">
      <h1 className="font-semibold">
        Open a new browser tab. Copy and enter the your ID and paste it into the
        Friend ID input. Your message should appear in the message list. Enter a
        message and click on send to test out the proof of concept.
      </h1>
      <h1>Your ID: {peerId}</h1>
      <label>
        Friend Id{" "}
        <input
          className="border-2"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
          name="connectionId"
        />
      </label>
      <br />
      <label>
        Message{" "}
        <input
          className="border-2"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          name="message"
        />
      </label>
      <button
        className="border-2"
        onClick={() => {
          setMessage("");
          sendMessage();
        }}
      >
        Send
      </button>
      <h1>Message List</h1>
      {messageList.map((message, index) => {
        return <li key={index}>{message}</li>;
      })}
    </main>
  );
}
