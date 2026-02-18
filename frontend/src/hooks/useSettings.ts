import { useState, useEffect } from "react";

export interface Settings {
	temperature: number;
}

export default function useSettings() {
	const [params, setParams] = useState({} as Settings);

	const loadSettings = async () => {
		try {
			const res = await fetch("/api/v1/settings-profiles");

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || `Server Error: ${res.status}`);
			}

			const data = await res.json();
			if (data.settings) {
				setParams(data.settings);
			}
		} catch (err) {
			console.error("Settings load failed:", err);
		}
	};

	const saveSettings = async (newSettings: Settings) => {
		try {
			const res = await fetch("/api/v1/settings-profiles", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ settings: newSettings }),
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to save settings");
			}
			
			setParams(newSettings);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Unknown error";
			alert(`Save Error: ${msg}`);
		}
	};

	useEffect(() => {
		loadSettings();
	}, []);

	return { params, setParams, saveSettings };
}
