import {
  JupyterLabPlugin
} from '@jupyterlab/application';

import '../style/index.css';


/**
 * Initialization data for the NB-EXT extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'NB-EXT',
  autoStart: true,
  activate: (app) => {
    console.log('JupyterLab extension NB-EXT is activated!');
  }
};

export default extension;
