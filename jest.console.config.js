const JestConsole = require('./node_modules/@jest/console');
global.console = new JestConsole.CustomConsole(process.stdout, process.stderr, (type, message) => {
    const TITLE_INDENT = '    ';
    const CONSOLE_INDENT = TITLE_INDENT + '  ';
    return message.split(/\n/).map(line => CONSOLE_INDENT + line).join('\n');
  });
