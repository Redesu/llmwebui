import Chat from "../models/Chat.ts";
import { Request, Response } from "express";
import { ChatAttributes } from "../types/ChatAttributes.ts";
import { AppError } from "../utils/AppError.ts";

export const getChats = async (req: Request<ChatAttributes>, res: Response) => {
	const chats = await Chat.findAll({
		order: [["updatedAt", "DESC"]],
	});
	res.json({ chats });
};

export const getChatById = async (
	req: Request<ChatAttributes>,
	res: Response,
) => {
	const { id } = req.params;
	const chat = await Chat.findByPk(id);
	if (!chat) throw new AppError("Chat not found", 404);
	res.json({ chat });
};

export const createChat = async (
	req: Request<ChatAttributes>,
	res: Response,
) => {
	let { title } = req.body;

	if (!title || typeof title !== "string" || !title.trim()) {
		title = "Untitled Chat"; // localization needed
	}

	const chat = await Chat.create({
		title: title.trim(),

	});
	res.status(201).json({ chat });
};

export const deleteChat = async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!id) throw new AppError("Chat ID is required", 400);

	const chat = await Chat.findByPk(id);
	if (!chat) throw new AppError("Chat not found", 404);

	await chat.destroy();

	res.status(200).json({ message: "Chat deleted successfully", id });
};

export const updateChat = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { title } = req.body;

	if (!id) throw new AppError("Chat ID is required", 400);
	if (!title || typeof title !== "string" || !title.trim()) {
		throw new AppError("A valid title is required", 400);
	}

	const chat = await Chat.findByPk(id);
	if (!chat) throw new AppError("Chat not found", 404);

	chat.title = title.trim();
	await chat.save();

	res.status(200).json({ chat });
};
