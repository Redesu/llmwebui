import Character from "../models/Character.ts";
import { Request, Response } from "express";
import { CharacterAttributes } from "../types/CharacterAttributes.ts";
import { AppError } from "../utils/AppError.ts";

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
	const character = await Character.create({
		name: name.trim(),
		description: description?.trim() || null,
		avatarUrl: avatarUrl?.trim() || null,
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

	character.description = characterData?.description?.trim() ?? null
	character.avatarUrl = characterData?.avatarUrl?.trim() ?? null
	character.story = characterData?.story?.trim() ?? null

	await character.update(characterData);
	res.json({ character });
}

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