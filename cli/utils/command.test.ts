import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';

import { CommandInputError, runCommand, type CommandDefinition } from './command';

const definition: CommandDefinition = {
	name: 'example',
	title: 'Example',
	description: 'Example command',
	arguments: [{ name: 'file', description: 'Input file', required: true }],
	options: [
		{
			key: 'label',
			name: '--label <label>',
			flag: 'label',
			description: 'Label',
			defaultValue: 'default'
		}
	]
};

const InputSchema = v.object({ file: v.string(), label: v.string() });
type Input = v.InferOutput<typeof InputSchema>;

describe('runCommand', () => {
	test('passes positional arguments and string options to the command', async () => {
		const execute = vi.fn<(input: Input) => Promise<void>>().mockResolvedValue(undefined);
		await runCommand({ definition, schema: InputSchema, execute }, [
			'input.csv',
			'--label',
			'chosen'
		]);
		expect(execute).toHaveBeenCalledWith({ file: 'input.csv', label: 'chosen' });
	});

	test('uses option defaults', async () => {
		const execute = vi.fn<(input: Input) => Promise<void>>().mockResolvedValue(undefined);
		await runCommand({ definition, schema: InputSchema, execute }, ['input.csv']);
		expect(execute).toHaveBeenCalledWith({ file: 'input.csv', label: 'default' });
	});

	test('passes schema-transformed values to execution', async () => {
		const schema = v.object({
			file: v.pipe(
				v.string(),
				v.transform((value) => value.toUpperCase())
			),
			label: v.string()
		});
		const execute = vi.fn<(input: Input) => Promise<void>>().mockResolvedValue(undefined);
		await runCommand({ definition, schema, execute }, ['input.csv']);
		expect(execute).toHaveBeenCalledWith({ file: 'INPUT.CSV', label: 'default' });
	});

	test.each([['--unknown'], ['input.csv', '--label'], ['one.csv', 'two.csv'], []])(
		'reports invalid arguments with command help: %j',
		async (...args) => {
			const execute = vi.fn<(input: Input) => Promise<void>>().mockResolvedValue(undefined);
			await expect(
				runCommand({ definition, schema: InputSchema, execute }, args)
			).rejects.toSatisfy(
				(error: unknown) =>
					error instanceof CommandInputError && error.message.includes('pnpm cli example')
			);
			expect(execute).not.toHaveBeenCalled();
		}
	);
});
