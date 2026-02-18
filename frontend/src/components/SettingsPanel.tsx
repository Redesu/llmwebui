import { useEffect, useState } from "react";
import { Settings } from "../hooks/useSettings";
import { VIEW } from "../shared/view";
import { Character } from "../types/character";
import { ChevronLeft, PenSquareIcon, PlusIcon } from "lucide-react";

interface SettingsPanelProps {
	params: Settings;
	setParams: (params: Settings) => void;
	saveSettings: (params: Settings) => void;
	characters: Character[];
	selectedCharacter: Character | null;
	selectCharacter: (id: number) => void;
	view: string;
	setView: (view: VIEW) => void;
}

export default function SettingsPanel({
	params,
	setParams,
	saveSettings,
	characters,
	selectedCharacter,
	selectCharacter,
	view,
	setView,
}: SettingsPanelProps) {
	const [tempInput, setTempInput] = useState("");

	useEffect(() => {
		setTempInput(params?.temperature?.toString() || "");
	}, [params?.temperature]);

	const handleTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTempInput(e.target.value);
	};

	const handleTempBlur = () => {
		const parsed = parseFloat(tempInput);

		if (isNaN(parsed)) {
			setTempInput(params?.temperature?.toString() || "");
			return;
		}

		const newSettings = { ...params, temperature: parsed };
		setParams(newSettings);
		saveSettings(newSettings);
	};

	const handleCharacterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		selectCharacter(Number(e.target.value));
	};

	return (
		<div className="w-[20%] max-w-[280px] shrink-0 p-6 overflow-y-auto bg-panel border-r border-border">
			<h2 className="mb-4 text-lg">Settings</h2>

			<label className="block mb-4 font-medium text-sm">
				Temperature:
				<input
					type="number"
					step="0.1"
					min="0"
					max="2"
					inputMode="decimal"
					name="temperature"
					value={tempInput}
					onChange={handleTempChange}
					onBlur={handleTempBlur}
					className="w-full mt-1 mb-2 rounded-md px-3 py-2"
				/>
			</label>

			<label className="block mb-4 font-medium text-sm">
				Character:
				<select
					value={selectedCharacter?.id || ""}
					onChange={handleCharacterChange}
					className="w-full mt-1 mb-2"
					disabled={characters.length === 0}
				>
					{characters.length === 0 ? (
						<option>No characters found</option>
					) : (
						characters.map((character) => (
							<option key={character.id} value={character.id}>
								{character.name}
							</option>
						))
					)}
				</select>
			</label>

			<div className="space-y-4">
				<button
					onClick={() => setView(VIEW.CHARACTER_CREATOR)}
					className="w-full flex items-center justify-center gap-1"
				>
					<PlusIcon />
					New Character
				</button>

				{view === "chat" ? (
					<button
						onClick={() => setView(VIEW.CHARACTER_EDITOR)}
						className="w-full flex items-center justify-center gap-1"
						disabled={!selectedCharacter}
					>
						<PenSquareIcon />
						Edit Character
					</button>
				) : (
					<button
						onClick={() => setView(VIEW.CHAT)}
						className="w-full flex items-center justify-center gap-1"
					>
						<ChevronLeft /> Back to Chat
					</button>
				)}
			</div>
		</div>
	);
}
