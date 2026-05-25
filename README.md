# BootFrame

BootFrame is a visual Bootstrap layout builder for VS Code.

It adds a BootFrame icon to the Activity Bar. Opening it shows a side-panel builder where you can compose Bootstrap `container`, `row`, and `col` structures visually, resize columns on a 12-column grid, nest rows inside columns, and generate Bootstrap code.

## Features

- Activity Bar view with a compact visual Bootstrap builder.
- Bootstrap 5 output by default, with Bootstrap 4 compatibility mode.
- Snippet and complete HTML document output modes.
- Mouse-based column resizing snapped to the Bootstrap 12-column grid.
- Drag-and-drop column reordering inside a row.
- Nested `container > row > col` patterns up to three column levels.
- Responsive breakpoint controls for spans, offsets, order, visibility, and gutters.
- Automatic designer state restore when the BootFrame view reloads.
- Local undo and redo for layout changes.
- Actions to copy generated code, insert it into the active editor, or create a new HTML document.

## Development

Run the extension in a VS Code Extension Development Host:

```bash
npm run watch
```

Then use the `Run Extension` launch configuration.

Validate the project with:

```bash
npm run compile
npm run lint
npm test
```
