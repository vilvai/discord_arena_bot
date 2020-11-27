import admin from "firebase-admin";
import { languages } from "./languages";
import type { Language } from "./languages";

let database: FirebaseFirestore.Firestore | null = null;

export const initializeDatabase = () => {
	const SERVICE_ACCOUNT_KEY = process.env.SERVICE_ACCOUNT_KEY;

	if (SERVICE_ACCOUNT_KEY === undefined) {
		throw new Error("SERVICE_ACCOUNT_KEY was undefined");
	}

	let serviceAccountKey: Record<string, string>;

	try {
		serviceAccountKey = JSON.parse(SERVICE_ACCOUNT_KEY);
	} catch (error) {
		throw new Error("Parsing SERVICE_ACCOUNT_KEY failed");
	}

	admin.initializeApp({
		credential: admin.credential.cert(serviceAccountKey),
	});

	database = admin.firestore();
};

export const saveLanguageForChannel = (
	channelId: string,
	language: Language
) => {
	if (database === null) {
		throw new Error("Trying to save language before database is initialized");
	}
	database
		.collection("channels")
		.doc(channelId)
		.set({ language }, { merge: true })
		.then(() =>
			console.log(`Language ${language} written to DB for channel ${channelId}`)
		)
		.catch((error) => {
			console.log(
				`Writing language ${language} to DB for channel ${channelId} failed. Error: ${error}`
			);
		});
};

export const getLanguageForChannel = async (
	channelId: string
): Promise<Language | null> => {
	if (database === null) {
		throw new Error("Trying to get language before database is initialized");
	}
	const channelDataDocument = await database
		.collection("channels")
		.doc(channelId)
		.get();
	if (!channelDataDocument.exists) return null;

	const channelData = channelDataDocument.data();
	if (channelData === undefined) return null;

	const language = channelData.language;
	if (!Object.keys(languages).includes(language)) return null;

	return language;
};
