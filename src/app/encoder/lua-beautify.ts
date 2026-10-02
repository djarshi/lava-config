/**
 * Lightweight Lua beautifier.
 *
 * luamin (the library this site bundles) only ships `minify` — there is no
 * `Beautify` in this build. This module re-indents Lua source by tokenizing
 * it (respecting strings and comments) and inserting newlines + tabs around
 * block boundaries and statement starts. It is a re-indenter, not a full
 * formatter: token spacing is reconstructed only where required to keep
 * tokens separate and readable.
 *
 * Good enough to turn a minified one-liner back into legible, indented Lua.
 */

type Tok = { s: string };

const KEYWORDS = new Set([
  'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
  'goto', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return',
  'then', 'true', 'until', 'while',
]);

const STARTERS = new Set(['local', 'return', 'for', 'while', 'if', 'repeat', 'break', 'goto']);

// tokens that, when they precede `function`, mean it is an expression
// (function value) rather than a statement, so we should NOT line-break.
const EXPR_PREV = /^(=|,|\(|\[|\{|and|or|\.\.|==|~=|<=|>=|<|>|\+|-|\*|\/|%|\^|~|return|local)$/;

// tokens that end a statement — used to break before a following identifier
function endsStmt(s: string): boolean {
  return (
    s === 'nil' || s === 'true' || s === 'false' || s === 'end' ||
    s === ')' || s === '}' || s === ']' || s === ';' ||
    /^[0-9]/.test(s) || s.startsWith('"') || s.startsWith("'")
  );
}

function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  const n = src.length;
  const isWord = (c: string) => /[A-Za-z0-9_]/.test(c);

  while (i < n) {
    const c = src[i];

    if (/\s/.test(c)) { i++; continue; }

    // Long-bracket string / comment: [[ ... ]], [=[ ... ]=], --[[ ... ]], --[=[ ... ]=]
    if (c === '[' || (c === '-' && src[i + 1] === '-')) {
      const start = i;
      let j = c === '[' ? i : i + 2; // skip `--` for long comments
      if (src[j] === '[') {
        let eq = 0;
        while (src[j + 1 + eq] === '=') eq++;
        if (src[j + 1 + eq] === '[') {
          const close = ']' + '='.repeat(eq) + ']';
          const end = src.indexOf(close, j + 2 + eq);
          const stop = end === -1 ? n : end + close.length;
          toks.push({ s: src.slice(start, stop) });
          i = stop;
          continue;
        }
      }
      if (c === '-') {
        // line comment --...\n
        let end = src.indexOf('\n', i);
        if (end === -1) end = n;
        toks.push({ s: src.slice(i, end) });
        i = end;
        continue;
      }
      // otherwise '[' is a table index / bracket — fall through
    }

    // Strings
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n) {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === c) { j++; break; }
        j++;
      }
      toks.push({ s: src.slice(i, j) });
      i = j;
      continue;
    }

    // Identifiers / keywords
    if (/[A-Za-z_]/.test(c)) {
      let j = i + 1;
      while (j < n && isWord(src[j])) j++;
      toks.push({ s: src.slice(i, j) });
      i = j;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      let j = i + 1;
      while (j < n && /[0-9a-fA-F.xXpPeE+\-]/.test(src[j])) {
        if ((src[j] === '+' || src[j] === '-') && !/[eEpP]/.test(src[j - 1])) break;
        j++;
      }
      toks.push({ s: src.slice(i, j) });
      i = j;
      continue;
    }

    const three = src.slice(i, i + 3);
    if (three === '...') { toks.push({ s: three }); i += 3; continue; }
    const two = src.slice(i, i + 2);
    if (['..', '==', '~=', '<=', '>=', '::'].includes(two)) {
      toks.push({ s: two }); i += 2; continue;
    }

    toks.push({ s: c });
    i++;
  }
  return toks;
}

const OP = '=!<>*/%^~+-';

