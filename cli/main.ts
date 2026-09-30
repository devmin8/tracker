import { Cli } from './utils/cli';
import { CreateUserCommand } from './commands/create-user';
import { MigrateDbCommand } from './commands/migrate-db';
import { ResetDbCommand } from './commands/reset-db';
import { UploadExpenseCommand } from './commands/upload-expense';

const cli = new Cli({
	title: 'Tracker CLI',
	description: 'Manage Tracker data from the command line.'
})
	.register(UploadExpenseCommand)
	.register(MigrateDbCommand)
	.register(CreateUserCommand)
	.register(ResetDbCommand);

cli.run(process.argv.slice(2)).catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
