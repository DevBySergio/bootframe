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
