const inquirer = require('inquirer');
const Table = require('cli-table');

const getNextCode = dict => {
  const dictVals = Object.keys(dict).sort((a, b) => b - a);
  return dictVals.length > 0 ? parseInt(dictVals[0]) + 1 : 0;
};

(async () => {
  let { inputText } = await inquirer.prompt([
    {
      type: 'input',
      name: 'inputText',
      message: 'Input code to decode:',
      validate: value => value.length  > 0 ? true : 'Input can\'t be empty!',
    }
  ]);

  const dict = {};
  while (true) {
    const ACTION_ADD_TO_DICT = 'Add/update dictionary entry', ACTION_DECODE = 'Decode';
    const { action } = await inquirer.prompt([
      {
        type: 'rawlist',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
          ACTION_ADD_TO_DICT,
          ACTION_DECODE
        ]
      }
    ]);
    if (action === ACTION_DECODE) {
      break;
    } else if (action === ACTION_ADD_TO_DICT) {
      const { inputChar } = await inquirer.prompt([
        {
          type: 'input',
          name: 'inputChar',
          message: 'Input char to add/update:',
          validate: value => value.length > 1 ? 'Please only input a single char!' : true,
        }
      ]);
      const { charCode } = await inquirer.prompt([
        {
          type: 'number',
          name: 'charCode',
          message: `[Dictionary] Input code for ${inputChar}:`,
          default: () => getNextCode(dict),
        }
      ]);
      dict[charCode] = inputChar;
    }
  }

  console.log(`Start dictionary: ${Object.entries(dict).map(([code, char]) => `${char}=${code}`).join(', ')}.`);

  const table = new Table({
    head: ['Read', 'Buffer', 'Output', 'q', 'Coding Table'],
  });

  let decoded = '';
  let buffer = '';
  const read = inputText.charAt(0);
  inputText = inputText.substring(1);
  const output = dict[read];
  table.push(
    [read, buffer, output, '', '']
  );
  decoded += output;
  buffer = output;
  while (inputText.length > 0) {
    const read = inputText.charAt(0);
    inputText = inputText.substring(1);
    let output = '';
    let q = '';
    if (dict[read] !== undefined) {
      output = dict[read];
      q = output.charAt(0);
    } else {
      q = buffer.charAt(0);
      output = buffer + q;
    }
    decoded += output;
    const newCode = getNextCode(dict);
    dict[newCode] = buffer + q;
    table.push(
      [read, buffer, output, q, `${buffer + q}, ${newCode}`]
    );
    buffer = dict[read];
  }
  table.push(
    ['EOF', '', '', '', '']
  );

  console.log(table.toString());
  console.log(`Decoded output: ${decoded}`);
})();
