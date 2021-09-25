import { initCommander } from './commander';
import { Create } from './create';

export const init = async (): void => {
  const { projectName, options } = await initCommander();
  new Create(projectName, options);
};

init();
