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

export interface LayoutUtilities {
	display?: 'flex' | 'inline-flex' | 'block' | 'inline-block' | 'none';
	flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
	justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
	alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
	flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
	flexGrow?: 0 | 1;
	flexShrink?: 0 | 1;
	mt?: number;
	mb?: number;
	ms?: number;
	me?: number;
	mx?: number;
	my?: number;
	pt?: number;
	pb?: number;
	ps?: number;
	pe?: number;
	px?: number;
	py?: number;
	bg?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'white' | 'transparent' | 'body';
	border?: 0 | 1;
	borderColor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'white';
	rounded?: 0 | 'sm' | 'lg' | 'pill' | 'circle';
	shadow?: 'sm' | 'lg' | 'none';
	textAlign?: 'start' | 'end' | 'center';
	textColor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'body' | 'muted' | 'white';
	fw?: 'bold' | 'bolder' | 'semibold' | 'normal' | 'light';
}

export interface LayoutNodeSettings {
	breakpoints?: Partial<Record<Breakpoint, BreakpointSettings>>;
	utilities?: LayoutUtilities;
}

export type ContainerType = 'container' | 'container-fluid' | 'container-sm' | 'container-md' | 'container-lg' | 'container-xl' | 'container-xxl';

export interface LayoutNode {
	id: string;
	kind: LayoutNodeKind;
	children: LayoutNode[];
	label?: string;
	containerType?: ContainerType;
	settings?: LayoutNodeSettings;
}

export interface BootFrameSettings {
	defaultVersion: string;
	defaultOutputMode: string;
	maxUndoHistory: number;
}

export interface GenerationOptions {
	bootstrapVersion: BootstrapVersion;
	outputMode: GeneratedOutputMode;
	indentSize?: number;
	includeBootstrapJS?: boolean;
}

export const breakpointsByVersion: Record<BootstrapVersion, Breakpoint[]> = {
	'5': ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
	'4': ['xs', 'sm', 'md', 'lg', 'xl'],
};
