// 2018-12-11
//
// Blockly blocks to support events.
//
// Author: Sascha.MuellerzumHagen@baslerweb.com

var COLOR_EVENTS = 250;

var eventDict = null;

// This function will crate the dictionary for the Event object.
// There is a hack insisde this function to detect that there is a redraw of the blockly engine.
// It should be rewritten when I understand the system a little bit more.
function appendEvent(eventName, funcName) {
    // add the nedded include
    Blockly.Python.definitions_.import_event = 'from hucon import EventSystem, Button';

    // Create or append the event to the list
    if (Blockly.Python.definitions_['eventDict'] == undefined) {
        Blockly.Python.definitions_.eventDict = '';
        eventDict = [
            '# Map event name to callback.',
            'events_dict = {',
            '  "{1}": Button(register_callback={2})',
            '}',
            '',
            '# Setup event system.',
            'process_events = EventSystem(events_dict)',
            ''
        ].join('\n');
    } else {
        eventDict = eventDict.replace('\n}', ',\n  "{1}": Button(register_callback={2})\n}');
    }

    eventDict = HuConApp.formatVarString(eventDict, eventName, funcName);
}

Blockly.Blocks.event_init = {
    init: function () {
        this.appendDummyInput()
            .appendField('Init events');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLOR_EVENTS);
        this.setTooltip('Initialize the event engine.');
    }
};
Blockly.Python.event_init = function(block) {
    return eventDict;
};

Blockly.Blocks.event_run_endless = {
    init: function () {
        this.appendDummyInput()
            .appendField('Run endless ...');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLOR_EVENTS);

        this.setTooltip('Run forever.');
    }
};
Blockly.Python.event_run_endless = function(block) {
    return 'process_events.run()\n';
};

Blockly.Blocks.event_stop_endless = {
    init: function () {
        this.appendDummyInput()
            .appendField('Stop endless process');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLOR_EVENTS);
        this.setTooltip('Stop the current endless running event process.');
    }
};
Blockly.Python.event_stop_endless = function(block) {
    return 'process_events.stop()\n';
};

Blockly.Blocks.event_button_object = {
    init: function () {
        this.appendDummyInput()
            .appendField('Button Event');
        this.appendStatementInput('function')
            .setCheck(null)
            .appendField(new Blockly.FieldTextInput('EventName'), 'EventName');
        this.setColour(COLOR_EVENTS);

        var thisBlock = this;
        this.setTooltip(function() {
            return 'Callback for Button \'' + thisBlock.getFieldValue('EventName') + '\' event.';
        });
    }
};
Blockly.Python.event_button_object = function(block) {
    // Catch all global variables.
    var globals = [];
    globals.push('process_events');
    var variables = Blockly.Variables.allUsedVarModels(block.workspace) || [];
    for (var i = 0, variable; variable = variables[i]; i++) {
        globals.push(Blockly.Python.variableDB_.getName(variable.name, Blockly.Variables.NAME_TYPE));
    }
    globals = globals.length ? Blockly.Python.INDENT + 'global ' + globals.join(', ') + '\n' : '';

    var statementsFunc = Blockly.Python.statementToCode(block, 'function');

    var eventName = block.getFieldValue('EventName');
    var funcName = Blockly.Python.variableDB_.getName(eventName, Blockly.Procedures.NAME_TYPE);

    if (statementsFunc == '') {
        statementsFunc = Blockly.Python.PASS;
    }

    var code = [
        'def {1}():',
        '  """ Callback for Button \'{2}\' event.',
        '  """',
        globals + statementsFunc,
        ''
    ].join('\n');
    code = HuConApp.formatVarString(code, funcName, eventName);

    code = Blockly.Python.scrub_(block, code);
    Blockly.Python.definitions_['%' + funcName] = code;

    appendEvent(eventName, funcName);
    return null;
};
