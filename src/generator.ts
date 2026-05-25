import {
	Breakpoint,
	BreakpointSettings,
	breakpointsByVersion,
	GenerationOptions,
	LayoutNode,
	LayoutUtilities,
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
	const indentSize = options.indentSize ?? 2;
	const snippet = renderNode(layout, options, 0, indentSize).join('\n');

	if (options.outputMode === 'snippet') {
		return snippet;
	}

	const result = [
		'<!doctype html>',
		'<html lang="en">',
		'<head>',
		'  <meta charset="utf-8">',
		'  <meta name="viewport" content="width=device-width, initial-scale=1">',
		'  <title>BootFrame Layout</title>',
		`  <link href="${bootstrapCssByVersion[options.bootstrapVersion]}" rel="stylesheet">`,
		'</head>',
		'<body>',
		indentBlock(snippet, 1, indentSize),
		'</body>',
		'</html>',
	];

	if (options.includeBootstrapJS) {
		result.splice(result.length - 1, 0, `  <script src="${bootstrapJsByVersion[options.bootstrapVersion]}"></script>`);
	}

	return result.join('\n');
}

function renderNode(node: LayoutNode, options: GenerationOptions, level: number, indentSize: number): string[] {
	const pad = indent(level, indentSize);
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
		...node.children.flatMap((child) => renderNode(child, options, level + 1, indentSize)),
		`${pad}</div>`,
	];
}

function getClasses(node: LayoutNode, options: GenerationOptions): string[] {
	const base: string[] = [];

	if (node.kind === 'container') {
		base.push(node.containerType || 'container');
	} else if (node.kind === 'row') {
		base.push('row', ...getRowClasses(node, options));
	} else {
		base.push(...getColumnClasses(node, options));
	}

	base.push(...getUtilityClasses(node));
	return base.filter(Boolean);
}

function getUtilityClasses(node: LayoutNode): string[] {
	const u = node.settings?.utilities;
	if (!u) {
		return [];
	}

	const result: string[] = [];

	if (u.display) { result.push(`d-${u.display}`); }
	if (u.flexDirection) { result.push(`flex-${u.flexDirection}`); }
	if (u.justifyContent) { result.push(`justify-content-${u.justifyContent}`); }
	if (u.alignItems) { result.push(`align-items-${u.alignItems}`); }
	if (u.flexWrap) { result.push(`flex-${u.flexWrap}`); }
	if (u.flexGrow !== undefined) { result.push(`flex-grow-${u.flexGrow}`); }
	if (u.flexShrink !== undefined) { result.push(`flex-shrink-${u.flexShrink}`); }

	if (u.mt !== undefined) { result.push(`mt-${u.mt}`); }
	if (u.mb !== undefined) { result.push(`mb-${u.mb}`); }
	if (u.ms !== undefined) { result.push(`ms-${u.ms}`); }
	if (u.me !== undefined) { result.push(`me-${u.me}`); }
	if (u.mx !== undefined) { result.push(`mx-${u.mx}`); }
	if (u.my !== undefined) { result.push(`my-${u.my}`); }
	if (u.pt !== undefined) { result.push(`pt-${u.pt}`); }
	if (u.pb !== undefined) { result.push(`pb-${u.pb}`); }
	if (u.ps !== undefined) { result.push(`ps-${u.ps}`); }
	if (u.pe !== undefined) { result.push(`pe-${u.pe}`); }
	if (u.px !== undefined) { result.push(`px-${u.px}`); }
	if (u.py !== undefined) { result.push(`py-${u.py}`); }

	if (u.bg) { result.push(`bg-${u.bg}`); }

	if (u.border !== undefined) {
		result.push(u.border === 0 ? 'border-0' : 'border');
	}
	if (u.borderColor) { result.push(`border-${u.borderColor}`); }
	if (u.rounded !== undefined) {
		result.push(u.rounded === 0 ? 'rounded-0' : `rounded-${u.rounded}`);
	}

	if (u.shadow === 'none') { result.push('shadow-none'); }
	else if (u.shadow) { result.push(`shadow-${u.shadow}`); }

	if (u.textAlign) { result.push(`text-${u.textAlign}`); }
	if (u.textColor) { result.push(`text-${u.textColor}`); }
	if (u.fw) { result.push(`fw-${u.fw}`); }

	return result;
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

function indent(level: number, size: number): string {
	return ' '.repeat(size * level);
}

function indentBlock(source: string, level: number, indentSize: number): string {
	const prefix = indent(level, indentSize);

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
