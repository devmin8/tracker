import { Cli } from './utils/cli';
import { CreateUserCommand } from './commands/create-user';
import { MigrateDbCommand } from './commands/migrate-db';
import { ResetDbCommand } from './commands/reset-db';
import { UpdateTagCommand } from './commands/update-tag';
import { UploadExpenseCommand } from './commands/upload-expense';
import { UploadTransactionsCommand } from './commands/upload-transactions';

const cli = new Cli({
	title: 'Tracker CLI',
	description: 'Manage Tracker data from the command line.'
})
	.register(UploadTransactionsCommand)
	.register(UploadExpenseCommand)
	.register(UpdateTagCommand)
	.register(MigrateDbCommand)
	.register(CreateUserCommand)
	.register(ResetDbCommand);

cli.run(process.argv.slice(2)).catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
