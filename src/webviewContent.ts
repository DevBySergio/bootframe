import * as vscode from 'vscode';

export function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
	const nonce = getNonce();
	const cspSource = webview.cspSource;
	const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media'));

	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource}; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
	<title>BootFrame</title>
	<style>
		:root {
			color-scheme: light dark;
			--bf-border: var(--vscode-panel-border, rgba(128, 128, 128, 0.32));
			--bf-muted: var(--vscode-descriptionForeground);
			--bf-accent: var(--vscode-button-background);
			--bf-accent-text: var(--vscode-button-foreground);
			--bf-surface: var(--vscode-sideBar-background);
			--bf-panel: var(--vscode-editorWidget-background);
			--bf-input: var(--vscode-input-background);
			--bf-focus: var(--vscode-focusBorder);
		}

		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
			color: var(--vscode-foreground);
			background: var(--bf-surface);
			font-family: var(--vscode-font-family);
			font-size: var(--vscode-font-size);
		}

		button,
		select,
		input,
		textarea {
			font: inherit;
		}

		button,
		select,
		input[type="text"],
		input[type="number"] {
			min-height: 28px;
			border: 1px solid var(--bf-border);
			border-radius: 4px;
			color: var(--vscode-input-foreground);
			background: var(--bf-input);
		}

		button {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 6px;
			padding: 0 8px;
			cursor: pointer;
		}

		button.primary {
			color: var(--bf-accent-text);
			background: var(--bf-accent);
			border-color: var(--bf-accent);
		}

		button.icon {
			width: 30px;
			padding: 0;
		}

		button:disabled {
			opacity: 0.45;
			cursor: not-allowed;
		}

		input[type="range"] {
			width: 100%;
		}

		.app {
			display: flex;
			flex-direction: column;
			min-height: 100vh;
		}

		.toolbar {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 8px;
			padding: 10px;
			border-bottom: 1px solid var(--bf-border);
		}

		.toolbar label,
		.field label {
			display: flex;
			flex-direction: column;
			gap: 4px;
			min-width: 0;
			color: var(--bf-muted);
			font-size: 11px;
			text-transform: uppercase;
		}

		.breakpoint-bar,
		.action-bar {
			display: flex;
			flex-wrap: wrap;
			gap: 6px;
			grid-column: 1 / -1;
		}

		.breakpoint-button.active {
			color: var(--bf-accent-text);
			background: var(--bf-accent);
			border-color: var(--bf-accent);
		}

		.workspace {
			display: flex;
			flex-direction: column;
			gap: 10px;
			padding: 10px;
		}

		.section-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 6px;
			color: var(--bf-muted);
			font-size: 11px;
			text-transform: uppercase;
		}

		.preset-bar,
		.breadcrumbs {
			display: flex;
			flex-wrap: wrap;
			gap: 6px;
		}

		.breadcrumbs {
			padding: 8px;
			border: 1px solid var(--bf-border);
			border-radius: 6px;
			background: var(--bf-panel);
		}

		.breadcrumb-button {
			min-height: 24px;
			max-width: 160px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.breadcrumb-button.active {
			color: var(--bf-accent-text);
			background: var(--bf-accent);
			border-color: var(--bf-accent);
		}

		.canvas {
			min-height: 220px;
			padding: 10px;
			overflow: auto;
			border: 1px solid var(--bf-border);
			border-radius: 6px;
			background:
				linear-gradient(to right, rgba(127, 127, 127, 0.18) 1px, transparent 1px) 0 0 / calc(100% / 12) 100%,
				var(--vscode-editor-background);
		}

		.bf-node {
			position: relative;
			border: 1px solid var(--bf-border);
			border-radius: 4px;
			transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
		}

		.bf-node:hover {
			border-color: var(--bf-focus);
		}

		.bf-container {
			min-width: 360px;
			padding: 10px;
			background: rgba(61, 132, 255, 0.08);
		}

		.bf-row {
			display: grid;
			grid-template-columns: repeat(12, minmax(18px, 1fr));
			gap: 6px;
			min-height: 70px;
			padding: 8px;
			background: rgba(245, 158, 11, 0.08);
		}

		.bf-col {
			min-height: 56px;
			padding: 8px 10px;
			background: rgba(34, 197, 94, 0.1);
			cursor: grab;
		}

		.bf-col:active {
			cursor: grabbing;
		}

		.bf-node.selected {
			border-color: var(--bf-focus);
			box-shadow: 0 0 0 1px var(--bf-focus);
		}

		.node-label {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
			min-height: 22px;
			color: var(--vscode-foreground);
			font-size: 12px;
		}

		.node-title {
			display: flex;
			align-items: center;
			gap: 6px;
			min-width: 0;
		}

		.node-title strong {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.node-kind {
			flex: 0 0 auto;
			padding: 1px 5px;
			border: 1px solid var(--bf-border);
			border-radius: 999px;
			color: var(--bf-muted);
			font-size: 10px;
			font-weight: 600;
			text-transform: uppercase;
		}

		.node-tools {
			display: flex;
			align-items: center;
			gap: 4px;
			flex: 0 0 auto;
		}

		.node-tools button {
			min-height: 22px;
			padding: 0 6px;
			font-size: 11px;
		}

		.node-label span:last-child {
			color: var(--bf-muted);
			font-size: 11px;
		}

		.nested {
			margin-top: 8px;
		}

		.empty {
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 48px;
			border: 1px dashed var(--bf-border);
			border-radius: 4px;
			color: var(--bf-muted);
			font-size: 12px;
		}

		.empty-action {
			width: 100%;
			min-height: 48px;
			border-style: dashed;
			color: var(--bf-muted);
			background: transparent;
		}

		.empty-action:hover {
			color: var(--vscode-foreground);
			border-color: var(--bf-focus);
		}

		.resize-handle {
			position: absolute;
			top: 0;
			right: -4px;
			width: 8px;
			height: 100%;
			cursor: ew-resize;
		}

		.inspector {
			display: grid;
			gap: 8px;
			padding: 10px;
			border: 1px solid var(--bf-border);
			border-radius: 6px;
			background: var(--bf-panel);
		}

		.selection-summary {
			display: grid;
			gap: 2px;
			padding-bottom: 8px;
			border-bottom: 1px solid var(--bf-border);
		}

		.selection-summary strong {
			font-size: 13px;
		}

		.selection-summary span {
			color: var(--bf-muted);
			font-size: 12px;
		}

		.hint {
			color: var(--bf-muted);
			font-size: 12px;
			line-height: 1.4;
		}

		.pill-row {
			display: flex;
			flex-wrap: wrap;
			gap: 5px;
		}

		.span-pill {
			min-height: 24px;
			padding: 0 7px;
			font-size: 11px;
		}

		.span-pill.active {
			color: var(--bf-accent-text);
			background: var(--bf-accent);
			border-color: var(--bf-accent);
		}

		.field-row {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 8px;
		}

		.checkbox-field {
			display: flex;
			align-items: center;
			gap: 8px;
			min-height: 28px;
			color: var(--vscode-foreground);
		}

		.code-panel {
			display: grid;
			gap: 6px;
			padding: 10px;
			border-top: 1px solid var(--bf-border);
		}

		#codeOutput {
			width: 100%;
			min-height: 180px;
			padding: 8px;
			resize: vertical;
			border: 1px solid var(--bf-border);
			border-radius: 6px;
			color: var(--vscode-editor-foreground);
			background: var(--vscode-editor-background);
			font-family: var(--vscode-editor-font-family);
			font-size: var(--vscode-editor-font-size);
			line-height: 1.5;
		}

		.status {
			min-height: 18px;
			color: var(--bf-muted);
			font-size: 12px;
		}

		.status.error {
			color: var(--vscode-errorForeground);
		}
	</style>
</head>
<body>
	<div class="app" data-media="${codiconsUri}">
		<header class="toolbar">
			<label>
				Bootstrap
				<select id="versionSelect">
					<option value="5">Bootstrap 5</option>
					<option value="4">Bootstrap 4</option>
				</select>
			</label>
			<label>
				Output
				<select id="outputSelect">
					<option value="snippet">Snippet</option>
					<option value="full-html">Complete HTML</option>
				</select>
			</label>
			<div id="breakpointBar" class="breakpoint-bar" aria-label="Breakpoints"></div>
			<div class="action-bar">
				<button id="copyButton" class="primary" title="Copy generated code">Copy</button>
				<button id="insertButton" title="Insert into the active editor">Insert</button>
				<button id="createFileButton" title="Create a new HTML document">New HTML</button>
				<button id="undoButton" class="icon" title="Undo last layout change">↶</button>
				<button id="redoButton" class="icon" title="Redo last undone layout change">↷</button>
			</div>
		</header>

			<main class="workspace">
				<section>
					<div class="section-title">
						<span>Layout presets</span>
						<button id="resetButton" class="icon" title="Reset to nested starter">↺</button>
					</div>
					<div id="presetBar" class="preset-bar" aria-label="Layout presets"></div>
				</section>

				<section>
					<div class="section-title">
						<span>Selection path</span>
					</div>
					<div id="breadcrumbs" class="breadcrumbs" aria-label="Selection path"></div>
				</section>

				<section>
					<div class="section-title">
						<span>Visual template</span>
					</div>
					<div id="canvas" class="canvas" aria-label="BootFrame layout canvas"></div>
				</section>

			<section>
				<div class="section-title">
					<span>Properties</span>
				</div>
				<div id="inspector" class="inspector"></div>
			</section>
		</main>

		<section class="code-panel">
			<div class="section-title">
				<span>Generated code</span>
			</div>
			<textarea id="codeOutput" readonly spellcheck="false"></textarea>
			<div id="status" class="status"></div>
		</section>
	</div>

	<script nonce="${nonce}">
		(function () {
			const vscode = acquireVsCodeApi();
			const breakpointsByVersion = {
				'5': ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
				'4': ['xs', 'sm', 'md', 'lg', 'xl']
			};
			const persisted = vscode.getState();
			const maxHistory = 50;
			let idCounter = persisted && typeof persisted.idCounter === 'number' ? persisted.idCounter : 100;
			let dragId = null;
			let resizeState = null;
			let generateTimer = null;
			let state = restoreDesignerState(persisted);
			let undoStack = [];
			let redoStack = [];

			const elements = {
					versionSelect: document.getElementById('versionSelect'),
					outputSelect: document.getElementById('outputSelect'),
					breakpointBar: document.getElementById('breakpointBar'),
					presetBar: document.getElementById('presetBar'),
					breadcrumbs: document.getElementById('breadcrumbs'),
					canvas: document.getElementById('canvas'),
					inspector: document.getElementById('inspector'),
					codeOutput: document.getElementById('codeOutput'),
				status: document.getElementById('status'),
				copyButton: document.getElementById('copyButton'),
				insertButton: document.getElementById('insertButton'),
				createFileButton: document.getElementById('createFileButton'),
				undoButton: document.getElementById('undoButton'),
				redoButton: document.getElementById('redoButton'),
				resetButton: document.getElementById('resetButton')
			};

			elements.versionSelect.addEventListener('change', function (event) {
				mutateState(function () {
					state.version = event.target.value;
					if (!getBreakpoints().includes(state.activeBreakpoint)) {
						state.activeBreakpoint = 'xl';
					}
				});
			});

			elements.outputSelect.addEventListener('change', function (event) {
				state.outputMode = event.target.value;
				saveDesignerState();
				scheduleGenerate();
			});

			elements.copyButton.addEventListener('click', function () {
				postAction('copy');
			});

			elements.insertButton.addEventListener('click', function () {
				postAction('insert');
			});

			elements.createFileButton.addEventListener('click', function () {
				postAction('createFile');
			});

			elements.resetButton.addEventListener('click', resetState);
			elements.undoButton.addEventListener('click', undo);
			elements.redoButton.addEventListener('click', redo);

			document.addEventListener('keydown', function (event) {
				const target = event.target;
				const isEditingText = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

				if (isEditingText || !(event.metaKey || event.ctrlKey)) {
					return;
				}

				const key = event.key.toLowerCase();

				if (key === 'z' && !event.shiftKey) {
					event.preventDefault();
					undo();
				}

				if (key === 'y' || (key === 'z' && event.shiftKey)) {
					event.preventDefault();
					redo();
				}
			});

			document.addEventListener('pointermove', function (event) {
				if (!resizeState) {
					return;
				}

				const width = Math.max(1, resizeState.rowRect.width);
				const nextSpan = clamp(Math.round(((event.clientX - resizeState.colLeft) / width) * 12), 1, 12);
				const entry = findEntry(resizeState.id);

				if (!entry) {
					return;
				}

				const settings = ensureBreakpointSettings(entry.node, state.activeBreakpoint);
				if (settings.span === nextSpan) {
					return;
				}

				settings.span = nextSpan;
				resizeState.changed = true;
				render();
				scheduleGenerate();
			});

			document.addEventListener('pointerup', function () {
				if (resizeState && resizeState.changed) {
					pushUndoSnapshot(resizeState.snapshot);
					redoStack = [];
					render();
				}
				resizeState = null;
			});

			window.addEventListener('message', function (event) {
				const message = event.data;

				if (message.type === 'generated') {
					elements.codeOutput.value = message.code;
				}

				if (message.type === 'status') {
					showStatus(message.message, message.tone);
				}

				if (message.type === 'reset') {
					resetState();
				}
			});

			syncIdCounter();
			normalizeSelectedId();
			render();
			scheduleGenerate();

			function createDefaultState() {
				return {
					version: '5',
					outputMode: 'snippet',
					activeBreakpoint: 'sm',
					selectedId: 'col-main-b',
					root: {
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
										settings: { breakpoints: { sm: { span: 3 } } }
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
														settings: { breakpoints: { xs: { span: 8 }, sm: { span: 6 } } }
													},
													{
														id: 'col-nested-b',
														kind: 'col',
														label: 'Level 2: .col-4 col-sm-6',
														children: [],
														settings: { breakpoints: { xs: { span: 4 }, sm: { span: 6 } } }
													}
												]
											}
										]
									}
								]
							}
						]
					}
				};
			}

			function restoreDesignerState(savedState) {
				if (savedState && savedState.version === 1 && savedState.designerState && savedState.designerState.root) {
					return savedState.designerState;
				}

				return createDefaultState();
			}

			function mutateState(mutator, statusMessage) {
				const before = createSnapshot();
				mutator();
				normalizeSelectedId();
				syncIdCounter();

				if (snapshotKey(before) !== snapshotKey(createSnapshot())) {
					pushUndoSnapshot(before);
					redoStack = [];
				}

				render();
				scheduleGenerate();

				if (statusMessage) {
					showStatus(statusMessage);
				}
			}

			function undo() {
				if (undoStack.length === 0) {
					return;
				}

				redoStack.push(createSnapshot());
				restoreSnapshot(undoStack.pop());
				showStatus('Undone.');
			}

			function redo() {
				if (redoStack.length === 0) {
					return;
				}

				pushUndoSnapshot(createSnapshot());
				restoreSnapshot(redoStack.pop());
				showStatus('Redone.');
			}

			function restoreSnapshot(snapshot) {
				state = cloneValue(snapshot.state);
				idCounter = snapshot.idCounter;
				normalizeSelectedId();
				syncIdCounter();
				render();
				scheduleGenerate();
			}

			function createSnapshot() {
				return {
					idCounter: idCounter,
					state: cloneValue(state)
				};
			}

			function snapshotKey(snapshot) {
				return JSON.stringify(snapshot);
			}

			function pushUndoSnapshot(snapshot) {
				undoStack.push(cloneValue(snapshot));

				if (undoStack.length > maxHistory) {
					undoStack.shift();
				}
			}

			function updateHistoryButtons() {
				elements.undoButton.disabled = undoStack.length === 0;
				elements.redoButton.disabled = redoStack.length === 0;
			}

			function saveDesignerState() {
				vscode.setState({
					version: 1,
					idCounter: idCounter,
					designerState: cloneValue(state)
				});
			}

			function render() {
				elements.versionSelect.value = state.version;
				elements.outputSelect.value = state.outputMode;
				renderBreakpoints();
				renderPresets();
				renderBreadcrumbs();
				renderCanvas();
				renderInspector();
				updateHistoryButtons();
				saveDesignerState();
			}

			function renderBreakpoints() {
				elements.breakpointBar.replaceChildren();
				getBreakpoints().forEach(function (breakpoint) {
					const button = document.createElement('button');
					button.type = 'button';
					button.textContent = breakpoint.toUpperCase();
					button.className = 'breakpoint-button' + (breakpoint === state.activeBreakpoint ? ' active' : '');
					button.addEventListener('click', function () {
						state.activeBreakpoint = breakpoint;
						render();
					});
					elements.breakpointBar.appendChild(button);
				});
			}

			function renderPresets() {
				const presets = [
					{ id: 'single', label: '1 column' },
					{ id: 'two', label: '2 columns' },
					{ id: 'three', label: '3 columns' },
					{ id: 'nested', label: 'Nested starter' }
				];

				elements.presetBar.replaceChildren();
				presets.forEach(function (preset) {
					const button = createButton(preset.label, function () {
						applyPreset(preset.id);
					});
					elements.presetBar.appendChild(button);
				});
			}

			function renderBreadcrumbs() {
				const entry = findEntry(state.selectedId) || findEntry(state.root.id);
				elements.breadcrumbs.replaceChildren();

				if (!entry) {
					return;
				}

				entry.path.forEach(function (node, index) {
					if (index > 0) {
						const separator = document.createElement('span');
						separator.className = 'hint';
						separator.textContent = '>';
						elements.breadcrumbs.appendChild(separator);
					}

					const button = document.createElement('button');
					button.type = 'button';
					button.className = 'breadcrumb-button' + (node.id === state.selectedId ? ' active' : '');
					button.textContent = getNodeDisplayName(node);
					button.title = getNodeDisplayName(node);
					button.addEventListener('click', function () {
						state.selectedId = node.id;
						render();
					});
					elements.breadcrumbs.appendChild(button);
				});
			}

			function renderCanvas() {
				elements.canvas.replaceChildren(renderNode(state.root, 0));
			}

			function renderNode(node, depth) {
				const element = document.createElement('div');
				element.dataset.id = node.id;
				element.className = 'bf-node bf-' + node.kind + (node.id === state.selectedId ? ' selected' : '');
				element.addEventListener('click', function (event) {
					event.stopPropagation();
					state.selectedId = node.id;
					render();
				});

				if (node.kind === 'container') {
					appendNodeLabel(element, node, node.fluid ? 'container-fluid' : 'container');
					appendChildren(element, node, depth);
					return element;
				}

				if (node.kind === 'row') {
					appendChildren(element, node, depth);
					return element;
				}

				const span = getEffectiveSpan(node, state.activeBreakpoint);
				element.style.gridColumn = 'span ' + span;
				element.draggable = true;
				element.addEventListener('dragstart', function (event) {
					dragId = node.id;
					event.dataTransfer.effectAllowed = 'move';
				});
				element.addEventListener('dragover', function (event) {
					if (dragId && canReorder(dragId, node.id)) {
						event.preventDefault();
					}
				});
				element.addEventListener('drop', function (event) {
					event.preventDefault();
					reorderColumns(dragId, node.id);
					dragId = null;
				});

				appendNodeLabel(element, node, 'span ' + span + '/12');
				appendChildren(element, node, depth);

				const handle = document.createElement('div');
				handle.className = 'resize-handle';
				handle.title = 'Resize column';
				handle.addEventListener('pointerdown', function (event) {
					event.preventDefault();
					event.stopPropagation();
					startResize(event, node.id);
				});
				element.appendChild(handle);

				return element;
			}

			function appendNodeLabel(parent, node, meta) {
				const label = document.createElement('div');
				label.className = 'node-label';

				const titleGroup = document.createElement('div');
				titleGroup.className = 'node-title';

				const kind = document.createElement('span');
				kind.className = 'node-kind';
				kind.textContent = node.kind;

				const title = document.createElement('strong');
				title.textContent = getNodeDisplayName(node);

				const details = document.createElement('span');
				details.textContent = meta;

				titleGroup.append(kind, title, details);
				label.append(titleGroup, createNodeTools(node));
				parent.appendChild(label);
			}

			function createNodeTools(node) {
				const tools = document.createElement('div');
				tools.className = 'node-tools';
				const entry = findEntry(node.id);

				if (!entry) {
					return tools;
				}

				if (node.kind === 'row') {
					tools.appendChild(createInlineButton('+ Col', 'Add a column to this row', function () {
						addColumnTo(node);
					}));
				}

				if (node.kind === 'container' || node.kind === 'col') {
					const addRow = createInlineButton('+ Row', 'Add a row inside this item', function () {
						addRowTo(node);
					});
					addRow.disabled = node.kind === 'col' && countColumnDepth(entry) >= 3;
					tools.appendChild(addRow);
				}

				if (node.kind === 'col' && entry.parent) {
					tools.appendChild(createInlineButton('Clone', 'Duplicate this column', function () {
						duplicateColumn(entry);
					}));
				}

				return tools;
			}

			function createInlineButton(text, title, onClick) {
				const button = createButton(text, function (event) {
					event.stopPropagation();
					onClick();
				});
				button.title = title;
				return button;
			}

			function appendChildren(parent, node, depth) {
				if (node.kind === 'row') {
					if (node.children.length === 0) {
						const empty = createEmptyAction('Add first column', function () {
							addColumnTo(node);
						});
						empty.style.gridColumn = '1 / -1';
						parent.appendChild(empty);
						return;
					}

					node.children.forEach(function (child) {
						parent.appendChild(renderNode(child, depth + 1));
					});
					return;
				}

				const wrapper = document.createElement('div');
				wrapper.className = 'nested';

				if (node.children.length === 0) {
					const entry = findEntry(node.id);
					const locked = node.kind === 'col' && entry && countColumnDepth(entry) >= 3;
					const empty = createEmptyAction(locked ? 'Max nesting depth reached' : 'Add nested row', function () {
						addRowTo(node);
					});
					empty.disabled = Boolean(locked);
					wrapper.appendChild(empty);
				} else {
					node.children.forEach(function (child) {
						wrapper.appendChild(renderNode(child, depth + 1));
					});
				}

				parent.appendChild(wrapper);
			}

			function createEmptyAction(text, onClick) {
				const button = createButton(text, function (event) {
					event.stopPropagation();
					onClick();
				});
				button.className = 'empty empty-action';
				return button;
			}

			function renderInspector() {
				const entry = findEntry(state.selectedId);
				elements.inspector.replaceChildren();

				if (!entry) {
					return;
				}

				const summary = document.createElement('div');
				summary.className = 'selection-summary';
				const title = document.createElement('strong');
				title.textContent = getNodeDisplayName(entry.node);
				const subtitle = document.createElement('span');
				subtitle.textContent = getSelectionSummary(entry);
				summary.append(title, subtitle);
				elements.inspector.appendChild(summary);
				renderNodeActions(entry);

				if (entry.node.kind === 'container') {
					renderContainerControls(entry.node);
				}

				if (entry.node.kind === 'row') {
					renderRowControls(entry.node);
				}

				if (entry.node.kind === 'col') {
					renderColumnControls(entry.node, entry);
				}
			}

			function renderContainerControls(node) {
				const checkbox = createCheckbox('Fluid container', Boolean(node.fluid), function (checked) {
					mutateState(function () {
						node.fluid = checked;
					});
				});
				elements.inspector.appendChild(checkbox);
			}

			function renderRowControls(node) {
				const settings = ensureBreakpointSettings(node, state.activeBreakpoint);
				const gutter = createNumberField('Gutter', settings.gutter === undefined ? '' : String(settings.gutter), 0, 5, function (value) {
					mutateState(function () {
						settings.gutter = value === '' ? undefined : Number(value);
					});
				});
				const hint = document.createElement('div');
				hint.className = 'hint';
				hint.textContent = 'Rows hold columns. Use + Col or the empty slot in the canvas to build the grid.';
				elements.inspector.append(gutter, hint);
			}

			function renderColumnControls(node, entry) {
				const settings = ensureBreakpointSettings(node, state.activeBreakpoint);
				const span = settings.span || getEffectiveSpan(node, state.activeBreakpoint);
				const label = createTextField('Label', node.label || '', function (value) {
					mutateState(function () {
						node.label = value;
					});
				});
				const spanField = createRangeField('Span', span, 1, 12, function (value) {
					mutateState(function () {
						settings.span = value;
					});
				});
				const spanPresets = createSpanPresets(node, settings, span);
				const row = document.createElement('div');
				row.className = 'field-row';
				row.append(
					createNumberField('Offset', settings.offset === undefined ? '' : String(settings.offset), 0, 11, function (value) {
						mutateState(function () {
							settings.offset = value === '' ? undefined : Number(value);
						});
					}),
					createNumberField('Order', settings.order === undefined ? '' : String(settings.order), 0, 12, function (value) {
						mutateState(function () {
							settings.order = value === '' ? undefined : Number(value);
						});
					})
				);
				const hidden = createCheckbox('Hidden on this breakpoint', Boolean(settings.hidden), function (checked) {
					mutateState(function () {
						settings.hidden = checked;
					});
				});
				const depthInfo = document.createElement('div');
				depthInfo.className = 'status';
				depthInfo.textContent = 'Nested column level ' + countColumnDepth(entry) + ' of 3';

				elements.inspector.append(label, spanField, spanPresets, row, hidden, depthInfo);
			}

			function createSpanPresets(node, settings, currentSpan) {
				const wrapper = document.createElement('div');
				wrapper.className = 'pill-row';
				[12, 6, 4, 3].forEach(function (span) {
					const button = createButton(String(span) + '/12', function () {
						mutateState(function () {
							settings.span = span;
						});
					});
					button.className = 'span-pill' + (span === currentSpan ? ' active' : '');
					button.title = 'Set ' + state.activeBreakpoint.toUpperCase() + ' span to ' + span;
					wrapper.appendChild(button);
				});

				const allButton = createButton('Apply to all', function () {
					mutateState(function () {
						getBreakpoints().forEach(function (breakpoint) {
							ensureBreakpointSettings(node, breakpoint).span = currentSpan;
						});
					});
				});
				allButton.className = 'span-pill';
				allButton.title = 'Copy this span to every breakpoint';
				wrapper.appendChild(allButton);

				return wrapper;
			}

			function renderNodeActions(entry) {
				const actions = document.createElement('div');
				actions.className = 'action-bar';

				if (entry.node.kind === 'container' || entry.node.kind === 'col') {
					const addRow = createButton(entry.node.kind === 'col' ? 'Add nested row' : 'Add row', function () {
						addRowTo(entry.node);
					});
					addRow.disabled = entry.node.kind === 'col' && countColumnDepth(entry) >= 3;
					actions.appendChild(addRow);
				}

				if (entry.node.kind === 'row') {
					actions.appendChild(createButton('Add column', function () {
						addColumnTo(entry.node);
					}));
				}

				if (entry.node.kind === 'col' && entry.parent) {
					actions.appendChild(createButton('Duplicate', function () {
						duplicateColumn(entry);
					}));
				}

				if (entry.node.id !== state.root.id) {
					actions.appendChild(createButton('Delete', function () {
						deleteSelected(entry);
					}));
				}

				elements.inspector.appendChild(actions);
			}

			function getNodeDisplayName(node) {
				if (node.kind === 'container') {
					return node.fluid ? 'Fluid container' : 'Container';
				}

				if (node.kind === 'row') {
					return 'Row';
				}

				return node.label || 'Column';
			}

			function getSelectionSummary(entry) {
				const depth = countColumnDepth(entry);
				const breakpoint = state.activeBreakpoint.toUpperCase();

				if (entry.node.kind === 'col') {
					return 'Column selected at ' + breakpoint + ' · span ' + getEffectiveSpan(entry.node, state.activeBreakpoint) + '/12 · level ' + depth + '/3';
				}

				if (entry.node.kind === 'row') {
					return 'Row selected at ' + breakpoint + ' · ' + entry.node.children.length + ' columns';
				}

				return 'Root layout selected · ' + entry.node.children.length + ' rows';
			}

			function createTextField(labelText, value, onInput) {
				const label = document.createElement('label');
				label.className = 'field';
				label.textContent = labelText;
				const input = document.createElement('input');
				input.type = 'text';
				input.value = value;
				input.addEventListener('input', function () {
					onInput(input.value);
				});
				label.appendChild(input);
				return label;
			}

			function createNumberField(labelText, value, min, max, onInput) {
				const label = document.createElement('label');
				label.className = 'field';
				label.textContent = labelText;
				const input = document.createElement('input');
				input.type = 'number';
				input.min = String(min);
				input.max = String(max);
				input.value = value;
				input.addEventListener('input', function () {
					onInput(input.value);
				});
				label.appendChild(input);
				return label;
			}

			function createRangeField(labelText, value, min, max, onInput) {
				const label = document.createElement('label');
				label.className = 'field';
				label.textContent = labelText + ': ' + value;
				const input = document.createElement('input');
				input.type = 'range';
				input.min = String(min);
				input.max = String(max);
				input.value = String(value);
				input.addEventListener('input', function () {
					const nextValue = Number(input.value);
					label.firstChild.textContent = labelText + ': ' + nextValue;
					onInput(nextValue);
				});
				label.appendChild(input);
				return label;
			}

			function createCheckbox(labelText, checked, onInput) {
				const label = document.createElement('label');
				label.className = 'checkbox-field';
				const input = document.createElement('input');
				input.type = 'checkbox';
				input.checked = checked;
				input.addEventListener('change', function () {
					onInput(input.checked);
				});
				const span = document.createElement('span');
				span.textContent = labelText;
				label.append(input, span);
				return label;
			}

			function createButton(text, onClick) {
				const button = document.createElement('button');
				button.type = 'button';
				button.textContent = text;
				button.addEventListener('click', onClick);
				return button;
			}

			function applyPreset(presetId) {
				mutateState(function () {
					if (presetId === 'single') {
						state.root = createPresetRoot([{ span: 12, label: 'Main content' }]);
					}

					if (presetId === 'two') {
						state.root = createPresetRoot([
							{ span: 6, label: 'Left column' },
							{ span: 6, label: 'Right column' }
						]);
					}

					if (presetId === 'three') {
						state.root = createPresetRoot([
							{ span: 4, label: 'Column A' },
							{ span: 4, label: 'Column B' },
							{ span: 4, label: 'Column C' }
						]);
					}

					if (presetId === 'nested') {
						const version = state.version;
						const outputMode = state.outputMode;
						const activeBreakpoint = state.activeBreakpoint;
						state = createDefaultState();
						state.version = version;
						state.outputMode = outputMode;
						state.activeBreakpoint = activeBreakpoint;
					} else {
						state.selectedId = state.root.children[0].children[0].id;
					}
				}, 'Preset applied.');
			}

			function createPresetRoot(columns) {
				return {
					id: nextId('container'),
					kind: 'container',
					children: [
						{
							id: nextId('row'),
							kind: 'row',
							children: columns.map(function (column) {
								return createColumn(column.span, column.label);
							})
						}
					]
				};
			}

			function addRowTo(node) {
				mutateState(function () {
					const row = {
						id: nextId('row'),
						kind: 'row',
						children: [
							createColumn(6),
							createColumn(6)
						]
					};
					node.children.push(row);
					state.selectedId = row.id;
				});
			}

			function addColumnTo(row) {
				mutateState(function () {
					const span = Math.max(1, Math.floor(12 / (row.children.length + 1)));
					row.children.push(createColumn(span));
					state.selectedId = row.children[row.children.length - 1].id;
				});
			}

			function createColumn(span, label) {
				return {
					id: nextId('col'),
					kind: 'col',
					label: label || 'Column',
					children: [],
					settings: { breakpoints: { [state.activeBreakpoint]: { span: span } } }
				};
			}

			function duplicateColumn(entry) {
				if (!entry.parent) {
					return;
				}

				mutateState(function () {
					const clone = cloneNode(entry.node);
					clone.id = nextId('col');
					clone.label = (entry.node.label || 'Column') + ' copy';
					const index = entry.parent.children.findIndex(function (child) {
						return child.id === entry.node.id;
					});
					entry.parent.children.splice(index + 1, 0, clone);
					state.selectedId = clone.id;
				});
			}

			function cloneNode(node) {
				return {
					...node,
					id: nextId(node.kind),
					children: node.children.map(cloneNode),
					settings: node.settings ? JSON.parse(JSON.stringify(node.settings)) : undefined
				};
			}

			function deleteSelected(entry) {
				if (!entry.parent) {
					return;
				}

				mutateState(function () {
					entry.parent.children = entry.parent.children.filter(function (child) {
						return child.id !== entry.node.id;
					});
					state.selectedId = entry.parent.id;
				});
			}

			function startResize(event, id) {
				const col = event.currentTarget.closest('.bf-col');
				const row = col ? col.closest('.bf-row') : null;

				if (!col || !row) {
					return;
				}

				resizeState = {
					id: id,
					rowRect: row.getBoundingClientRect(),
					colLeft: col.getBoundingClientRect().left,
					snapshot: createSnapshot(),
					changed: false
				};
			}

			function canReorder(sourceId, targetId) {
				const source = findEntry(sourceId);
				const target = findEntry(targetId);

				return Boolean(source && target && source.parent && source.parent === target.parent);
			}

			function reorderColumns(sourceId, targetId) {
				if (!sourceId || sourceId === targetId || !canReorder(sourceId, targetId)) {
					return;
				}

				const source = findEntry(sourceId);
				const target = findEntry(targetId);
				const siblings = source.parent.children;
				const sourceIndex = siblings.findIndex(function (child) {
					return child.id === sourceId;
				});
				const targetIndex = siblings.findIndex(function (child) {
					return child.id === targetId;
				});
				mutateState(function () {
					const moved = siblings.splice(sourceIndex, 1)[0];
					siblings.splice(targetIndex, 0, moved);
				});
			}

			function findEntry(id) {
				const stack = [{ node: state.root, parent: null, depth: 0, path: [state.root] }];

				while (stack.length > 0) {
					const entry = stack.pop();

					if (entry.node.id === id) {
						return entry;
					}

					entry.node.children.slice().reverse().forEach(function (child) {
						stack.push({
							node: child,
							parent: entry.node,
							depth: entry.depth + 1,
							path: entry.path.concat(child)
						});
					});
				}

				return null;
			}

			function normalizeSelectedId() {
				if (!findEntry(state.selectedId)) {
					state.selectedId = state.root.id;
				}
			}

			function syncIdCounter() {
				idCounter = Math.max(idCounter, getMaxIdNumber(state.root));
			}

			function getMaxIdNumber(node) {
				const match = /-(\\d+)$/.exec(node.id);
				const current = match ? Number(match[1]) : 0;
				const childMax = node.children.reduce(function (max, child) {
					return Math.max(max, getMaxIdNumber(child));
				}, 0);

				return Math.max(current, childMax);
			}

			function countColumnDepth(entry) {
				return entry.path.filter(function (node) {
					return node.kind === 'col';
				}).length;
			}

			function ensureBreakpointSettings(node, breakpoint) {
				if (!node.settings) {
					node.settings = {};
				}

				if (!node.settings.breakpoints) {
					node.settings.breakpoints = {};
				}

				if (!node.settings.breakpoints[breakpoint]) {
					node.settings.breakpoints[breakpoint] = {};
				}

				return node.settings.breakpoints[breakpoint];
			}

			function getEffectiveSpan(node, breakpoint) {
				const breakpoints = getBreakpoints();
				const index = breakpoints.indexOf(breakpoint);
				const settings = node.settings && node.settings.breakpoints ? node.settings.breakpoints : {};

				for (let cursor = index; cursor >= 0; cursor -= 1) {
					const span = settings[breakpoints[cursor]] && settings[breakpoints[cursor]].span;
					if (span) {
						return span;
					}
				}

				for (let cursor = index + 1; cursor < breakpoints.length; cursor += 1) {
					const span = settings[breakpoints[cursor]] && settings[breakpoints[cursor]].span;
					if (span) {
						return span;
					}
				}

				return 12;
			}

			function getBreakpoints() {
				return breakpointsByVersion[state.version];
			}

			function scheduleGenerate() {
				clearTimeout(generateTimer);
				generateTimer = setTimeout(function () {
					vscode.postMessage({
						type: 'generate',
						layout: state.root,
						options: {
							bootstrapVersion: state.version,
							outputMode: state.outputMode
						}
					});
				}, 60);
			}

			function postAction(type) {
				vscode.postMessage({
					type: type,
					layout: state.root,
					options: {
						bootstrapVersion: state.version,
						outputMode: state.outputMode
					}
				});
			}

			function resetState() {
				mutateState(function () {
					state = createDefaultState();
				}, 'Design reset.');
			}

			function showStatus(message, tone) {
				elements.status.textContent = message || '';
				elements.status.className = 'status' + (tone === 'error' ? ' error' : '');
			}

			function nextId(kind) {
				idCounter += 1;
				return kind + '-' + idCounter;
			}

			function clamp(value, min, max) {
				return Math.max(min, Math.min(max, value));
			}

			function cloneValue(value) {
				return JSON.parse(JSON.stringify(value));
			}
		}());
	</script>
</body>
</html>`;
}

function getNonce(): string {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let index = 0; index < 32; index += 1) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}
