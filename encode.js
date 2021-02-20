const inquirer = require('inquirer');
const Table = require('cli-table');

const getNextCode = dict => {
  const dictVals = Object.values(dict).sort((a, b) => b - a);
  return dictVals.length > 0 ? dictVals[0] + 1 : 0;
};

(async () => {
  let { inputText } = await inquirer.prompt([
    {
      type: 'input',
      name: 'inputText',
      message: 'Input cleartext to encode:',
      validate: value => value.length  > 0 ? true : 'Input can\'t be empty!'
    }
  ]);
  const characters = [...new Set(Array.from(inputText))].sort();
  const dict = {};
  for (let i = 0; i < characters.length; i++) {
    const { charCode } = await inquirer.prompt([
      {
        type: 'number',
        name: 'charCode',
        message: `[Dictionary] Input code for ${characters[i]}:`,
        default: () => getNextCode(dict),
      }
    ]);
    dict[characters[i]] = charCode;
  }

  while (true) {
    const ACTION_ENCODE = 'Encode', ACTION_ADD_TO_DICT = 'Add/update dictionary entry';
    const { action } = await inquirer.prompt([
      {
        type: 'rawlist',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
          ACTION_ENCODE,
          ACTION_ADD_TO_DICT
        ]
      }
    ]);
    if (action === ACTION_ENCODE) {
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
      dict[inputChar] = charCode;
    }
  }

  console.log(`Start dictionary: ${Object.entries(dict).map(([char, code]) => `${char}=${code}`).join(', ')}.`);

  const table = new Table({
    head: ['Read', 'Coding Table', 'Output', 'Buffer'],
  });

  let coded = '';
  let buffer = '';
  while (inputText.length > 0) {
    const read = inputText.charAt(0);
    inputText = inputText.substring(1);
    const toWrite = buffer + read;
    let newCode;
    let output = '';
    if (dict[toWrite] === undefined) {
      newCode = getNextCode(dict);
      dict[toWrite] = newCode;
      output = dict[buffer];
      buffer = read;
    } else {
      buffer = toWrite;
    }
    coded += output;
    
    table.push(
      [read, newCode !== undefined ? `${toWrite}, ${newCode}` : '', output, buffer]
    );
  }
  table.push(
    ['EOF', '', dict[buffer], '']
  );
  coded += dict[buffer];

  console.log(table.toString());
  console.log(`Coded output: ${coded}`);
})();
