import {
  Component
} from 'angular2/core';
import { bootstrap } from 'angular2/platform/browser';

/*
 * Injectables
 */
import {utilInjectables} from './util/util';

import {ChatExampleData} from './ChatExampleData';

/*
 * Webpack
 */
require('../css/styles.scss');

@Component({
  selector: 'chat-app',
  directives: [],
  template: `
  <div>
    <nav-bar></nav-bar>
    <div class="container">
      <chat-threads></chat-threads>
      <chat-window></chat-window>
    </div>
  </div>
  `
})
class ChatApp {
  constructor() {
  }
}

bootstrap(ChatApp, [ utilInjectables ]);

// --------------------
// You can ignore these 'require' statements. The code will work without them.
// They're currently required to get watch-reloading
// from webpack, but removing them is a TODO
require('./services/services');
require('./ChatExampleData');
require('./util/util');
require('./components/ChatNavBar');
require('./components/ChatWindow');
require('./components/ChatThreads');

