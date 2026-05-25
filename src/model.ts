export type BootstrapVersion = '5' | '4';

export type GeneratedOutputMode = 'snippet' | 'full-html';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type LayoutNodeKind = 'container' | 'row' | 'col';

export interface BreakpointSettings {
	span?: number;
	offset?: number;
	order?: number;
	hidden?: boolean;
	gutter?: number;
}

export interface LayoutNodeSettings {
	breakpoints?: Partial<Record<Breakpoint, BreakpointSettings>>;
}

export interface LayoutNode {
	id: string;
	kind: LayoutNodeKind;
	children: LayoutNode[];
	label?: string;
	fluid?: boolean;
	settings?: LayoutNodeSettings;
}

export interface GenerationOptions {
	bootstrapVersion: BootstrapVersion;
	outputMode: GeneratedOutputMode;
}

export const breakpointsByVersion: Record<BootstrapVersion, Breakpoint[]> = {
	'5': ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
	'4': ['xs', 'sm', 'md', 'lg', 'xl'],
};
