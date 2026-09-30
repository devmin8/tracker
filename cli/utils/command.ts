import { parseArgs } from 'node:util';

import * as v from 'valibot';

export type CommandArgument = {
	name: string;
	description: string;
	required: boolean;
};

export type CommandOption = {
	key: string;
	name: string;
	flag: string;
	description: string;
	required?: boolean;
	env?: string;
	defaultValue?: string;
};

export type CommandDefinition = {
	name: string;
	title: string;
	description: string;
	arguments: CommandArgument[];
	options: CommandOption[];
};

type CommandConstructor = new () => CommandInstance;
export type CommandInstance = { run(args: string[]): Promise<void> };
type CommandSchema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
type RawInput = Record<string, unknown>;

const definitions = new WeakMap<CommandConstructor, CommandDefinition>();

export abstract class Command<TSchema extends CommandSchema> {
	abstract readonly schema: TSchema;

	async run(args: string[]) {
		const definition = getCommandDefinition(this.constructor as CommandConstructor);
		const rawInput = parseCommandArgs(definition, args);
		const result = v.safeParse(this.schema, rawInput);

		if (!result.success) {
			throw new CommandInputError(
				definition,
				result.issues.map((issue) => issue.message)
			);
		}

		await this.execute(result.output);
	}

	protected abstract execute(input: v.InferOutput<TSchema>): Promise<void>;
}

export class CommandInputError extends Error {
	constructor(definition: CommandDefinition, messages: string[]) {
		super(`${messages.join('\n')}\n\n${formatCommandHelp(definition)}`);
	}
}

export function command(definition: CommandDefinition) {
	return (target: CommandConstructor) => {
		definitions.set(target, definition);
	};
}

export function getCommandDefinition(commandConstructor: CommandConstructor) {
	const definition = definitions.get(commandConstructor);
	if (!definition) {
		throw new Error(`${commandConstructor.name} is missing a command definition`);
	}

	return definition;
}

export function formatCommandHelp(definition: CommandDefinition) {
	const argumentsUsage = definition.arguments
		.map((argument) => (argument.required ? `<${argument.name}>` : `[${argument.name}]`))
		.join(' ');
	const argumentList = definition.arguments.map(formatArgument);
	const optionList = [
		...definition.options.map(formatOption),
		formatOption({
			key: 'help',
			name: '-h, --help',
			flag: 'help',
			description: 'Show command help'
		})
	];

	return [
		definition.title,
		'',
		definition.description,
		'',
		'Usage:',
		`  pnpm cli ${definition.name} [options]${argumentsUsage ? ` ${argumentsUsage}` : ''}`,
		'',
		...(argumentList.length > 0 ? ['Arguments:', ...argumentList, ''] : []),
		'Options:',
		...optionList
	].join('\n');
}

function parseCommandArgs(definition: CommandDefinition, args: string[]) {
	const optionConfig: Record<string, { type: 'string' }> = {};
	for (const option of definition.options) {
		optionConfig[option.flag] = { type: 'string' };
	}

	let values: Record<string, string | undefined>;
	let positionals: string[];
	try {
		({ values, positionals } = parseArgs({
			args,
			allowPositionals: true,
			options: optionConfig,
			strict: true
		}));
	} catch (error) {
		throw new CommandInputError(definition, [
			error instanceof Error ? error.message : String(error)
		]);
	}

	if (positionals.length > definition.arguments.length) {
		throw new CommandInputError(definition, ['Too many arguments']);
	}

	const rawInput: RawInput = {};
	for (const [index, argument] of definition.arguments.entries()) {
		rawInput[argument.name] = positionals[index];
	}
	for (const option of definition.options) {
		rawInput[option.key] =
			values[option.flag] ??
			(option.env ? process.env[option.env] : undefined) ??
			option.defaultValue;
	}

	return rawInput;
}

function formatArgument(argument: CommandArgument) {
	return `  <${argument.name}>${' '.repeat(Math.max(1, 24 - argument.name.length))}${argument.description}`;
}

function formatOption(option: CommandOption) {
	const label = option.required ? `${option.name} (required)` : option.name;
	return `  ${label}${' '.repeat(Math.max(1, 34 - label.length))}${option.description}`;
}

export type { CommandConstructor };
