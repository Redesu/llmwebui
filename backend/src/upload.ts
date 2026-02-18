import multer from "multer";

const storage = multer.diskStorage({
	destination: "./uploads/avatars",
	filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

export const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith("image/")) cb(null, true);
		else cb(null, false);
	},
});
