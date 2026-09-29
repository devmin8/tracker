export type TaskAssignee = {
	id: string;
	name: string;
	email: string;
};

export type AssigneeOption = {
	value: string;
	label: string;
};

export function toAssigneeOptions(assignees: readonly TaskAssignee[]): AssigneeOption[] {
	return assignees.map((assignee) => ({ value: assignee.id, label: assignee.name }));
}

export function resolveDefaultAssignee(
	assignees: readonly TaskAssignee[],
	preferredId: string
): string {
	if (assignees.some((assignee) => assignee.id === preferredId)) return preferredId;

	return assignees[0]?.id ?? '';
}
