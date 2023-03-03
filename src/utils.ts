import { promises as fs } from 'fs';
import { app } from 'electron';
import { join, dirname } from 'path';
import dayjs from 'dayjs';

export const APP_CONF_JSON = 'chat.conf.json';
export const CHAT_MODEL_JSON = 'chat.model.json';
export const CHAT_MODEL_CMD_JSON = 'chat.model.cmd.json';
export const CHAT_DOWNLOAD_JSON = 'chat.download.json';
export const CHAT_AWESOME_JSON = 'chat.awesome.json';
export const CHAT_NOTES_JSON = 'chat.notes.json';
export const CHAT_PROMPTS_CSV = 'chat.prompts.csv';
export const GITHUB_PROMPTS_CSV_URL =
  'https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv';
export const GITHUB_LOG_URL = 'https://raw.githubusercontent.com/lencx/ChatGPT/main/UPDATE_LOG.md';

export const DISABLE_AUTO_COMPLETE = {
  autoCapitalize: 'off',
  autoComplete: 'off',
  spellCheck: false,
};

export const chatRoot = async () => {
  return join(app.getPath('home'), '.chatgpt');
};

export const chatModelPath = async (): Promise<string> => {
  return join(await chatRoot(), CHAT_MODEL_JSON);
};

export const chatPromptsPath = async (): Promise<string> => {
  return join(await chatRoot(), CHAT_PROMPTS_CSV);
};

type readJSONOpts = { defaultVal?: Record<string, any>; isRoot?: boolean; isList?: boolean };
export const readJSON = async (path: string, opts: readJSONOpts = {}) => {
  const { defaultVal = {}, isRoot = false, isList = false } = opts;
  const root = await chatRoot();
  let file = path;

  if (!isRoot) {
    file = join(root, path);
  }

  try {
    await fs.access(file);
  } catch (e) {
    if (dirname(file) !== root) {
      await fs.mkdir(dirname(file), { recursive: true });
    }
    await fs.writeFile(
      file,
      isList
        ? '[]'
        : JSON.stringify(
            {
              name: 'ChatGPT',
              link: 'https://github.com/lencx/ChatGPT',
              ...defaultVal,
            },
            null,
            2,
          ),
    );
  }

  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
};

type writeJSONOpts = { dir?: string; isRoot?: boolean };
export const writeJSON = async (
  path: string,
  data: Record<string, any>,
  opts: writeJSONOpts = {},
) => {
  const { isRoot = false } = opts;
  const root = await chatRoot();
  let file = path;

  if (!isRoot) {
    file = join(root, path);
  }

  if (isRoot) {
    if (!(await fs.access(dirname(file)).catch(() => null))) {
      await fs.mkdir(dirname(file), { recursive: true });
    }
  }

  await fs.writeFile(file, JSON.stringify(data, null, 2));
};

export const fmtDate = (date: any) => dayjs(date).format('YYYY-MM-DD HH:mm:ss');

export const genCmd = (act: string) =>
  act
    .replace(/\s+|\/+/g, '_')
    .replace(/[^\d\w]/g, '')
    .toLocaleLowerCase();
