import { useRef, useState } from "react";
import { Character } from "../types/character";

type FormData = Omit<Character, "id">;

interface CharacterFormProps {
	formData: FormData;
	onFormChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => void;
	onAvatarChange: (file: File | null, url?: string) => void;
	isCreator: boolean;
}

export default function CharacterForm({
	formData,
	onFormChange,
	onAvatarChange,
}: CharacterFormProps) {
	const inputBaseClasses =
		"w-full mt-1 p-2 bg-input border border-border rounded-lg";

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewUrl, setPreviewUrl] = useState<string>(
		formData.avatarUrl || "",
	);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileSelect = (file: File | null) => {
		if (!file?.type.startsWith("image/")) return;
		const url = URL.createObjectURL(file);
		setPreviewUrl(url);
		onAvatarChange(file);
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleFileSelect(file);
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		const items = e.clipboardData?.items;
		for (let i = 0; i < items.length; i++) {
			if (items[i].type.startsWith("image/")) {
				const file = items[i].getAsFile();
				if (file) {
					handleFileSelect(file);
					e.preventDefault;
				}
				break;
			}
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) handleFileSelect(file);
	};

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const url = e.target.value;
		setPreviewUrl(url);
		onAvatarChange(null, url);
	};

	return (
		<div className="flex-1 border border-border mb-4 p-4 rounded-xl overflow-y-auto">
			<label className="block mb-3">
				Name:
				<input
					type="text"
					name="name"
					value={formData.name}
					onChange={onFormChange}
					className={inputBaseClasses}
					required
				/>
			</label>
			<label className="block mb-3">
				Avatar:
				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onPaste={handlePaste}
					className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center ${isDragging ? "border-blue-500 bg-blue-50" : "border-border"}`}
				>
					{previewUrl && (
						<img
							src={previewUrl}
							alt="avatar preview"
							className="w-32 h-32 object-cover rounded-lg mx-auto mb-2"
						/>
					)}
					<input
						type="text"
						placeholder="or use a URL here"
						value={formData.avatarUrl || ""}
						onChange={handleUrlChange}
						className={`${inputBaseClasses} mb-2`}
					/>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleFileInput}
						className="hidden"
					/>
					<button
						type="button"
						onClick={handleUploadClick}
						className="p-2 bg-input border border-border rounded-lg text-text"
					>
						Upload File
					</button>
					<p className="text-sm mt-2">
						Drop image, paste, or click to upload.
					</p>
				</div>
			</label>
			<label className="block mb-3">
				Description:
				<textarea
					name="description"
					value={formData.description || ""}
					onChange={onFormChange}
					className={`${inputBaseClasses} h-24`}
				/>
			</label>
			<label className="block mb-3">
				Story:
				<textarea
					name="story"
					value={formData.story || ""}
					onChange={onFormChange}
					className={`${inputBaseClasses} h-48`}
				/>
			</label>
		</div>
	);
}
