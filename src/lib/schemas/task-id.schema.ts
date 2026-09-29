import * as v from 'valibot';

export const TaskIdSchema = v.pipe(v.string(), v.trim(), v.nonEmpty('Task not found'));

export type TaskId = v.InferOutput<typeof TaskIdSchema>;
