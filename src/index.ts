import {
    IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
    JupyterLab, JupyterLabPlugin, ILayoutRestorer
} from '@jupyterlab/application';

import {
    ServerConnection
} from '@jupyterlab/services';

import {
    ToolbarButton, ICommandPalette, InstanceTracker
} from '@jupyterlab/apputils';

import {
    DocumentRegistry
} from '@jupyterlab/docregistry';

import {
    Widget
} from '@phosphor/widgets';

import {
    Token
} from '@phosphor/coreutils';

import {
    NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';

import {
    Message
} from '@phosphor/messaging';

import {
    JSONExt // new
} from '@phosphor/coreutils';
import '../style/index.css';

export
const IButtonExtension = new Token<IButtonExtension>('button.xkcd');


export
interface IButtonExtension extends DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
}
/**
 * The plugin registration information.
 */
/*
const plugin: JupyterLabPlugin<void> = {
    activate,
    id: 'my-extension-name:buttonPlugin',
    autoStart: true
};
*/



/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export
class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
    /**
     * Create a new extension object.
     */
    constructor(app: JupyterLab, palette: ICommandPalette, restorer: ILayoutRestorer) {
        this._app = app;
        this._palette = palette;
        this._restorer = restorer;
    }
    createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
        let callback = () => {
            console.log('Button clicked');
            this.showxkcd();
            //NotebookActions.runAll(panel.notebook, context.session);
        };
        let button = new ToolbarButton({
            className: 'myButton',
            onClick: callback,
            tooltip: 'Show Regulus'
        });

        let i = document.createElement('i');
        i.classList.add('fa', 'fa-fast-forward');
        button.node.appendChild(i);

        panel.toolbar.insertItem(0, 'regulus', button);
        return new DisposableDelegate(() => {
            button.dispose();
        });
    }

    showxkcd() {
        //canvas represents the new widget

        let xkcd = this._xkcd = this._xkcd|| new XkcdWidget();
        const command: string = 'regulus:open';

        let tracker = new InstanceTracker<Widget>({namespace:'regulus'});
        //console.log(this._app);
        //console.log(this._restorer);
        this._restorer.restore(tracker, {
            command,
            args: () => JSONExt.emptyObject,
            name: () => 'regulus'
        });

        xkcd.update();
        if (!xkcd.isAttached) {
            this._app.shell.addToMainArea(xkcd);
        }
        this._app.shell.activateById(xkcd.id);
    }
    private _xkcd : XkcdWidget = null;
    private _app: JupyterLab;
    private _palette: ICommandPalette;
    private _restorer: ILayoutRestorer;
}


class XkcdWidget extends Widget {
    /**
     * Construct a new xkcd widget.
     */
    constructor() {
        super();
        this.settings = ServerConnection.makeSettings();

        this.id = 'xkcd-jupyterlab';
        this.title.label = 'Regulus';
        this.title.closable = true;
        this.addClass('jp-xkcdWidget');

        this.img = document.createElement('img');
        this.img.className = 'jp-xkcdCartoon';
        this.node.appendChild(this.img);

        this.img.insertAdjacentHTML('afterend',
            `<div class="jp-xkcdAttribution">
        <a href="https://creativecommons.org/licenses/by-nc/2.5/" class="jp-xkcdAttribution" target="_blank">
          <img src="https://licensebuttons.net/l/by-nc/2.5/80x15.png" />
        </a>
      </div>`
        );
    }

    /**
     * The server settings associated with the widget.
     */
    readonly settings: ServerConnection.ISettings;

    /**
     * The image element associated with the widget.
     */
    readonly img: HTMLImageElement;

    /**
     * Handle update requests for the widget.
     */
    onUpdateRequest(msg: Message): void {
        ServerConnection.makeRequest({url: 'https://egszlpbmle.execute-api.us-east-1.amazonaws.com/prod'}, this.settings).then(response => {
            this.img.src = response.data.img;
            this.img.alt = response.data.title;
            this.img.title = response.data.alt;
        });
    }
};

/**
 * Activate the extension.
 */
/*function activate(app: JupyterLab) {
    app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
};
*/
function activate(app: JupyterLab, palette: ICommandPalette, restorer: ILayoutRestorer): IButtonExtension {
    let plugin = new ButtonExtension(app,palette,restorer);
    app.docRegistry.addWidgetExtension('Notebook', plugin);
    let widget: XkcdWidget;
    const command: string = 'regulus:open';

    app.commands.addCommand(command, {
        label: 'newRegulus',
        execute: () => {
            if (!widget) {
                // Create a new widget if there is none
                widget = new XkcdWidget();
                widget.update();
            }
            if(!tracker.has(widget)){
                //Track state of widget for restoration, not sure when is tracker initialized
                tracker.add(widget);
            }
            if (!widget.isAttached) {
                // Attach the widget to the main area if it's not there
                app.shell.addToMainArea(widget);
            }else{
                // Refresh the comic in the widget
                widget.update();
            }
            // Activate the widget
            app.shell.activateById(widget.id);
        }
    });
    // Add the command to the palette.
    palette.addItem({ command, category: 'Tutorial' });
    let tracker = new InstanceTracker<Widget>({namespace:'regulus'});
    restorer.restore(tracker, {
        command,
        args: () => JSONExt.emptyObject,
        name: () => 'regulus'
    });
    return plugin;
}


export
const plugin: JupyterLabPlugin<IButtonExtension> = {
    id: 'button.regulus',
    provides: IButtonExtension,
    requires: [ICommandPalette,ILayoutRestorer],
    activate: activate,
    autoStart: true
}

/**
 * Export the plugin as default.
 */
export default plugin;