function needSpace(left: string, right: string): boolean {
  if (!left) return false;
  const lc = left[left.length - 1];
  const rc = right[0];
  const word = (c: string) => /[A-Za-z0-9_]/.test(c);

  if (word(lc) && word(rc)) return true;                       // two words
  if (word(rc) && (lc === ')' || lc === ']' || lc === '}')) return true; // keyword after bracket
  if (word(rc) && (lc === '"' || lc === "'")) return true;  // keyword/word after a string
  if (lc === '#') return false;                               // length op: no space after #
  if (rc === '#') return lc === ',' || OP.includes(lc) ? true : false; // space before # except after (
  if (lc === ',' || lc === ';') return true;                   // space after , ;
  if (rc === ',' || rc === ';') return false;                  // none before , ;
  if (rc === '(') return word(lc) || lc === ')' || lc === ']' || lc === '}' ? false : true;
  if (rc === ')' || rc === ']' || rc === '}') return false;
  if (lc === '(' || lc === '[' || lc === '{') return false;
  if (rc === '{') return lc === '(' || lc === '[' || lc === ',' ? false : true;
  if (lc === '.' && rc === '.') return true;                   // avoid `..` merge
  if (lc === ':' && rc === ':') return true;                   // avoid `::` merge
  if (lc === '-' && rc === '-') return true;                   // avoid `--` merge
  if (OP.includes(rc) && (word(lc) || OP.includes(lc) || lc === ')' || lc === ']' || lc === '}')) return true;
  if (OP.includes(lc) && (word(rc) || OP.includes(rc) || rc === '"' || rc === "'")) return true;
  return false;
}

function asWord(t: Tok): string {
  const s = t.s;
  return s.length && /[A-Za-z_]/.test(s[0]) && [...s].every(c => /[A-Za-z0-9_]/.test(c)) ? s : '';
}

export function beautifyLua(src: string): string {
  const toks = tokenize(src);
  let indent = 0;
  let line = '';
  const out: string[] = [];
  const tab = '\t';

  let parenDepth = 0;
  let braceDepth = 0;
  let funcHeader = false;
  let funcHeaderDepth = 0;
  let prevSig = '';

  const flush = () => {
    const t = line.trim();
    if (t) out.push(tab.repeat(indent) + t);
    line = '';
  };
  const append = (s: string) => {
    line += (line && needSpace(line, s) ? ' ' : '') + s;
  };

  for (let k = 0; k < toks.length; k++) {
    const t = toks[k];
    const w = asWord(t);

    // Line comment: keep on the current line, then end the line.
    if (t.s.startsWith('--') && !t.s.startsWith('--[[')) {
      append(t.s);
      flush();
      prevSig = t.s;
      continue;
    }

    // Break before statement-starter keywords (but not inside brackets).
    if (w && STARTERS.has(w) && line.trim() && parenDepth === 0 && braceDepth === 0) {
      flush();
    }

    if (w === 'end') {
      flush();
      indent = Math.max(0, indent - 1);
      line = 'end';
      flush();
      prevSig = 'end';
      continue;
    }
    if (w === 'until') {
      flush();
      indent = Math.max(0, indent - 1);
      line = 'until';
      prevSig = 'until';
      continue;
    }
    if (w === 'else') {
      flush();
      indent = Math.max(0, indent - 1);
      line = 'else';
      flush();
      indent++;
      prevSig = 'else';
      continue;
    }
    if (w === 'elseif') {
      flush();
      indent = Math.max(0, indent - 1);
      line = 'elseif';
      prevSig = 'elseif';
      continue;
    }
    if (w === 'then' || w === 'do') {
      append(w);
      flush();
      indent++;
      prevSig = w;
      continue;
    }
    if (w === 'repeat') {
      append(w);
      flush();
      indent++;
      prevSig = 'repeat';
      continue;
    }
    if (w === 'function') {
      const exprPrev = EXPR_PREV.test(prevSig);
      if (!exprPrev && line.trim() && parenDepth === 0 && braceDepth === 0) flush();
      append('function');
      funcHeader = true;
      funcHeaderDepth = parenDepth;
      prevSig = 'function';
      continue;
    }

    // Break before an identifier that starts a new statement (e.g. `nil def.x=...`).
    if (w && !KEYWORDS.has(w) && line.trim() &&
        parenDepth === 0 && braceDepth === 0 && endsStmt(prevSig)) {
      flush();
    }

    if (t.s === '(') { append('('); parenDepth++; prevSig = '('; continue; }
    if (t.s === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
      line += ')';
      if (funcHeader && parenDepth === funcHeaderDepth) {
        funcHeader = false;
        flush();
        indent++;
      }
      prevSig = ')';
      continue;
    }
    if (t.s === '{') { append('{'); braceDepth++; prevSig = '{'; continue; }
    if (t.s === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
      line += '}';
      if (braceDepth === 0) flush();
      prevSig = '}';
      continue;
    }
    if (t.s === ';') { line += ';'; flush(); prevSig = ';'; continue; }

    append(t.s);
    prevSig = t.s;
  }
  flush();
  return out.join('\n');
}