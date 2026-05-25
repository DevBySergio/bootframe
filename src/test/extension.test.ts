import * as assert from 'assert';
import * as vscode from 'vscode';
import { generateBootstrapCode } from '../generator';
import { LayoutNode } from '../model';

suite('BootFrame generator', () => {
	vscode.window.showInformationMessage('Start BootFrame tests.');

	test('generates nested Bootstrap 5 snippets', () => {
		const code = generateBootstrapCode(createNestedLayout(), {
			bootstrapVersion: '5',
			outputMode: 'snippet',
		});

		assert.strictEqual(code, [
			'<div class="container">',
			'  <div class="row">',
			'    <div class="col-sm-3">Level 1: .col-sm-3</div>',
			'    <div class="col-sm-9">',
			'      <div class="row">',
			'        <div class="col-8 col-sm-6">Level 2: .col-8 col-sm-6</div>',
			'        <div class="col-4 col-sm-6">Level 2: .col-4 col-sm-6</div>',
			'      </div>',
			'    </div>',
			'  </div>',
			'</div>',
		].join('\n'));
	});

	test('wraps snippets as complete Bootstrap 5 documents', () => {
		const code = generateBootstrapCode(createNestedLayout(), {
			bootstrapVersion: '5',
			outputMode: 'full-html',
		});

		assert.match(code, /<!doctype html>/);
		assert.match(code, /bootstrap@5\.3\.3/);
		assert.match(code, /<body>\n  <div class="container">/);
	});

	test('uses Bootstrap 4 compatible row gutters', () => {
		const layout = createNestedLayout();
		const row = layout.children[0];
		row.settings = { breakpoints: { xs: { gutter: 0 }, sm: { gutter: 4 } } };

		const code = generateBootstrapCode(layout, {
			bootstrapVersion: '4',
			outputMode: 'snippet',
		});

		assert.match(code, /<div class="row no-gutters">/);
		assert.doesNotMatch(code, /g-sm-4/);
	});

	test('generates spacing axis and flex sizing utilities', () => {
		const layout = createNestedLayout();
		layout.children[0].children[0].settings = {
			breakpoints: { sm: { span: 3 } },
			utilities: {
				flexGrow: 1,
				flexShrink: 0,
				mx: 2,
				my: 3,
				px: 4,
				py: 5,
			},
		};

		const code = generateBootstrapCode(layout, {
			bootstrapVersion: '5',
			outputMode: 'snippet',
		});

		assert.match(code, /flex-grow-1/);
		assert.match(code, /flex-shrink-0/);
		assert.match(code, /mx-2/);
		assert.match(code, /my-3/);
		assert.match(code, /px-4/);
		assert.match(code, /py-5/);
	});

	test('falls back from container-xxl for Bootstrap 4 output', () => {
		const layout = createNestedLayout();
		layout.containerType = 'container-xxl';

		const code = generateBootstrapCode(layout, {
			bootstrapVersion: '4',
			outputMode: 'snippet',
		});

		assert.match(code, /<div class="container-xl">/);
		assert.doesNotMatch(code, /container-xxl/);
	});

	test('keeps container-xxl for Bootstrap 5 output', () => {
		const layout = createNestedLayout();
		layout.containerType = 'container-xxl';

		const code = generateBootstrapCode(layout, {
			bootstrapVersion: '5',
			outputMode: 'snippet',
		});

		assert.match(code, /<div class="container-xxl">/);
	});

	test('uses Bootstrap 4 font weight utilities', () => {
		const weights = ['bold', 'bolder', 'normal', 'light'] as const;

		for (const weight of weights) {
			const layout = createNestedLayout();
			layout.children[0].children[0].settings = {
				breakpoints: { sm: { span: 3 } },
				utilities: { fw: weight },
			};

			const code = generateBootstrapCode(layout, {
				bootstrapVersion: '4',
				outputMode: 'snippet',
			});

			assert.match(code, new RegExp(`font-weight-${weight}`));
			assert.doesNotMatch(code, new RegExp(`fw-${weight}`));
		}
	});

	test('omits Bootstrap 5-only semibold font weight in Bootstrap 4 output', () => {
		const layout = createNestedLayout();
		layout.children[0].children[0].settings = {
			breakpoints: { sm: { span: 3 } },
			utilities: { fw: 'semibold' },
		};

		const code = generateBootstrapCode(layout, {
			bootstrapVersion: '4',
			outputMode: 'snippet',
		});

		assert.doesNotMatch(code, /fw-semibold/);
		assert.doesNotMatch(code, /font-weight-semibold/);
	});

	test('keeps Bootstrap 5 semibold font weight utility', () => {
		const layout = createNestedLayout();
		layout.children[0].children[0].settings = {
			breakpoints: { sm: { span: 3 } },
			utilities: { fw: 'semibold' },
		};

		const code = generateBootstrapCode(layout, {
			bootstrapVersion: '5',
			outputMode: 'snippet',
		});

		assert.match(code, /fw-semibold/);
	});

	test('generates responsive visibility transitions', () => {
		const layout = createNestedLayout();
		const column = layout.children[0].children[0];
		column.settings = {
			breakpoints: {
				xs: { span: 12 },
				md: { span: 4, hidden: true },
				lg: { span: 3 },
			},
		};

		const code = generateBootstrapCode(layout, {
			bootstrapVersion: '5',
			outputMode: 'snippet',
		});

		assert.match(code, /col-12 col-md-4 col-lg-3 d-md-none d-lg-block/);
	});
});

function createNestedLayout(): LayoutNode {
	return {
		id: 'root-container',
		kind: 'container',
		children: [
			{
				id: 'row-main',
				kind: 'row',
				children: [
					{
						id: 'col-main-a',
						kind: 'col',
						label: 'Level 1: .col-sm-3',
						children: [],
						settings: { breakpoints: { sm: { span: 3 } } },
					},
					{
						id: 'col-main-b',
						kind: 'col',
						label: 'Level 1: .col-sm-9',
						settings: { breakpoints: { sm: { span: 9 } } },
						children: [
							{
								id: 'row-nested',
								kind: 'row',
								children: [
									{
										id: 'col-nested-a',
										kind: 'col',
										label: 'Level 2: .col-8 col-sm-6',
										children: [],
										settings: { breakpoints: { xs: { span: 8 }, sm: { span: 6 } } },
									},
									{
										id: 'col-nested-b',
										kind: 'col',
										label: 'Level 2: .col-4 col-sm-6',
										children: [],
										settings: { breakpoints: { xs: { span: 4 }, sm: { span: 6 } } },
									},
								],
							},
						],
					},
				],
			},
		],
	};
}
