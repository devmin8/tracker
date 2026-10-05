import { parseArgs, type ParseArgsOptionsConfig } from 'node:util';

import * as v from 'valibot';

import { safeTry } from '$lib/utils/safe-try';

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

type CommandSchema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
type RawInput = Record<string, unknown>;

export type Command<TSchema extends CommandSchema = CommandSchema> = {
	definition: CommandDefinition;
	schema: TSchema;
	execute(input: v.InferOutput<TSchema>): Promise<void>;
};

export async function runCommand<TSchema extends CommandSchema>(
	{ definition, schema, execute }: Command<TSchema>,
	args: string[]
) {
	const rawInput = parseCommandArgs(definition, args);
	const result = v.safeParse(schema, rawInput);
	if (!result.success) {
		throw new CommandInputError(
			definition,
			result.issues.map((issue) => issue.message)
		);
	}

	await execute(result.output);
}

export class CommandInputError extends Error {
	constructor(definition: CommandDefinition, messages: string[]) {
		super(`${messages.join('\n')}\n\n${formatCommandHelp(definition)}`);
	}
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
	const optionConfig: ParseArgsOptionsConfig = {};
	for (const option of definition.options) {
		optionConfig[option.flag] = { type: 'string' };
	}

	const parsed = safeTry(() =>
		parseArgs({
			args,
			allowPositionals: true,
			options: optionConfig,
			strict: true
		})
	);
	if (!parsed.ok) {
		throw new CommandInputError(definition, [
			parsed.error instanceof Error ? parsed.error.message : String(parsed.error)
		]);
	}
	const { values, positionals } = parsed.result;

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
