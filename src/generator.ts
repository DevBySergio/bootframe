import {
	Breakpoint,
	BreakpointSettings,
	breakpointsByVersion,
	GenerationOptions,
	LayoutNode,
} from './model';

const bootstrapCssByVersion = {
	'5': 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
	'4': 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css',
};

const bootstrapJsByVersion = {
	'5': 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
	'4': 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js',
};

export function generateBootstrapCode(layout: LayoutNode, options: GenerationOptions): string {
	const snippet = renderNode(layout, options, 0).join('\n');

	if (options.outputMode === 'snippet') {
		return snippet;
	}

	return [
		'<!doctype html>',
		'<html lang="en">',
		'<head>',
		'  <meta charset="utf-8">',
		'  <meta name="viewport" content="width=device-width, initial-scale=1">',
		'  <title>BootFrame Layout</title>',
		`  <link href="${bootstrapCssByVersion[options.bootstrapVersion]}" rel="stylesheet">`,
		'</head>',
		'<body>',
		indentBlock(snippet, 1),
		`  <script src="${bootstrapJsByVersion[options.bootstrapVersion]}"></script>`,
		'</body>',
		'</html>',
	].join('\n');
}

function renderNode(node: LayoutNode, options: GenerationOptions, level: number): string[] {
	const pad = indent(level);
	const classes = getClasses(node, options);
	const openTag = `${pad}<div class="${classes.join(' ')}">`;

	if (node.kind === 'col' && node.children.length === 0) {
		return [`${openTag}${escapeHtml(node.label ?? 'Column')}</div>`];
	}

	if (node.children.length === 0) {
		return [`${openTag}</div>`];
	}

	return [
		openTag,
		...node.children.flatMap((child) => renderNode(child, options, level + 1)),
		`${pad}</div>`,
	];
}

function getClasses(node: LayoutNode, options: GenerationOptions): string[] {
	if (node.kind === 'container') {
		return [node.fluid ? 'container-fluid' : 'container'];
	}

	if (node.kind === 'row') {
		return ['row', ...getRowClasses(node, options)].filter(Boolean);
	}

	return getColumnClasses(node, options);
}

function getRowClasses(node: LayoutNode, options: GenerationOptions): string[] {
	const breakpoints = breakpointsByVersion[options.bootstrapVersion];
	const settings = node.settings?.breakpoints ?? {};

	if (options.bootstrapVersion === '4') {
		return settings.xs?.gutter === 0 ? ['no-gutters'] : [];
	}

	return breakpoints.flatMap((breakpoint) => {
		const gutter = settings[breakpoint]?.gutter;

		if (gutter === undefined) {
			return [];
		}

		return [breakpoint === 'xs' ? `g-${gutter}` : `g-${breakpoint}-${gutter}`];
	});
}

function getColumnClasses(node: LayoutNode, options: GenerationOptions): string[] {
	const breakpoints = breakpointsByVersion[options.bootstrapVersion];
	const settings = node.settings?.breakpoints ?? {};
	const spanClasses = breakpoints.flatMap((breakpoint) => getSpanClasses(breakpoint, settings[breakpoint]));
	const offsetClasses = breakpoints.flatMap((breakpoint) => getOffsetClasses(breakpoint, settings[breakpoint]));
	const orderClasses = breakpoints.flatMap((breakpoint) => getOrderClasses(breakpoint, settings[breakpoint]));

	return [
		...(spanClasses.length > 0 ? spanClasses : ['col']),
		...offsetClasses,
		...orderClasses,
		...getVisibilityClasses(breakpoints, settings),
	];
}

function getSpanClasses(breakpoint: Breakpoint, settings?: BreakpointSettings): string[] {
	if (settings?.span === undefined) {
		return [];
	}

	return [breakpoint === 'xs' ? `col-${settings.span}` : `col-${breakpoint}-${settings.span}`];
}

function getOffsetClasses(breakpoint: Breakpoint, settings?: BreakpointSettings): string[] {
	if (settings?.offset === undefined || settings.offset === 0) {
		return [];
	}

	return [breakpoint === 'xs' ? `offset-${settings.offset}` : `offset-${breakpoint}-${settings.offset}`];
}

function getOrderClasses(breakpoint: Breakpoint, settings?: BreakpointSettings): string[] {
	if (settings?.order === undefined) {
		return [];
	}

	return [breakpoint === 'xs' ? `order-${settings.order}` : `order-${breakpoint}-${settings.order}`];
}

function getVisibilityClasses(
	breakpoints: Breakpoint[],
	settings: Partial<Record<Breakpoint, BreakpointSettings>>,
): string[] {
	const visibilityByBreakpoint = breakpoints.map((breakpoint) => !settings[breakpoint]?.hidden);

	if (visibilityByBreakpoint.every(Boolean)) {
		return [];
	}

	const classes: string[] = [];
	let previousVisible = visibilityByBreakpoint[0];

	if (!previousVisible) {
		classes.push('d-none');
	}

	for (let index = 1; index < breakpoints.length; index += 1) {
		const visible = visibilityByBreakpoint[index];

		if (visible !== previousVisible) {
			classes.push(`d-${breakpoints[index]}-${visible ? 'block' : 'none'}`);
		}

		previousVisible = visible;
	}

	return classes;
}

function indent(level: number): string {
	return '  '.repeat(level);
}

function indentBlock(source: string, level: number): string {
	const prefix = indent(level);

	return source
		.split('\n')
		.map((line) => `${prefix}${line}`)
		.join('\n');
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
