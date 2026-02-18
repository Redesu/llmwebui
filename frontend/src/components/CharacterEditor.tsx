import { useState, useEffect } from "react";
import { VIEW } from "../shared/view";
import { Character } from "../types/character";
import CharacterForm from "./CharacterForm";
import { ChevronLeft } from "lucide-react";

type UpdateCharacterFunc = (characterData: Character | FormData) => void;
type DeleteCharacterFunc = (id: number) => void;

export default function CharacterEditor({
	selectedCharacter,
	updateCharacter,
	deleteCharacter,
	setView,
}: {
	selectedCharacter: Character | null;
	setView: (view: VIEW) => void;
	updateCharacter: UpdateCharacterFunc;
	deleteCharacter: DeleteCharacterFunc;
}) {
	const [formData, setFormData] = useState<Omit<Character, "id">>({
		name: "",
		description: "",
		avatarUrl: "",
		story: "",
	});

	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	useEffect(() => {
		if (selectedCharacter) {
			setFormData({
				name: selectedCharacter.name,
				description: selectedCharacter.description || "",
				avatarUrl: selectedCharacter.avatarUrl || "",
				story: selectedCharacter.story || "",
			});
		}
	}, [selectedCharacter]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!selectedCharacter) return;
		const data = new FormData();

		data.append("id", selectedCharacter.id.toString());
		data.append("name", formData.name.trim());
		data.append("description", formData.description || "");
		data.append("story", formData.story || "");

		if (avatarFile) data.append("avatar", avatarFile);
		if (formData.avatarUrl) data.append("avatarUrl", formData.avatarUrl);

		updateCharacter(data);

		setView(VIEW.CHAT);
	};

	const handleDelete = () => {
		if (
			selectedCharacter &&
			window.confirm(
				`Are you sure you want to delete ${selectedCharacter.name}?`,
			)
		) {
			deleteCharacter(selectedCharacter.id);
			setView(VIEW.CHAT);
		}
	};

	const handleAvatarChange = (file: File | null, url?: string) => {
		setAvatarFile(file);
		setFormData({
			...formData,
			avatarUrl: url || "",
		});
	};

	if (!selectedCharacter) {
		return (
			<div className="flex-1 p-6 flex flex-col items-center justify-center">
				<p>No character selected.</p>
				<button
					onClick={() => setView(VIEW.CHAT)}
					className="mt-4 px-5 py-2.5 rounded-xl bg-accent text-bg border-none cursor-pointer font-medium transition-all duration-250 hover:bg-[#c299ff] hover:-translate-y-px"
				>
					<ChevronLeft size={16} /> Back to Chat
				</button>
			</div>
		);
	}

	return (
		<form
			className="flex-1 p-6 flex flex-col rounded-xl"
			onSubmit={handleSubmit}
		>
			<h1 className="text-2xl font-bold mb-4">
				Editing: {selectedCharacter.name}
			</h1>

			<CharacterForm
				formData={formData}
				onFormChange={handleChange}
				isCreator={false}
				onAvatarChange={handleAvatarChange}
			/>

			<div className="flex justify-between">
				<div className="flex gap-4">
					<button
						type="button"
						onClick={() => setView(VIEW.CHAT)}
						className="px-5 py-2.5 rounded-xl bg-gray-600 text-white border-none cursor-pointer font-medium transition-all duration-250 hover:bg-gray-500 hover:-translate-y-px"
					>
						{" "}
						Cancel
					</button>
					<button
						type="submit"
						className="px-5 py-2.5 rounded-xl bg-accent text-bg border-none cursor-pointer font-medium transition-all duration-250 hover:bg-[#c299ff] hover:-translate-y-px"
					>
						Save Character
					</button>
				</div>
				<button
					type="button"
					onClick={handleDelete}
					className="px-5 py-2.5 rounded-xl bg-red-800 text-white border-none cursor-pointer font-medium transition-all duration-250 hover:bg-red-700 hover:-translate-y-px"
				>
					Delete
				</button>
			</div>
		</form>
	);
}
