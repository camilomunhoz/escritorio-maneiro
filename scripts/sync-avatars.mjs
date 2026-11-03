import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const AVATARS_DIR = path.join(ROOT_DIR, 'public', 'avatars');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src', 'data', 'avatarRegistry.ts');

function parseStyles(styleText) {
  const rules = {};
  const groupRegex = /([^{]+)\{([^}]+)\}/g;
  let match;
  while ((match = groupRegex.exec(styleText)) !== null) {
    const selectors = match[1].split(',').map(s => s.trim());
    const decls = match[2].trim();
    const props = {};
    decls.split(';').forEach(d => {
      const parts = d.split(':');
      if (parts.length === 2) {
        props[parts[0].trim()] = parts[1].trim();
      }
    });
    selectors.forEach(s => {
      if (s.startsWith('.')) {
        const cn = s.slice(1);
        rules[cn] = { ...(rules[cn] || {}), ...props };
      }
    });
  }
  return rules;
}

function processSvg(rawSvg, isBody = false) {
  let styleText = '';
  const styleMatch = rawSvg.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) {
    styleText = styleMatch[1];
  }
  const rules = parseStyles(styleText);

  const svgInnerMatch = rawSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  if (!svgInnerMatch) return '';
  let content = svgInnerMatch[1];

  // Remove <defs>...</defs>
  content = content.replace(/<defs[\s\S]*?<\/defs>/gi, '');

  // Replace class="cls-N" with inline style attributes
  content = content.replace(/class="([^"]+)"/g, (_, clsName) => {
    const classList = clsName.split(/\s+/);
    let mergedProps = {};
    for (const c of classList) {
      if (rules[c]) {
        mergedProps = { ...mergedProps, ...rules[c] };
      }
    }

    if (isBody) {
      // If fill is #fff, mark it for dynamic color injection
      if (mergedProps['fill'] && mergedProps['fill'].toLowerCase() === '#fff') {
        mergedProps['fill'] = '__AVATAR_COLOR__';
      }
    }

    const attrs = Object.entries(mergedProps)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    return attrs;
  });

  return content.trim();
}

function syncAvatars() {
  if (!fs.existsSync(AVATARS_DIR)) {
    console.error(`Diretorio nao encontrado: ${AVATARS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(AVATARS_DIR).sort((a, b) => {
    // Natural number sort (e.g. face-2 before face-10)
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  let legsMarkup = '';
  const bodies = [];
  const faces = [];

  for (const file of files) {
    if (!file.endsWith('.svg')) continue;

    const fullPath = path.join(AVATARS_DIR, file);
    const rawSvg = fs.readFileSync(fullPath, 'utf-8');
    const id = path.basename(file, '.svg');

    if (file.startsWith('legs')) {
      legsMarkup = processSvg(rawSvg, false);
      console.log(`[Pernas] Identificado: ${file}`);
    } else if (file.startsWith('body-')) {
      const markup = processSvg(rawSvg, true);
      const num = id.replace('body-', '');
      bodies.push({
        id,
        name: `Corpo ${num}`,
        markup,
      });
      console.log(`[Corpo] Identificado: ${file}`);
    } else if (file.startsWith('face-')) {
      const markup = processSvg(rawSvg, false);
      const num = id.replace('face-', '');
      faces.push({
        id,
        name: `Rosto ${num}`,
        markup,
      });
      console.log(`[Rosto] Identificado: ${file}`);
    }
  }

  const defaultBodyId = bodies.length > 0 ? bodies[0].id : 'body-15';
  const defaultFaceId = faces.length > 0 ? faces[0].id : 'face-1';

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const fileContent = `/**
 * Arquivo gerado automaticamente por: npm run sync-avatars
 * Nao edite manualmente este arquivo.
 */

export interface AvatarBodyItem {
  id: string;
  name: string;
  markup: string;
}

export interface AvatarFaceItem {
  id: string;
  name: string;
  markup: string;
}

export const LEGS_DEFAULT_MARKUP = ${JSON.stringify(legsMarkup, null, 2)};

export const AVATAR_BODIES: AvatarBodyItem[] = ${JSON.stringify(bodies, null, 2)};

export const AVATAR_FACES: AvatarFaceItem[] = ${JSON.stringify(faces, null, 2)};

export const DEFAULT_BODY_ID = ${JSON.stringify(defaultBodyId)};
export const DEFAULT_FACE_ID = ${JSON.stringify(defaultFaceId)};

const BODIES_MAP = new Map<string, AvatarBodyItem>(AVATAR_BODIES.map(b => [b.id, b]));
const FACES_MAP = new Map<string, AvatarFaceItem>(AVATAR_FACES.map(f => [f.id, f]));

export function getBodyItem(id?: string): AvatarBodyItem {
  if (id && BODIES_MAP.has(id)) {
    return BODIES_MAP.get(id)!;
  }
  return AVATAR_BODIES[0] || { id: DEFAULT_BODY_ID, name: 'Padrao', markup: '' };
}

export function getFaceItem(id?: string): AvatarFaceItem {
  if (id && FACES_MAP.has(id)) {
    return FACES_MAP.get(id)!;
  }
  return AVATAR_FACES[0] || { id: DEFAULT_FACE_ID, name: 'Padrao', markup: '' };
}
`;

  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
  console.log(`\nSincronizacao concluida com sucesso!`);
  console.log(`Corpos: ${bodies.length}`);
  console.log(`Rostos: ${faces.length}`);
  console.log(`Arquivo salvo em: ${OUTPUT_FILE}`);
}

syncAvatars();

