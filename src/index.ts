import { initCommander } from './commander';
import { Create } from './create';

export const init = async () => {
  const { projectName, options } = await initCommander();
  new Create(projectName, options);
};

init();
