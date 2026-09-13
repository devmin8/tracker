<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn, type WithElementRef } from '$lib/utils/cn';

	export const badgeVariants = tv({
		base: 'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
		variants: {
			variant: {
				default: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
				secondary: 'border-border bg-muted text-muted-foreground'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

	export type BadgeProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		variant?: BadgeVariant;
	};
</script>

<script lang="ts">
	let {
		class: className,
		variant = 'default',
		ref = $bindable(null),
		children,
		...restProps
	}: BadgeProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="badge"
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</span>
