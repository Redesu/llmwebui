import { useState, useEffect } from "react";
import { Message } from "../types/message";
import { Role } from "../types/role";
import { Settings } from "./useSettings";
import { Chat } from "../types/chat";
import { Character } from "../types/character";

export default function useChat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [history, setHistory] = useState<Chat[]>([]);
	const [chatId, setChatId] = useState<number | null>(null);

	const loadChats = async () => {
		try {
			const res = await fetch("/api/v1/chats");
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to load chat history");
			}
			const data = await res.json();
			const chats: Chat[] = data.chats || [];
			setHistory(chats);

			if (chats.length === 0) return;

			const latestChatId = chats[0].id;
			await loadMessages(latestChatId);
			setChatId(latestChatId);
		} catch (err) {
			console.error(err);
		}
	};

	const createChat = async () => {
		try {
			const createRes = await fetch("/api/v1/chats", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "New Chat..." }),
			});
			if (!createRes.ok) {
				const errorData = await createRes.json().catch(() => ({}));
				throw new Error(errorData.error || "Could not create new chat");
			}
			const createData = await createRes.json();
			const newChat = createData.chat;
			const newChatId = newChat.id;


			const finalTitle = `Chat #${newChatId}`;
			await fetch(`/api/v1/chats/${newChatId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: finalTitle }),
			});

			setChatId(newChatId);
			await loadChats();
			setMessages([]);
			return newChatId;
		} catch (err) {
			alert(err instanceof Error ? err.message : "Error creating chat");
			return null;
		}
	};

	const deleteChat = async (id: number) => {
		try {
			if (!id) return;

			const isDeletingCurrent = id === chatId;
			const currentIndex = history.findIndex((c) => c.id === id);

			const res = await fetch(`/api/v1/chats/${id}`, { method: "DELETE" });
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to delete chat");
			}

			const updatedHistory = history.filter((c) => c.id !== id);
			setHistory(updatedHistory);

			if (!isDeletingCurrent) return;

			const nextChatId =
				updatedHistory[currentIndex]?.id ||
				updatedHistory[currentIndex - 1]?.id ||
				updatedHistory[0]?.id ||
				null;

			setChatId(nextChatId);
			await loadMessages(nextChatId);
		} catch (err) {
			alert(err instanceof Error ? err.message : "Delete failed");
		}
	};

	const loadMessages = async (id: number | null) => {
		if (!id) {
			setMessages([]);
			return;
		}
		try {
			const res = await fetch(`/api/v1/chats/${id}/messages`);
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to load messages");
			}
			const data = await res.json();
			setMessages(data.messages || []);
			setChatId(id);
		} catch (err) {
			console.error("Load messages error:", err);
			setMessages([]);
		}
	};

	const sendMessage = async (
		text: string,
		params: Settings,
		character: Character,
	) => {
		const currentChatId = chatId ?? (await createChat());
		if (!currentChatId) return;

		const userMessage: Message = {
			id: crypto.randomUUID(),
			role: Role.User,
			text,
			character,
		};
		setMessages((prev) => [...prev, userMessage]);

		try {
			const res = await fetch(`/api/v1/chats/${currentChatId}/messages`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text, params, character }),
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || `Server Error: ${res.statusText}`);
			}

			if (!res.body) throw new Error("No response body");

			const assistantMessage: Message = {
				id: crypto.randomUUID(),
				role: Role.Assistant,
				text: "",
				character,
			};
			setMessages((prev) => [...prev, assistantMessage]);

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					await loadChats();
					break;
				}

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (!line.startsWith("data: ")) continue;
					const jsonStr = line.substring(6).trim();
					if (jsonStr === "[DONE]") continue;

					try {
						const parsed = JSON.parse(jsonStr);
						const content = parsed.choices?.[0]?.delta?.content || "";

						setMessages((prev) =>
							prev.map((msg) =>
								msg.id === assistantMessage.id
									? { ...msg, text: msg.text + content }
									: msg,
							),
						);
					} catch (e) {
						console.warn("Stream parse error", e);
					}
				}
			}
		} catch (err) {
			alert(err instanceof Error ? err.message : "Message failed to send");
			
			setMessages((prev) => 
				prev.filter((m) => m.id !== userMessage.id)
			);
		}
	};

	useEffect(() => {
		loadChats();
	}, []);

	return {
		messages,
		history,
		chatId,
		createChat,
		deleteChat,
		loadMessages,
		sendMessage,
	};
}