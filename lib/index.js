const insertTable     = require('./transforms/insertTable');
const insertRow       = require('./transforms/insertRow');
const removeRow       = require('./transforms/removeRow');
const insertColumn    = require('./transforms/insertColumn');
const removeColumn    = require('./transforms/removeColumn');
const removeTable     = require('./transforms/removeTable');
const moveSelection   = require('./transforms/moveSelection');
const moveSelectionBy = require('./transforms/moveSelectionBy');
const setColumnAlign  = require('./transforms/setColumnAlign');

const onEnter     = require('./onEnter');
const onTab       = require('./onTab');
const onBackspace = require('./onBackspace');
const onUpDown    = require('./onUpDown');
const ALIGN       = require('./ALIGN');
const makeSchema  = require('./makeSchema');
const findBlock   = require('./findBlock');

const KEY_ENTER     = 'enter';
const KEY_TAB       = 'tab';
const KEY_BACKSPACE = 'backspace';
const KEY_DOWN      = 'down';
const KEY_UP        = 'up';


/**
 * @param {String} opts.typeTable The type of table blocks
 * @param {String} opts.typeRow The type of row blocks
 * @param {String} opts.typeCell The type of cell blocks
 * @param {String} opts.typeDefault The type of default block that could be inside cell
 */
function EditTable(opts = {}) {
    opts.typeDefault = opts.typeDefault || null;
    opts.typeTable = opts.typeTable || 'table';
    opts.typeRow = opts.typeRow || 'table_row';
    opts.typeCell = opts.typeCell || 'table_cell';
    opts.onTabCreateRow = opts.onTabCreateRow == null ? true : opts.onTabCreateRow;
    opts.onEnterCreateRow = opts.onEnterCreateRow == null ? true : opts.onEnterCreateRow;

    /**
     * Is the selection in a table
     */
    function isSelectionInTable(state) {
        if (!state.selection.startKey) return false;
        const block = findBlock(opts.typeCell, state, state.startBlock);

        // Only handle events in cells
        return block != null;
    }

    /**
     * Bind a transform
     */
    function bindTransform(fn) {
        return function(transform, ...args) {
            const { state } = transform;

            if (!isSelectionInTable(state)) {
                return transform;
            }

            return fn(opts, transform, ...args);
        };
    }

    /**
     * User is pressing a key in the editor
     */
    function onKeyDown(e, data, state) {
        // Only handle events in cells
        if (!isSelectionInTable(state)) {
            return;
        }

        // Build arguments list
        const args = [ e, data, state, opts ];

        switch (data.key) {
        case KEY_ENTER:
            return onEnter(...args);
        case KEY_TAB:
            return onTab(...args);
        case KEY_BACKSPACE:
            return onBackspace(...args);
        case KEY_DOWN:
        case KEY_UP:
            return onUpDown(...args);
        }
    }

    const schema = makeSchema(opts);

    return {
        onKeyDown,

        schema,

        utils: {
            isSelectionInTable
        },

        transforms: {
            insertTable:     insertTable.bind(null, opts),
            insertRow:       bindTransform(insertRow),
            removeRow:       bindTransform(removeRow),
            insertColumn:    bindTransform(insertColumn),
            removeColumn:    bindTransform(removeColumn),
            removeTable:     bindTransform(removeTable),
            moveSelection:   bindTransform(moveSelection),
            moveSelectionBy: bindTransform(moveSelectionBy),
            setColumnAlign:  bindTransform(setColumnAlign)
        }
    };
}

// Expose align constants to the plugin
EditTable.ALIGN = ALIGN;

module.exports = EditTable;
