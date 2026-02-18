import Message from "../models/Message.ts";
import Chat from "../models/Chat.ts";
import llmService from "../services/llmService.ts";
import { MessageAttributes } from "../types/MessageAttributes.ts";
import { Request, Response, NextFunction } from "express";
import { Role } from "../types/Role.ts";
import Character from "../models/Character.ts";
import { Readable } from "stream";
import { AppError } from "../utils/AppError.ts";

export const getMessages = async (
	req: Request<MessageAttributes>,
	res: Response,
) => {
	const { chatId } = req.params;
	if (!chatId)
		throw new AppError("Chat ID is required", 400);

	const messages = await Message.findAll({
		where: { chatId },
		include: [
			{
				model: Character,
				as: "character",
				paranoid: false,
			},
		],
		order: [["createdAt", "ASC"]],
	});
	res.json({ messages });
};

export const getMessageById = async (
	req: Request<MessageAttributes>,
	res: Response,
) => {
	const { chatId, id } = req.params;
	if (!chatId)
		throw new AppError("Chat ID is required", 400);

	const message = await Message.findOne({
		where: { chatId, id },
		include: [
			{
				model: Character,
				as: "character",
			},
		],
	});
	if (!message)
		throw new AppError("Message not found", 404);

	res.json({ message });
};

export const sendMessage = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const chatId = parseInt(req.params.chatId, 10);
	if (isNaN(chatId)) {
		throw new AppError("Invalid chat ID", 400);
	}

	const { text, params, character } = req.body;

	await Message.create({
		text,
		role: Role.User,
		characterId: character.id,
		chatId,
	});

	await Chat.update({}, { where: { id: chatId }, silent: false });

	const llmStream = await llmService.sendMessage(text, params, character);

	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");

	const stream = Readable.fromWeb(llmStream as any);
	let llmResponseText = "";
	const decoder = new TextDecoder();

	stream.on('data', (chunk) => {
		res.write(chunk);
		llmResponseText += decoder.decode(chunk);
	});

	stream.on('error', (err) => {
        next(err);
    });

	stream.on('end', async () => {
		const cleanText = llmResponseText
			.split('\n')
			.filter(line => line.startsWith('data: '))
			.map(line => {
				const jsonStr = line.replace('data: ', '').trim();
				if (jsonStr === '[DONE]') return null;
				try {
					return JSON.parse(jsonStr).choices[0].delta.content;
				} catch {
					return null;
				}
			})
			.filter(Boolean)
			.join('');

		if (cleanText) {
			await Message.create({
				text: cleanText,
				role: Role.Assistant,
				characterId: character.id,
				chatId,
			});
		}
		res.end();
	});
};