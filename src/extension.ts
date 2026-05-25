import * as vscode from 'vscode';
import { generateBootstrapCode } from './generator';
import { BootFrameSettings, GenerationOptions, LayoutNode } from './model';
import { getWebviewHtml } from './webviewContent';

interface BuilderMessage {
	type: 'generate' | 'copy' | 'insert' | 'createFile';
	layout?: LayoutNode;
	options?: GenerationOptions;
}

function readSettings(): BootFrameSettings {
	const config = vscode.workspace.getConfiguration('bootframe');
	return {
		defaultVersion: config.get('defaultVersion', '5'),
		defaultOutputMode: config.get('defaultOutputMode', 'snippet'),
		maxUndoHistory: config.get('maxUndoHistory', 50),
	};
}

export function activate(context: vscode.ExtensionContext) {
	const provider = new BootFrameViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(BootFrameViewProvider.viewType, provider),
		vscode.commands.registerCommand('bootframe.openBuilder', () => {
			return vscode.commands.executeCommand(`${BootFrameViewProvider.viewType}.focus`);
		}),
		vscode.commands.registerCommand('bootframe.resetBuilder', () => provider.reset()),
	);
}

export function deactivate() {}

class BootFrameViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'bootframe.builder';

	private view?: vscode.WebviewView;

	public constructor(private readonly extensionUri: vscode.Uri) {}

	public resolveWebviewView(webviewView: vscode.WebviewView) {
		this.view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
		};

		const settings = readSettings();
		webviewView.webview.html = getWebviewHtml(webviewView.webview, this.extensionUri, settings);

		webviewView.webview.onDidReceiveMessage((message: BuilderMessage) => {
			void this.handleMessage(message);
		});
	}

	public reset() {
		void this.view?.webview.postMessage({ type: 'reset' });
	}

	private async handleMessage(message: BuilderMessage) {
		if (!message.layout || !message.options) {
			return;
		}

		try {
			const config = vscode.workspace.getConfiguration('bootframe');
			const merged: GenerationOptions = message.type === 'createFile'
				? { ...message.options, outputMode: 'full-html' }
				: { ...message.options };
			merged.indentSize = config.get('indentSize', 2);
			merged.includeBootstrapJS = config.get('includeBootstrapJS', false);
			const options = merged;
			const code = generateBootstrapCode(message.layout, options);

			if (message.type === 'generate') {
				await this.view?.webview.postMessage({ type: 'generated', code });
				return;
			}

			if (message.type === 'copy') {
				await vscode.env.clipboard.writeText(code);
				await this.view?.webview.postMessage({ type: 'status', message: 'Code copied.' });
				return;
			}

			if (message.type === 'insert') {
				await this.insertIntoActiveEditor(code);
				return;
			}

			if (message.type === 'createFile') {
				await this.createUntitledDocument(code);
			}
		} catch (error) {
			const messageText = error instanceof Error ? error.message : 'Unable to generate Bootstrap code.';
			await this.view?.webview.postMessage({ type: 'status', message: messageText, tone: 'error' });
		}
	}

	private async insertIntoActiveEditor(code: string) {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			await this.view?.webview.postMessage({ type: 'status', message: 'Open an editor before inserting code.', tone: 'error' });
			return;
		}

		await editor.edit((builder) => {
			builder.insert(editor.selection.active, code);
		});
		await this.view?.webview.postMessage({ type: 'status', message: 'Code inserted.' });
	}

	private async createUntitledDocument(code: string) {
		const document = await vscode.workspace.openTextDocument({
			content: code,
			language: 'html',
		});

		await vscode.window.showTextDocument(document);
		await this.view?.webview.postMessage({ type: 'status', message: 'HTML document created.' });
	}
}
