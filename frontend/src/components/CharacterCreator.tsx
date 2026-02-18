import { useState } from "react";
import { VIEW } from "../shared/view";
import { Character } from "../types/character";
import CharacterForm from "./CharacterForm";

type CreateCharacterFunc = (
	characterData: Omit<Character, "id"> | FormData,
) => void;

export default function CharacterCreator({
	createCharacter,
	setView,
}: {
	createCharacter: CreateCharacterFunc;
	setView: (view: VIEW) => void;
}) {
	const [formData, setFormData] = useState<Omit<Character, "id">>({
		name: "",
		description: "",
		avatarUrl: "",
		story: "",
	});

	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleAvatarChange = (file: File | null, url?: string) => {
		setAvatarFile(file);
		setFormData({
			...formData,
			avatarUrl: url || "",
		});
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!formData.name.trim()) {
			alert("Name is required.");
			return;
		}

		const data = new FormData();

		data.append("name", formData.name.trim());
		data.append("description", formData.description || "");
		data.append("story", formData.story || "");

		if (avatarFile) data.append("avatar", avatarFile);
		if (formData.avatarUrl) data.append("avatarUrl", formData.avatarUrl);

		createCharacter(data);
		setView(VIEW.CHAT);
	};

	return (
		<form
			className="flex-1 p-6 flex flex-col rounded-xl"
			onSubmit={handleSubmit}
		>
			<h1 className="text-2xl font-bold mb-4">Create New Character</h1>

			<CharacterForm
				formData={formData}
				onFormChange={handleChange}
				onAvatarChange={handleAvatarChange}
				isCreator={true}
			/>

			<div className="flex gap-4">
				<button
					type="button"
					onClick={() => setView(VIEW.CHAT)}
					className="px-5 py-2.5 rounded-xl bg-gray-600 border-none cursor-pointer font-medium transition-all duration-250 hover:bg-gray-500 hover:-translate-y-px"
				>
					Cancel
				</button>
				<button
					type="submit"
					className="px-5 py-2.5 rounded-xl bg-accent border-none cursor-pointer font-medium transition-all duration-250 hover:bg-[#c299ff] hover:-translate-y-px"
				>
					Create Character
				</button>
			</div>
		</form>
	);
}
