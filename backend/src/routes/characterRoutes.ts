import { Router } from "express";
import {
	getCharacters,
	getCharacterById,
	createCharacter,
	deleteCharacter,
	updateCharacter,
} from "../controllers/characterController.ts";
import { upload } from "../upload.ts";

const router = Router();

router.get("/", getCharacters);
router.get("/:id", getCharacterById);
router.post("/", upload.single("avatar"), createCharacter);
router.delete("/:id", deleteCharacter);
router.put("/:id", upload.single("avatar"), updateCharacter);

export default router;
