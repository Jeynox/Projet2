import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Router, type ErrorRequestHandler, type RequestHandler } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { userFromAuthHeader } from './auth.js';
import { config } from './config.js';
import { IMAGE_FILE } from './graphql/utils.js';

const MAX_BYTES = 8 * 1024 * 1024;
/** ~ 8000 × 5000 px : au-delà, refus (protection contre les « bombes de décompression »). */
const MAX_PIXELS = 40_000_000;
const MAX_SIDE = 1600;

export class UploadError extends Error {}

type ImageType = 'jpeg' | 'png' | 'gif' | 'webp' | 'avif';

/**
 * Identifie le format par sa signature binaire (« magic bytes »), jamais par le nom ni le
 * type MIME envoyés par le client. SVG, HTML, PHP, etc. sont donc refusés d'office.
 */
export function detectImageType(buf: Buffer): ImageType | null {
	if (buf.length < 12) return null;
	if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
	if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
	const head = buf.toString('latin1', 0, 12);
	if (head.startsWith('GIF87a') || head.startsWith('GIF89a')) return 'gif';
	if (head.startsWith('RIFF') && head.slice(8, 12) === 'WEBP') return 'webp';
	if (head.slice(4, 8) === 'ftyp' && ['avif', 'avis'].includes(head.slice(8, 12))) return 'avif';
	return null;
}

/**
 * Décode puis ré-encode l'image en WebP : tout ce qui n'est pas des pixels est jeté
 * (métadonnées EXIF/GPS, données cachées, fichiers « polyglottes » image + script).
 * Redimensionne au passage à 1600 px maximum.
 */
export async function reencodeImage(input: Buffer): Promise<Buffer> {
	const type = detectImageType(input);
	if (!type) throw new UploadError('Format non accepté (jpg, png, webp, gif, avif)');
	try {
		return await sharp(input, { limitInputPixels: MAX_PIXELS, failOn: 'error' })
			.rotate()
			.resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 80 })
			.toBuffer();
	} catch {
		throw new UploadError('Image illisible ou trop grande');
	}
}

const uploadDir = () => path.resolve(config.uploadDir);

/** Ré-encode et enregistre une image sous un nom généré (UUID). Renvoie son chemin `/uploads/…`. */
export async function saveImage(input: Buffer): Promise<string> {
	const data = await reencodeImage(input);
	const name = `${crypto.randomUUID()}.webp`;
	await fs.promises.writeFile(path.join(uploadDir(), name), data, { flag: 'wx', mode: 0o640 });
	return `/uploads/${name}`;
}

/** Supprime une image uploadée (sans erreur si elle n'existe plus). */
export async function removeUpload(url: string): Promise<void> {
	const file = url.startsWith('/uploads/') ? url.slice('/uploads/'.length) : '';
	if (!IMAGE_FILE.test(file)) return;
	await fs.promises.rm(path.join(uploadDir(), file), { force: true });
}

export function uploadsRouter(): Router {
	const dir = uploadDir();
	fs.mkdirSync(dir, { recursive: true });

	const upload = multer({
		storage: multer.memoryStorage(),
		limits: { fileSize: MAX_BYTES, files: 1, fields: 0, parts: 2 }
	});

	const requireAuth: RequestHandler = (req, res, next) => {
		if (!userFromAuthHeader(req.headers.authorization)) {
			res.status(401).json({ error: 'Authentification requise' });
			return;
		}
		next();
	};

	const router = Router();

	// Lecture : uniquement les noms générés par l'API (UUID), donc aucun chemin arbitraire.
	router.get('/uploads/:file', (req, res) => {
		const { file } = req.params;
		if (!IMAGE_FILE.test(file)) {
			res.sendStatus(404);
			return;
		}
		res.set({
			'X-Content-Type-Options': 'nosniff',
			'Content-Security-Policy': "default-src 'none'; sandbox",
			'Cache-Control': 'public, max-age=31536000, immutable'
		});
		res.sendFile(file, { root: dir, dotfiles: 'deny' }, (err) => {
			if (err && !res.headersSent) res.sendStatus(404);
		});
	});

	router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
		if (!req.file) {
			res.status(400).json({ error: 'Image manquante' });
			return;
		}
		try {
			res.status(201).json({ url: await saveImage(req.file.buffer) });
		} catch (e) {
			if (e instanceof UploadError) {
				res.status(400).json({ error: e.message });
				return;
			}
			throw e;
		}
	});

	const onError: ErrorRequestHandler = (err, _req, res, next) => {
		if (err instanceof multer.MulterError) {
			const tooBig = err.code === 'LIMIT_FILE_SIZE';
			res.status(tooBig ? 413 : 400).json({ error: tooBig ? 'Image trop lourde (8 Mo max)' : 'Envoi invalide' });
			return;
		}
		next(err);
	};
	router.use(onError);

	return router;
}
