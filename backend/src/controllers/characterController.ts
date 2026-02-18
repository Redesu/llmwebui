import Character from "../models/Character.ts";
import { Request, Response } from "express";
import { CharacterAttributes } from "../types/CharacterAttributes.ts";
import { AppError } from "../utils/AppError.ts";
import path from "path";
import fs from "fs";

export const getCharacters = async (
	req: Request<CharacterAttributes>,
	res: Response,
) => {
	const characters = await Character.findAll({
		order: [["createdAt", "ASC"]],
	});
	res.json({ characters });
}

export const getCharacterById = async (
	req: Request<CharacterAttributes>,
	res: Response,
) => {
	const { id } = req.params;
	const character = await Character.findByPk(id);
	if (!character)
		throw new AppError("Character not found", 404);
	res.json({ character });
};

export const createCharacter = async (
	req: Request<CharacterAttributes>,
	res: Response,
) => {
	let { name, description, avatarUrl, story } = req.body;

	if (!name || typeof name !== "string" || !name.trim()) {
		throw new AppError("Name is required", 400);
	}

		const baseUrl = `${req.protocol}://${req.get("host")}`;
		const avatarPath = req.file
			? `${baseUrl}/uploads/avatars/${req.file.filename}`
			: avatarUrl || null;

	const character = await Character.create({
		name: name.trim(),
		description: description?.trim() || null,
		avatarUrl: avatarPath,
		story: story?.trim() || null,
	});
	res.status(201).json({ character });
};

export const updateCharacter = async (
	req: Request,
	res: Response,
) => {
	const { id } = req.params;
	const { id: _id, ...characterData } = req.body;

	const character = await Character.findByPk(id);
	if (!character)
		throw new AppError("Character not found", 404);

	if (characterData.name && typeof characterData.name === "string" && characterData.name.trim()) {
		character.name = characterData.name.trim();
	}

	if (req.file) {
		if (character.avatarUrl?.startsWith("/uploads/avatars/")) {
			const oldPath = path.join(
				__dirname,
				"../",
				character.avatarUrl,
			);

			if (fs.existsSync(oldPath)) {
				fs.unlinkSync(oldPath);
			}
		}

		const baseUrl = `${req.protocol}://${req.get("host")}`;
		character.avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;
	} else if (characterData.avatarUrl !== undefined) {
		character.avatarUrl = characterData.avatarUrl?.trim() || null;
	}

	character.description = characterData?.description?.trim() ?? null;
	character.story = characterData?.story?.trim() ?? null;

	await character.save();
	res.json({ character });
};

export const deleteCharacter = async (
	req: Request,
	res: Response,
) => {
	const { id } = req.params;

	const character = await Character.findByPk(id);
	if (!character)
		throw new AppError("Character not found", 404);

	await character.destroy();

	res.status(200).json({ message: "Character deleted successfully", id });
}