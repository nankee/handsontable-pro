import 'babel-polyfill';
import Handsontable from 'handsontable';

import * as plugins from './plugins/index';

import BottomOverlay from './3rdparty/walkontable/src/overlay/bottom';
import BottomLeftCornerOverlay from './3rdparty/walkontable/src/overlay/bottomLeftCorner';

Handsontable.baseVersion = __HOT_BASE_VERSION__;

module.exports = Handsontable;
