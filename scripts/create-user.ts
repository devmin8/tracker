import { createDb } from '$lib/server/db/create-db';
import { usersTable } from '$lib/server/db/schemas';
import { getEnvData } from '$lib/server/env.schema';

const { DATABASE_URL } = getEnvData();
const db = createDb(DATABASE_URL);

async function main() {
	const user: typeof usersTable.$inferInsert = {
		name: 'sherlock',
		age: 39,
		email: 'sherlock@example.com'
	};

	await db.insert(usersTable).values(user);
	console.log('New user created!');

	const users = await db.select().from(usersTable);
	console.log('Getting all users from the database: ', users);
}

main();
