/* eslint-disable no-unused-vars */
import { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
import { formateMessageTime } from "../lib/utils";
import toast from "react-hot-toast";

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const { axios, authUser, socket } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollEnd = useRef();

  /* ===============================
     AUTO SCROLL TO LAST MESSAGE
  =============================== */
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===============================
     FETCH MESSAGES
  =============================== */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!selectedUser) return;

        const { data } = await axios.get(`/api/messages/${selectedUser._id}`);
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        toast.error("Failed to load messages");
      }
    };

    fetchMessages();
  }, [selectedUser]);

  /* ===============================
     SOCKET LISTENER
  =============================== */
  useEffect(() => {
    if (!socket.current) return;

    const handleReceiveMessage = (message) => {
      if (
        message.sender === selectedUser?._id ||
        message.receiver === selectedUser?._id
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.current.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.current.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedUser]);

  /* ===============================
     SEND MESSAGE
  =============================== */
  const handleSendMessage = async () => {
    if (!newMessage && !selectedImage) return;

    try {
      if (selectedImage) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          await sendMessageToServer(reader.result);
        };
        reader.readAsDataURL(selectedImage);
      } else {
        await sendMessageToServer(null);
      }
    } catch (error) {
      toast.error("Message send failed");
    }
  };

  const sendMessageToServer = async (image) => {
    if (!selectedUser) return;

    try {
      const { data } = await axios.post(`/api/messages/${selectedUser._id}`, {
        text: newMessage,
        image,
      });

      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        socket.current?.emit("sendMessage", data.data);
        setNewMessage("");
        setSelectedImage(null);
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  /* ===============================
     UI
  =============================== */
  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
        <img src={assets.logo_icon} className="max-w-16" alt="" />
        <p className="text-lg font-medium text-white">Chat AnyTime, AnyWhere</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden relative flex flex-col">
      {/* HEADER */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-gray-700">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 h-8 rounded-full object-cover"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden w-6 cursor-pointer"
        />
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.sender === authUser._id;

          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {!isMe && (
                <img
                  src={selectedUser.profilePic || assets.avatar_icon}
                  className="w-7 h-7 rounded-full"
                  alt=""
                />
              )}

              <div>
                {msg.image && (
                  <img
                    src={msg.image}
                    alt=""
                    className="max-w-xs rounded-lg mb-1"
                  />
                )}

                {msg.text && (
                  <p
                    className={`px-3 py-2 rounded-lg text-sm break-words ${
                      isMe
                        ? "bg-violet-600 text-white rounded-br-none"
                        : "bg-gray-700 text-white rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-1">
                  {formateMessageTime(msg.createdAt)}
                </p>
              </div>

              {isMe && (
                <img
                  src={authUser.profilePic || assets.avatar_icon}
                  className="w-7 h-7 rounded-full"
                  alt=""
                />
              )}
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* INPUT AREA */}
      <div className="flex items-center gap-3 p-3 border-t border-gray-700">
        <div className="flex-1 flex items-center bg-gray-800 px-3 rounded-full">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Send a message..."
            className="flex-1 bg-transparent text-sm p-3 outline-none text-white"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />

          <input
            type="file"
            id="image"
            hidden
            accept="image/png, image/jpeg"
            onChange={(e) => setSelectedImage(e.target.files[0])}
          />

          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 cursor-pointer"
            />
          </label>
        </div>

        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          className="w-7 cursor-pointer"
          alt=""
        />
      </div>
    </div>
  );
};

export default ChatContainer;
