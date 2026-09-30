import {
	formatCommandHelp,
	getCommandDefinition,
	type CommandConstructor,
	type CommandInstance,
	type CommandDefinition
} from './command';

type CliOptions = {
	title: string;
	description: string;
};

type RegisteredCommand = {
	definition: CommandDefinition;
	command: CommandInstance;
};

export class Cli {
	#commands = new Map<string, RegisteredCommand>();

	constructor(private options: CliOptions) {}

	register(commandConstructor: CommandConstructor) {
		const definition = getCommandDefinition(commandConstructor);
		if (this.#commands.has(definition.name)) {
			throw new Error(`Command already registered: ${definition.name}`);
		}

		this.#commands.set(definition.name, {
			definition,
			command: new commandConstructor()
		});

		return this;
	}

	async run(args: string[]) {
		const [commandName, ...commandArgs] = args;
		if (!commandName || commandName === '--help' || commandName === '-h') {
			console.log(this.usage());
			return;
		}

		const registered = this.#commands.get(commandName);
		if (!registered) {
			throw new Error(`Unknown command: ${commandName}\n\n${this.usage()}`);
		}

		if (commandArgs.includes('--help') || commandArgs.includes('-h')) {
			console.log(formatCommandHelp(registered.definition));
			return;
		}

		await registered.command.run(commandArgs);
	}

	private usage() {
		const commandList = [...this.#commands.values()]
			.map(({ definition }) => `  ${definition.name.padEnd(20)} ${definition.description}`)
			.join('\n');

		return [
			this.options.title,
			'',
			this.options.description,
			'',
			'Usage:',
			'  pnpm cli <command> [options]',
			'',
			'Available Commands:',
			commandList,
			'',
			'Options:',
			'  -h, --help                Show CLI help',
			'',
			'Use "pnpm cli <command> --help" for command details.'
		].join('\n');
	}
}
