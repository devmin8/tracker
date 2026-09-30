export function normalizeCookie(value: string) {
	const cookie = value.replace(/^Cookie:\s*/i, '').trim();
	if (!cookie || cookie.includes('=')) return cookie;

	return `better-auth.session_token=${cookie}`;
}
