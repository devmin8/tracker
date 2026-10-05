import { Cli } from './utils/cli';
import { createUserCommand } from './commands/create-user';
import { migrateDbCommand } from './commands/migrate-db';
import { resetDbCommand } from './commands/reset-db';
import { updateTagCommand } from './commands/update-tag';
import { uploadExpenseCommand } from './commands/upload-expense';
import { uploadTransactionsCommand } from './commands/upload-transactions';

const cli = new Cli({
	title: 'Tracker CLI',
	description: 'Manage Tracker data from the command line.'
})
	.register(uploadTransactionsCommand)
	.register(uploadExpenseCommand)
	.register(updateTagCommand)
	.register(migrateDbCommand)
	.register(createUserCommand)
	.register(resetDbCommand);

cli.run(process.argv.slice(2)).catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
