import Message from "../models/Message.ts";
import Chat from "../models/Chat.ts";
import llmService from "../services/llmService.ts";
import { MessageAttributes } from "../types/MessageAttributes.ts";
import { Request, Response, NextFunction } from "express";
import { Role } from "../types/Role.ts";
import Character from "../models/Character.ts";
import { Readable } from "stream";
import handleLLMStream from "../utils/handleLLMStream.ts";
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
	if (!llmStream)
		throw new AppError("LLM service unavailable", 500);

	await handleLLMStream(res, llmStream, chatId, character.id);
};

export const updateMessage = async (req: Request, res: Response) => {
	const { id } = req.params;
	const chatId = parseInt(req.params.chatId, 10);
	if (!chatId || !id)
		throw new AppError("Chat ID and Message ID are required", 400);

	const message = await Message.findByPk(id);
	if (!message)
		throw new AppError("Message not found", 404);

	const { text, params, character } = req.body;

	message.text = text;
	await message.save();

	if (message.role !== Role.User) return res.json({ message });

	const llmStream = await llmService.sendMessage(text, params, character);
	if (!llmStream)
		throw new AppError("LLM service unavailable", 500);

	await handleLLMStream(res, llmStream, chatId, character.id);
};

export const deleteMessage = async (req: Request, res: Response) => {
	const { chatId, id } = req.params;
	if (!chatId)
		throw new AppError("Chat ID is required", 400);

	const message = await Message.findByPk(id);
	if (!message)
		throw new AppError("Message not found", 404);

	await message.destroy();

	res.status(200).json({ message });
};
