// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals {
			/** JWT de l'admin (cookie httpOnly), ou null. */
			token: string | null;
		}
	}
}

export {};
