import inquirer from 'inquirer';

/**
 * 询问用户是否确定要覆盖目录
 */
export const overwritePrompy = async () => {
  const { action } = await inquirer.prompt([
    {
      name: 'action',
      type: 'list',
      message: 'Target directory already exists. Are you sure to overwrite it?',
      choices: [
        {
          name: 'yes',
          value: true
        },
        {
          name: 'no',
          value: false
        }
      ]
    }
  ]);
  return action;
};

/**
 * 询问用户选择模板
 */
export const templatePrompy = async () => {
  const { name } = await inquirer.prompt([
    {
      name: 'name',
      type: 'list',
      message: 'Please choose a template to create project.',
      choices: [
        {
          name: 'vue2-element',
          value: 'vue2-template'
        },
        {
          name: 'vue3-admin-element',
          value: 'vue3-admin-element'
        },
        {
          name: 'uni-ts',
          value: 'uni-vscode-ts-template'
        },
        // ...todo
      ]
    }
  ]);
  return name;
};
