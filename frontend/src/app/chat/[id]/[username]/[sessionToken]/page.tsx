"use client";
import { useState } from "react";
import * as crypto from "crypto";

const ChatPage = ({
  params,
}: {
  params: { id: string; username: string; sessionToken: string };
}) => {
  const [messages, setMessages] = useState<
    { msg: string; cipherMsg: string }[]
  >([]);
  const [inputText, setInputText] = useState("");
  const [msgCount, setMsgCount] = useState(0);

  const handleReceiveMessage = (
    cipherMsg: string,
    count: number,
    msgSend: { msg: string; cipherMsg: string }
  ) => {
    const hashIv = crypto.createHash("sha256");

    hashIv.update(params.username + count);

    let iv = hashIv.digest("base64");

    count += 1;

    setMsgCount(count);

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      params.sessionToken,
      iv
    );

    const msg = decipher.update(cipherMsg, "hex", "utf8");

    const chat = { msg, cipherMsg };

    if (inputText.trim() !== "") {
      setMessages([...messages, msgSend, chat]);
      setInputText("");
    }
  };

  const handleSendMessage = async () => {
    const hashIv = crypto.createHash("sha256");

    let count = msgCount;

    hashIv.update(params.username + count);

    let iv = hashIv.digest("base64");

    count += 1;

    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      params.sessionToken,
      iv
    );

    const msg = cipher.update(inputText, "utf8", "hex");

    const data = {
      id: params.id,
      cipherMsg: msg,
    };

    const chat = {
      msg: inputText,
      cipherMsg: msg,
    };

    const res = await fetch("http://localhost:8000/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const newMsg = await res.json();
    console.log(newMsg);

    handleReceiveMessage(newMsg.newMsg, count, chat);
  };

  return (
    <main className="p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-700">Chat Criptografado</h1>
          <p className="text-xs text-gray-500">Usuário: {params.username}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className="p-3 rounded-lg shadow max-w-xs sm:max-w-md md:max-w-lg break-words bg-blue-500 text-white ml-auto"
            >
              <p className="text-sm">{message.msg}</p>
              <p className="text-xs opacity-70 mt-1">Cipher: {message.cipherMsg.substring(0,30)}...</p>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-center text-gray-500">Nenhuma mensagem ainda. Comece a conversa!</p>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              className="flex-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-150 ease-in-out hover:shadow-md"
              placeholder="Digite sua mensagem..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            />
            <button
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transform hover:-translate-y-px active:translate-y-0 active:shadow-inner"
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChatPage;
