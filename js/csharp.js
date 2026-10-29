function CSharpFactory(root) {
// ===== Simulador de C# (subconjunto de los temas 1-4) — léxico y sintaxis =====

class CompileError extends Error {
  constructor(msg, line, code) { super(msg); this.line = line; this.code = code || ''; }
}

const KEYWORDS = new Set(('abstract as base bool break byte case catch char checked class const continue decimal default ' +
  'delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit in int ' +
  'interface internal is lock long namespace new null object operator out override params private protected public ' +
  'readonly ref return sbyte sealed short sizeof stackalloc static string struct switch this throw true try typeof ' +
  'uint ulong unchecked unsafe ushort using virtual void volatile while').split(' '));

const OPS = ['<<=', '>>=', '++', '--', '&&', '||', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=',
  '<<', '>>', '=>', '??', '::', '+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '?', ':', ';', ',', '.',
  '(', ')', '{', '}', '[', ']'];

const ID_START = /[\p{L}_]/u, ID_PART = /[\p{L}\p{N}_]/u;

function lex(src) {
  const toks = [];
  let i = 0, line = 1;
  const n = src.length;
  const err = (m) => { throw new CompileError(m, line, 'CS1056'); };
  const readEscape = () => {
    const c = src[i++];
    switch (c) {
      case 'n': return '\n'; case 't': return '\t'; case 'r': return '\r'; case '0': return '\0';
      case '\\': return '\\'; case '\'': return '\''; case '"': return '"'; case 'a': return '\x07';
      case 'b': return '\b'; case 'f': return '\f'; case 'v': return '\v';
      case 'u': { const h = src.substr(i, 4); i += 4; if (!/^[0-9a-fA-F]{4}$/.test(h)) err('Secuencia de escape \\u no válida'); return String.fromCharCode(parseInt(h, 16)); }
      case 'x': { let h = ''; while (h.length < 4 && /[0-9a-fA-F]/.test(src[i] || '')) h += src[i++]; if (!h) err('Secuencia de escape \\x no válida'); return String.fromCharCode(parseInt(h, 16)); }
      default: throw new CompileError('Secuencia de escape no reconocida: \\' + c, line, 'CS1009');
    }
  };
  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r' || c === '\f' || c === '\v' || c === '﻿' || c === ' ') { i++; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
      if (i >= n) throw new CompileError('Falta cerrar el comentario /* ... */', line, 'CS1035');
      i += 2; continue;
    }
    if (c === '#') { while (i < n && src[i] !== '\n') i++; continue; }
    const startLine = line;
    if (c === '$' && (src[i + 1] === '"' || (src[i + 1] === '@' && src[i + 2] === '"')))
      throw new CompileError('Las cadenas con $ ($"...{x}...") son de C# 6 y tu compilador (C# 5) no las admite. Usa {0} o el operador +.', line, 'CS8026');
    if (c === '@' && src[i + 1] === '"') {
      i += 2; let s = '';
      while (true) {
        if (i >= n) throw new CompileError('Falta cerrar la cadena con "', startLine, 'CS1010');
        if (src[i] === '"') { if (src[i + 1] === '"') { s += '"'; i += 2; continue; } i++; break; }
        if (src[i] === '\n') line++;
        s += src[i++];
      }
      toks.push({ t: 'str', v: s, line: startLine }); continue;
    }
    if (c === '"') {
      i++; let s = '';
      while (true) {
        if (i >= n || src[i] === '\n') throw new CompileError('Falta cerrar la cadena con "', startLine, 'CS1010');
        const d = src[i];
        if (d === '"') { i++; break; }
        if (d === '\\') { i++; s += readEscape(); continue; }
        s += d; i++;
      }
      toks.push({ t: 'str', v: s, line }); continue;
    }
    if (c === '\'') {
      i++; let ch;
      if (src[i] === '\\') { i++; ch = readEscape(); }
      else if (src[i] === '\'' ) throw new CompileError("Carácter vacío: '' no es un char válido", line, 'CS1011');
      else { if (src[i] === '\n' || i >= n) throw new CompileError("Falta cerrar el carácter con '", line, 'CS1010'); ch = src[i++]; }
      if (src[i] !== '\'') throw new CompileError("Un char lleva un solo carácter entre comillas simples (para texto usa comillas dobles \"...\")", line, 'CS1012');
      i++;
      toks.push({ t: 'chr', v: ch.charCodeAt(0), line }); continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      let s = '', isReal = false, ty;
      if (c === '0' && (src[i + 1] === 'x' || src[i + 1] === 'X')) {
        i += 2; while (/[0-9a-fA-F]/.test(src[i] || '')) s += src[i++];
        let v = parseInt(s, 16); ty = v > 2147483647 ? 'long' : 'int';
        if (/[lL]/.test(src[i] || '')) { i++; ty = 'long'; }
        toks.push({ t: 'num', v, ty, line }); continue;
      }
      while (/[0-9]/.test(src[i] || '')) s += src[i++];
      if (src[i] === '.' && /[0-9]/.test(src[i + 1] || '')) { isReal = true; s += src[i++]; while (/[0-9]/.test(src[i] || '')) s += src[i++]; }
      if ((src[i] === 'e' || src[i] === 'E') && /[0-9+\-]/.test(src[i + 1] || '')) {
        isReal = true; s += src[i++]; if (src[i] === '+' || src[i] === '-') s += src[i++];
        while (/[0-9]/.test(src[i] || '')) s += src[i++];
      }
      const suf = src[i] || '';
      let v = Number(s);
      if (suf === 'f' || suf === 'F') { i++; ty = 'float'; v = Math.fround(v); }
      else if (suf === 'd' || suf === 'D' || suf === 'm' || suf === 'M') { i++; ty = 'double'; }
      else if (suf === 'l' || suf === 'L') { i++; if (isReal) err('Sufijo L no válido en un número con decimales'); ty = 'long'; }
      else if (suf === 'u' || suf === 'U') { i++; if (src[i] === 'l' || src[i] === 'L') i++; ty = 'long'; }
      else ty = isReal ? 'double' : (v > 2147483647 ? 'long' : 'int');
      if (ID_PART.test(src[i] || '')) throw new CompileError('Número mal escrito: ' + s + src[i], line, 'CS1013');
      toks.push({ t: 'num', v, ty, line }); continue;
    }
    if (ID_START.test(c) || (c === '@' && ID_START.test(src[i + 1] || ''))) {
      let verbatim = false; if (c === '@') { verbatim = true; i++; }
      let s = '';
      while (i < n && ID_PART.test(src[i])) s += src[i++];
      toks.push({ t: (!verbatim && KEYWORDS.has(s)) ? 'kw' : 'id', v: s, line }); continue;
    }
    let op = null;
    for (const o of OPS) if (src.startsWith(o, i)) { op = o; break; }
    if (!op) throw new CompileError('Carácter inesperado: ' + c, line, 'CS1056');
    toks.push({ t: 'op', v: op, line }); i += op.length;
  }
  toks.push({ t: 'eof', v: '', line });
  return toks;
}

// ---------- Tipos (como texto: "int", "string", "int[]", "int[,]", "int[][]", "S:tipoPersona") ----------
const PRIM_KW = new Set(['int', 'long', 'short', 'byte', 'sbyte', 'ushort', 'uint', 'ulong', 'float', 'double', 'decimal',
  'char', 'bool', 'string', 'object', 'void']);
const TYPE_ALIAS = { String: 'string', Int32: 'int', Int64: 'long', Int16: 'short', Double: 'double', Single: 'float',
  Char: 'char', Boolean: 'bool', Byte: 'byte', Object: 'object', Decimal: 'decimal', SByte: 'sbyte', UInt16: 'ushort',
  UInt32: 'uint', UInt64: 'ulong' };
// shortcut: decimal se trata como double y los tipos sin signo como el con signo más próximo; casi nunca se usan en el tema 4
const SIMPLIFY = { decimal: 'double', sbyte: 'short', ushort: 'int', uint: 'long', ulong: 'long' };
const GENERIC_NAMES = new Set(['List', 'Dictionary', 'Queue', 'Stack', 'HashSet', 'ArrayList', 'SortedList']);

class Parser {
  constructor(toks) { this.toks = toks; this.p = 0; }
  get tok() { return this.toks[this.p]; }
  peek(k = 1) { return this.toks[Math.min(this.p + k, this.toks.length - 1)]; }
  is(v, k = 0) { const t = this.peek(k); return (t.t === 'op' || t.t === 'kw') && t.v === v; }
  next() { return this.toks[this.p++]; }
  accept(v) { if (this.is(v)) { this.p++; return true; } return false; }
  expect(v) {
    if (this.is(v)) return this.next();
    const t = this.tok;
    const line = (v === ';' || v === ')') && this.p > 0 ? this.toks[this.p - 1].line : t.line;
    throw new CompileError("Se esperaba '" + v + "'" + (t.t === 'eof' ? ' antes del final del programa' : " y aparece '" + t.v + "'"), line, v === ';' ? 'CS1002' : 'CS1026');
  }
  ident() {
    const t = this.tok;
    if (t.t === 'id') { this.p++; return t.v; }
    throw new CompileError("Se esperaba un nombre" + (t.t === 'kw' ? " ('" + t.v + "' es una palabra reservada de C#)" : " y aparece '" + t.v + "'"), t.line, 'CS1001');
  }

  // --- tipos ---
  tryType() {
    const t = this.tok; let base;
    if (t.t === 'kw' && PRIM_KW.has(t.v)) { this.p++; base = t.v; }
    else if (t.t === 'id') {
      this.p++; base = t.v;
      while (this.is('.') && this.peek().t === 'id') { this.p++; base = this.next().v; }
      if (this.is('<') && GENERIC_NAMES.has(base))
        throw new CompileError(base + '<...> se ve en temas posteriores; este simulador solo admite lo del tema 4 (arrays, struct, string).', t.line, 'SIM');
    } else return null;
    base = TYPE_ALIAS[base] || base;
    base = SIMPLIFY[base] || base;
    let ty = base;
    while (this.is('[') && (this.is(']', 1) || this.is(',', 1))) {
      this.p++; let g = '[';
      while (this.accept(',')) g += ',';
      this.expect(']'); ty += g + ']';
    }
    return ty;
  }
  type() {
    const t = this.tok, ty = this.tryType();
    if (!ty) throw new CompileError("Se esperaba un tipo y aparece '" + t.v + "'", t.line, 'CS1031');
    return ty;
  }
  looksLikeDecl() {
    const save = this.p;
    try {
      const ty = this.tryType();
      if (!ty) return false;
      if (this.tok.t !== 'id') return false;
      const after = this.peek();
      return after.t === 'op' && ['=', ';', ',', ')'].includes(after.v) || (after.t === 'kw' && after.v === 'in');
    } catch (e) { if (e instanceof CompileError && e.code === 'SIM') throw e; return false; }
    finally { this.p = save; }
  }

  // --- unidad ---
  parseUnit() {
    const unit = { classes: [], structs: [] };
    while (this.tok.t !== 'eof') {
      if (this.accept('using')) { while (!this.is(';') && this.tok.t !== 'eof') this.p++; this.expect(';'); continue; }
      if (this.accept('namespace')) {
        this.ident(); while (this.accept('.')) this.ident();
        this.expect('{');
        while (!this.is('}') && this.tok.t !== 'eof') this.parseTypeDecl(unit, null);
        this.expect('}'); continue;
      }
      this.parseTypeDecl(unit, null);
    }
    return unit;
  }
  modifiers() {
    const mods = new Set();
    const M = ['public', 'private', 'protected', 'internal', 'static', 'readonly', 'override', 'virtual', 'abstract', 'sealed', 'new', 'extern', 'unsafe', 'volatile'];
    while (true) {
      const t = this.tok;
      if (t.t === 'kw' && M.includes(t.v)) { mods.add(t.v); this.p++; continue; }
      if (t.t === 'id' && t.v === 'partial') { this.p++; continue; }
      if (this.is('[')) { // atributos [STAThread]
        let depth = 0; do { if (this.is('[')) depth++; if (this.is(']')) depth--; this.p++; } while (depth > 0 && this.tok.t !== 'eof');
        continue;
      }
      return mods;
    }
  }
  parseTypeDecl(unit, outer) {
    const mods = this.modifiers();
    const t = this.tok;
    if (this.accept('class')) return this.parseClass(unit, outer, mods, t.line);
    if (this.accept('struct')) return this.parseStruct(unit, outer, t.line);
    if (this.is('enum') || this.is('interface')) throw new CompileError("'" + t.v + "' se ve más adelante; este simulador no lo admite.", t.line, 'SIM');
    throw new CompileError("Se esperaba 'class' y aparece '" + t.v + "'", t.line, 'CS1518');
  }
  parseClass(unit, outer, mods, line) {
    const name = this.ident();
    if (this.accept(':')) { this.ident(); while (this.accept(',')) this.ident(); }
    const cls = { name, line, fields: [], methods: [], isStatic: mods.has('static') };
    unit.classes.push(cls);
    this.expect('{');
    while (!this.is('}')) {
      if (this.tok.t === 'eof') throw new CompileError("Falta la llave de cierre '}' de la clase " + name, this.tok.line, 'CS1513');
      const save = this.p;
      const m = this.modifiers();
      const t = this.tok;
      if (this.is('class') || this.is('struct') || this.is('enum') || this.is('interface')) { this.p = save; this.parseTypeDecl(unit, cls); continue; }
      if (this.accept('const')) {
        const ty = this.type();
        do { const nl = this.tok.line; const n = this.ident(); this.expect('='); cls.fields.push({ name: n, ty, init: this.expr(), isConst: true, isStatic: true, line: nl }); } while (this.accept(','));
        this.expect(';'); continue;
      }
      if (t.t === 'id' && t.v === name && this.is('(', 1))
        throw new CompileError('Los constructores se ven más adelante; este simulador no los admite.', t.line, 'SIM');
      const ty = this.type();
      const nameTok = this.tok; const mname = this.ident();
      if (this.is('(')) { cls.methods.push(this.parseMethod(cls, ty, mname, m, nameTok.line)); continue; }
      if (this.is('{')) throw new CompileError('Las propiedades { get; set; } se ven más adelante; este simulador no las admite.', nameTok.line, 'SIM');
      let fname = mname, fline = nameTok.line;
      while (true) {
        const f = { name: fname, ty, init: null, isStatic: m.has('static'), line: fline, readonly: m.has('readonly') };
        if (this.accept('=')) f.init = this.is('{') ? this.arrayInit() : this.expr();
        cls.fields.push(f);
        if (!this.accept(',')) break;
        fline = this.tok.line; fname = this.ident();
      }
      this.expect(';');
    }
    this.expect('}');
    this.accept(';');
    return cls;
  }
  parseStruct(unit, outer, line) {
    const name = this.ident();
    const st = { name, line, fields: [], outer: outer ? outer.name : null };
    unit.structs.push(st);
    this.expect('{');
    while (!this.is('}')) {
      if (this.tok.t === 'eof') throw new CompileError("Falta la llave de cierre '}' del struct " + name, this.tok.line, 'CS1513');
      const m = this.modifiers();
      if (this.is('struct') || this.is('class')) throw new CompileError('Este simulador no admite tipos declarados dentro de un struct; decláralo fuera.', this.tok.line, 'SIM');
      const t0 = this.tok;
      if (t0.t === 'id' && t0.v === name && this.is('(', 1)) throw new CompileError('Los constructores se ven más adelante; este simulador no los admite.', t0.line, 'SIM');
      const ty = this.type();
      const fl = this.tok.line;
      let fname = this.ident();
      if (this.is('(')) throw new CompileError('Los métodos dentro de un struct se ven más adelante; este simulador no los admite.', fl, 'SIM');
      while (true) {
        if (this.is('=')) throw new CompileError("Los campos de un struct no pueden tener valor inicial ('" + fname + "')", this.tok.line, 'CS0573');
        st.fields.push({ name: fname, ty, line: fl, isPublic: m.has('public') || m.has('internal') });
        if (!this.accept(',')) break;
        fname = this.ident();
      }
      this.expect(';');
    }
    this.expect('}');
    this.accept(';');
    return st;
  }
  parseMethod(cls, ret, name, mods, line) {
    this.expect('(');
    const params = [];
    if (!this.is(')')) {
      do {
        let mod = null;
        if (this.is('ref') || this.is('out')) mod = this.next().v;
        if (this.is('params')) throw new CompileError("'params' no está soportado en este simulador", this.tok.line, 'SIM');
        const ty = this.type(); const pn = this.ident();
        if (this.is('=')) throw new CompileError('Los parámetros opcionales no están soportados en este simulador', this.tok.line, 'SIM');
        params.push({ name: pn, ty, mod });
      } while (this.accept(','));
    }
    this.expect(')');
    if (this.is('=>')) throw new CompileError('Los métodos con => son de C# 6; tu compilador no los admite.', this.tok.line, 'CS8026');
    const body = this.block();
    return { name, ret, params, body, isStatic: mods.has('static'), line, cls: cls.name };
  }

  // --- sentencias ---
  block() {
    const t = this.expect('{');
    const body = [];
    while (!this.is('}')) {
      if (this.tok.t === 'eof') throw new CompileError("Falta una llave de cierre '}' (la que abre está en la línea " + t.line + ')', this.tok.line, 'CS1513');
      body.push(this.statement());
    }
    this.next();
    return { k: 'block', body, line: t.line };
  }
  statement() {
    const t = this.tok, line = t.line;
    if (this.is('{')) return this.block();
    if (this.accept(';')) return { k: 'empty', line };
    if (t.t === 'kw') {
      switch (t.v) {
        case 'if': {
          this.p++; this.expect('('); const cond = this.expr(); this.expect(')');
          const then = this.embedded(); let els = null;
          if (this.accept('else')) els = this.embedded();
          return { k: 'if', cond, then, els, line };
        }
        case 'while': { this.p++; this.expect('('); const cond = this.expr(); this.expect(')'); return { k: 'while', cond, body: this.embedded(), line }; }
        case 'do': {
          this.p++; const body = this.embedded();
          if (!this.is('while')) throw new CompileError("Se esperaba 'while' después del cuerpo del do", this.tok.line, 'CS1003');
          this.p++; this.expect('('); const cond = this.expr(); this.expect(')'); this.expect(';');
          return { k: 'do', body, cond, line };
        }
        case 'for': {
          this.p++; this.expect('(');
          let init = [];
          if (!this.is(';')) {
            if (this.looksLikeDecl()) init = [this.localDecl()];
            else { do init.push({ k: 'expr', e: this.expr(), line }); while (this.accept(',')); }
          }
          this.expect(';');
          const cond = this.is(';') ? null : this.expr(); this.expect(';');
          const iter = [];
          if (!this.is(')')) do iter.push(this.expr()); while (this.accept(','));
          this.expect(')');
          return { k: 'for', init, cond, iter, body: this.embedded(), line };
        }
        case 'foreach': {
          this.p++; this.expect('(');
          const ty = this.type(); const name = this.ident();
          if (!this.is('in')) throw new CompileError("Se esperaba 'in' en el foreach", this.tok.line, 'CS1515');
          this.p++; const coll = this.expr(); this.expect(')');
          return { k: 'foreach', ty, name, coll, body: this.embedded(), line };
        }
        case 'switch': return this.switchStmt();
        case 'break': this.p++; this.expect(';'); return { k: 'break', line };
        case 'continue': this.p++; this.expect(';'); return { k: 'continue', line };
        case 'return': { this.p++; const e = this.is(';') ? null : this.expr(); this.expect(';'); return { k: 'return', e, line }; }
        case 'throw': { this.p++; const e = this.is(';') ? null : this.expr(); this.expect(';'); return { k: 'throw', e, line }; }
        case 'try': return this.tryStmt();
        case 'const': {
          this.p++; const d = this.localDecl(); d.isConst = true; this.expect(';');
          for (const v of d.vars) if (!v.init) throw new CompileError('Una constante necesita un valor', line, 'CS0145');
          return d;
        }
        case 'goto': throw new CompileError("'goto' no está soportado en este simulador", line, 'SIM');
        case 'else': throw new CompileError("'else' sin un 'if' delante (revisa las llaves y los ';' tras el if)", line, 'CS1525');
        case 'case': case 'default':
          if (!(t.v === 'default' && this.is('(', 1))) throw new CompileError("'" + t.v + "' fuera de un switch", line, 'CS1525');
      }
    }
    if (this.looksLikeDecl()) { const d = this.localDecl(); this.expect(';'); return d; }
    const e = this.expr();
    this.expect(';');
    return { k: 'expr', e, line };
  }
  embedded() {
    const t = this.tok;
    if (this.looksLikeDecl() && !this.is('{')) throw new CompileError('Aquí no se puede declarar una variable sin llaves { }', t.line, 'CS1023');
    return this.statement();
  }
  localDecl() {
    const line = this.tok.line;
    const ty = this.type();
    const vars = [];
    do {
      const vl = this.tok.line;
      const name = this.ident();
      let init = null;
      if (this.accept('=')) init = this.is('{') ? this.arrayInit() : this.expr();
      vars.push({ name, init, line: vl });
    } while (this.accept(','));
    return { k: 'decl', ty, vars, line };
  }
  switchStmt() {
    const line = this.next().line;
    this.expect('('); const e = this.expr(); this.expect(')');
    this.expect('{');
    const sections = [];
    while (!this.is('}')) {
      if (this.tok.t === 'eof') throw new CompileError("Falta la llave '}' del switch", this.tok.line, 'CS1513');
      const labels = [];
      while (this.is('case') || (this.is('default') && this.is(':', 1))) {
        const lt = this.next();
        if (lt.v === 'default') { labels.push({ def: true, line: lt.line }); this.expect(':'); }
        else { const ce = this.expr(); labels.push({ e: ce, line: lt.line }); this.expect(':'); }
      }
      if (!labels.length) throw new CompileError("Dentro del switch cada bloque debe empezar por 'case valor:' o 'default:'", this.tok.line, 'CS1525');
      const body = [];
      while (!this.is('case') && !(this.is('default') && this.is(':', 1)) && !this.is('}')) {
        if (this.tok.t === 'eof') break;
        body.push(this.statement());
      }
      sections.push({ labels, body, line: labels[0].line });
    }
    this.next();
    return { k: 'switch', e, sections, line };
  }
  tryStmt() {
    const line = this.next().line;
    const body = this.block();
    const catches = []; let fin = null;
    while (this.is('catch')) {
      const cl = this.next().line; let ty = 'Exception', name = null;
      if (this.accept('(')) { ty = this.ident(); while (this.accept('.')) ty = this.ident(); if (this.tok.t === 'id') name = this.ident(); this.expect(')'); }
      catches.push({ ty, name, body: this.block(), line: cl });
    }
    if (this.accept('finally')) fin = this.block();
    if (!catches.length && !fin) throw new CompileError("Se esperaba 'catch' o 'finally' después de try", this.tok.line, 'CS1524');
    return { k: 'try', body, catches, fin, line };
  }

  // --- expresiones ---
  expr() { return this.assignment(); }
  assignment() {
    const left = this.conditional();
    const t = this.tok;
    if (t.t === 'op' && ['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>='].includes(t.v)) {
      this.p++;
      const value = (t.v === '=' && this.is('{')) ? this.arrayInitError() : this.assignment();
      return { k: 'assign', op: t.v, target: left, value, line: t.line };
    }
    return left;
  }
  arrayInitError() { throw new CompileError('Las llaves { ... } solo se pueden usar al declarar el array; aquí usa new tipo[] { ... }', this.tok.line, 'CS0623'); }
  conditional() {
    const c = this.binary(0);
    if (this.is('?')) {
      const line = this.next().line;
      const a = this.expr(); this.expect(':'); const b = this.expr();
      return { k: 'cond', c, a, b, line };
    }
    if (this.is('??')) throw new CompileError("El operador '??' no está soportado en este simulador", this.tok.line, 'SIM');
    return c;
  }
  binary(minPrec) {
    const PREC = { '||': 1, '&&': 2, '|': 3, '^': 4, '&': 5, '==': 6, '!=': 6, '<': 7, '>': 7, '<=': 7, '>=': 7, '<<': 8, '>>': 8, '+': 9, '-': 9, '*': 10, '/': 10, '%': 10 };
    let left = this.unary();
    while (true) {
      const t = this.tok;
      if (t.t === 'kw' && (t.v === 'is' || t.v === 'as')) throw new CompileError("'" + t.v + "' no está soportado en este simulador", t.line, 'SIM');
      const pr = t.t === 'op' ? PREC[t.v] : undefined;
      if (pr === undefined || pr <= minPrec) return left;
      this.p++;
      const right = this.binary(pr);
      left = { k: 'bin', op: t.v, l: left, r: right, line: t.line };
    }
  }
  unary() {
    const t = this.tok;
    if (t.t === 'op') {
      if (t.v === '+' || t.v === '-' || t.v === '!' || t.v === '~') { this.p++; return { k: 'un', op: t.v, e: this.unary(), line: t.line }; }
      if (t.v === '++' || t.v === '--') { this.p++; return { k: 'inc', op: t.v, pre: true, e: this.unary(), line: t.line }; }
      if (t.v === '(') {
        const nt = this.peek();
        let isCast = false;
        if (nt.t === 'kw' && PRIM_KW.has(nt.v) && nt.v !== 'void') isCast = true;
        else if (nt.t === 'id' && TYPE_ALIAS[nt.v] && this.is(')', 2)) isCast = true;
        if (isCast) {
          const save = this.p; this.p++;
          const ty = this.tryType();
          if (ty && this.is(')')) { this.p++; return { k: 'cast', ty, e: this.unary(), line: t.line }; }
          this.p = save;
        }
      }
    }
    return this.postfix(this.primary());
  }
  postfix(e) {
    while (true) {
      const t = this.tok;
      if (this.is('.')) { this.p++; const nt = this.tok; const name = this.ident(); e = { k: 'member', obj: e, name, line: nt.line }; continue; }
      if (this.is('(')) { this.p++; e = { k: 'call', callee: e, args: this.args(')'), line: t.line }; continue; }
      if (this.is('[')) {
        this.p++; const idx = [];
        do idx.push(this.expr()); while (this.accept(','));
        this.expect(']');
        e = { k: 'index', obj: e, idx, line: t.line }; continue;
      }
      if (this.is('++') || this.is('--')) { this.p++; e = { k: 'inc', op: t.v, pre: false, e, line: t.line }; continue; }
      return e;
    }
  }
  args(close) {
    const a = [];
    if (!this.is(close)) {
      do {
        if (this.is('ref') || this.is('out')) {
          const mt = this.next();
          if (this.looksLikeDecl()) throw new CompileError('Declarar la variable dentro de out (out int x) es de C# 7; declárala antes.', mt.line, 'CS8026');
          a.push({ k: 'refarg', mod: mt.v, e: this.expr(), line: mt.line });
        } else a.push(this.expr());
      } while (this.accept(','));
    }
    this.expect(close);
    return a;
  }
  primary() {
    const t = this.tok;
    switch (t.t) {
      case 'num': this.p++; return { k: 'lit', v: t.v, ty: t.ty, line: t.line };
      case 'str': this.p++; return { k: 'lit', v: t.v, ty: 'string', line: t.line };
      case 'chr': this.p++; return { k: 'lit', v: t.v, ty: 'char', line: t.line };
      case 'id': this.p++; return { k: 'name', name: t.v, line: t.line };
      case 'kw':
        if (t.v === 'true' || t.v === 'false') { this.p++; return { k: 'lit', v: t.v === 'true', ty: 'bool', line: t.line }; }
        if (t.v === 'null') { this.p++; return { k: 'lit', v: null, ty: 'null', line: t.line }; }
        if (t.v === 'new') return this.newExpr();
        if (PRIM_KW.has(t.v) && t.v !== 'void') { this.p++; return { k: 'name', name: SIMPLIFY[t.v] || t.v, line: t.line, kwType: true }; }
        if (t.v === 'this' || t.v === 'base') throw new CompileError("'" + t.v + "' no tiene sentido dentro de un método static", t.line, 'CS0026');
        throw new CompileError("'" + t.v + "' no está soportado en este simulador o está mal colocado", t.line, 'SIM');
      case 'op':
        if (t.v === '(') { this.p++; const e = this.expr(); this.expect(')'); return { k: 'paren', e, line: t.line }; }
        if (t.v === '{') throw new CompileError('Las llaves { ... } solo se pueden usar al declarar un array', t.line, 'CS1525');
    }
    if (t.t === 'eof') throw new CompileError('El programa termina de forma inesperada (¿falta cerrar algo?)', t.line, 'CS1733');
    throw new CompileError("Expresión no válida: '" + t.v + "'", t.line, 'CS1525');
  }
  newExpr() {
    const line = this.next().line;
    const t = this.tok;
    let base;
    if (t.t === 'kw' && PRIM_KW.has(t.v)) { this.p++; base = t.v; }
    else if (t.t === 'id') { this.p++; base = t.v; while (this.is('.') && this.peek().t === 'id') { this.p++; base = this.next().v; } }
    else throw new CompileError("Se esperaba un tipo después de 'new'", t.line, 'CS1031');
    if (this.is('<') && GENERIC_NAMES.has(base)) throw new CompileError(base + '<...> se ve en temas posteriores; este simulador no lo admite.', t.line, 'SIM');
    base = TYPE_ALIAS[base] || base; base = SIMPLIFY[base] || base;
    if (this.is('[')) {
      let sizes = null, ty = base;
      if (this.is(']', 1) || this.is(',', 1)) {
        // new int[] {..} / new int[,] {..}
        let g = '['; this.p++; while (this.accept(',')) g += ','; this.expect(']'); ty += g + ']';
      } else {
        this.p++; sizes = [];
        do sizes.push(this.expr()); while (this.accept(','));
        this.expect(']');
        ty += '[' + ','.repeat(sizes.length - 1) + ']';
      }
      while (this.is('[')) {
        if (!(this.is(']', 1) || this.is(',', 1))) throw new CompileError('En un array de arrays solo se indica el tamaño del primero: new int[3][]', this.tok.line, 'CS0178');
        let g = '['; this.p++; while (this.accept(',')) g += ','; this.expect(']'); ty += g + ']';
      }
      const init = this.is('{') ? this.arrayInit() : null;
      if (!sizes && !init) throw new CompileError('Falta el tamaño del array: new ' + base + '[tamaño]', line, 'CS1586');
      return { k: 'newarr', ty, sizes, init, line };
    }
    if (this.is('(')) {
      this.p++;
      const args = this.args(')');
      if (this.is('{')) throw new CompileError('Los inicializadores de objeto { ... } no están soportados en este simulador', this.tok.line, 'SIM');
      return { k: 'newobj', ty: base, args, line };
    }
    throw new CompileError("Después de 'new " + base + "' se esperaba '[' o '('", this.tok.line, 'CS1526');
  }
  arrayInit() {
    const line = this.expect('{').line;
    const items = [];
    while (!this.is('}')) {
      items.push(this.is('{') ? this.arrayInit() : this.expr());
      if (!this.accept(',')) break;
    }
    this.expect('}');
    return { k: 'arrinit', items, line };
  }
}

function parse(src) {
  const p = new Parser(lex(src));
  return p.parseUnit();
}

// ===== Simulador de C# — comprobación de tipos y ejecución =====
// Necesita CompileError y parse (cs_parse.js) en el mismo ámbito.

// ---------- tipos ----------
const NUMRANK = { byte: 1, short: 2, int: 3, long: 4, float: 5, double: 6 };
const RANKNAME = ['', 'byte', 'short', 'int', 'long', 'float', 'double'];
const isNum = (t) => t in NUMRANK;
const isIntegral = (t) => t === 'byte' || t === 'short' || t === 'int' || t === 'long';
const isNumC = (t) => isNum(t) || t === 'char';
const isArr = (t) => typeof t === 'string' && t.endsWith(']');
function elemOf(t) { const i = t.indexOf('['), j = t.indexOf(']', i); return t.slice(0, i) + t.slice(j + 1); }
function rankOf(t) { const i = t.indexOf('['), j = t.indexOf(']', i); return j - i; }
function baseOf(t) { const i = t.indexOf('['); return i < 0 ? t : t.slice(0, i); }
const RANGE = { byte: [0, 255], short: [-32768, 32767], int: [-2147483648, 2147483647], long: [-9223372036854775808, 9223372036854775807], char: [0, 65535] };
const NET_NAME = { int: 'Int32', long: 'Int64', short: 'Int16', byte: 'Byte', double: 'Double', float: 'Single', char: 'Char', bool: 'Boolean', string: 'String' };
const EXC_TYPES = new Set(['Exception', 'SystemException', 'FormatException', 'OverflowException', 'DivideByZeroException',
  'IndexOutOfRangeException', 'NullReferenceException', 'ArgumentException', 'ArgumentOutOfRangeException',
  'ArgumentNullException', 'InvalidOperationException', 'ArithmeticException', 'InvalidCastException', 'NotImplementedException']);
const EXC_PARENT = { SystemException: 'Exception', FormatException: 'SystemException', ArithmeticException: 'SystemException',
  OverflowException: 'ArithmeticException', DivideByZeroException: 'ArithmeticException', IndexOutOfRangeException: 'SystemException',
  NullReferenceException: 'SystemException', ArgumentException: 'SystemException', ArgumentOutOfRangeException: 'ArgumentException',
  ArgumentNullException: 'ArgumentException', InvalidOperationException: 'SystemException', InvalidCastException: 'SystemException',
  NotImplementedException: 'SystemException' };
const STATIC_TYPES = new Set(['Console', 'Math', 'Convert', 'Array', 'Environment', 'StringSplitOptions', 'ConsoleColor',
  'string', 'char', 'int', 'long', 'short', 'byte', 'double', 'float', 'bool']);

function tyName(t) {
  if (t === 'null') return '<null>';
  if (t === 'exc') return 'Exception';
  return t;
}
function isRefTy(P, t) { return t === 'string' || isArr(t) || t === 'StringBuilder' || t === 'Random' || t === 'exc' || t === 'null'; }
function canImplicit(P, f, t, cv) {
  if (f === t) return true;
  if (f === 'null') return isRefTy(P, t);
  if (f === 'char') return t === 'int' || t === 'long' || t === 'float' || t === 'double';
  if (isNum(f) && isNum(t)) {
    if (NUMRANK[t] > NUMRANK[f] && !(f === 'short' && t === 'byte')) return true;
    if (cv !== undefined && (f === 'int' || f === 'long') && (t === 'byte' || t === 'short' || t === 'int' || t === 'long'))
      return cv >= RANGE[t][0] && cv <= RANGE[t][1];
    return false;
  }
  return false;
}
function canExplicit(P, f, t) { return canImplicit(P, f, t) || (isNumC(f) && isNumC(t)); }
function promote(a, b) {
  const ra = a === 'char' ? 3 : NUMRANK[a], rb = b === 'char' ? 3 : NUMRANK[b];
  return RANKNAME[Math.max(ra, rb, 3)];
}

// ---------- errores en ejecución ----------
class CsExc extends Error { constructor(type, msg, line) { super(msg); this.type = type; this.line = line; } }
class NeedInput extends Error {}
class Halt extends Error { constructor(msg, line) { super(msg); this.line = line; } }
const MSG = {
  idx: 'Índice fuera de los límites de la matriz.',
  fmt: 'La cadena de entrada no tiene el formato correcto.',
  div0: 'Intento de dividir por cero.',
  nullref: 'Referencia a objeto no establecida como instancia de un objeto.',
};
const ovf = (ty, line) => new CsExc('OverflowException', 'El valor era demasiado grande o demasiado pequeño para ' + (ty === 'char' ? 'un carácter' : 'un ' + NET_NAME[ty]) + '.', line);
const nullref = (line) => new CsExc('NullReferenceException', MSG.nullref, line);

// ---------- formato (cultura es-ES, como en Windows en español) ----------
const DEC = ',', GRP = '.';
function fmtG(v, prec) {
  if (Number.isNaN(v)) return 'NaN';
  if (v === Infinity) return 'Infinito';
  if (v === -Infinity) return '-Infinito';
  if (v === 0) return '0';
  let [m, e] = v.toExponential(prec - 1).split('e');
  const neg = m[0] === '-'; if (neg) m = m.slice(1);
  let digits = m.replace('.', '').replace(/0+$/, '') || '0';
  const exp = parseInt(e, 10);
  let s;
  if (exp >= prec || exp <= -5) s = digits[0] + (digits.length > 1 ? DEC + digits.slice(1) : '') + 'E' + (exp < 0 ? '-' : '+') + String(Math.abs(exp)).padStart(2, '0');
  else if (exp >= 0) { const fp = digits.slice(exp + 1); s = digits.slice(0, exp + 1).padEnd(exp + 1, '0') + (fp ? DEC + fp : ''); }
  else s = '0' + DEC + '0'.repeat(-exp - 1) + digits;
  return (neg ? '-' : '') + s;
}
function decParts(v, isInt) {
  if (isInt) { const neg = v < 0; return { neg, ip: String(Math.abs(v)), fp: '' }; }
  if (v === 0 || !isFinite(v)) return { neg: false, ip: '0', fp: '' };
  let [m, e] = v.toExponential(14).split('e');
  const neg = m[0] === '-'; if (neg) m = m.slice(1);
  const digits = m.replace('.', ''); const exp = parseInt(e, 10);
  let ip, fp;
  if (exp >= 0) { ip = digits.slice(0, exp + 1).padEnd(exp + 1, '0'); fp = digits.slice(exp + 1); }
  else { ip = '0'; fp = '0'.repeat(-exp - 1) + digits; }
  return { neg, ip, fp };
}
function roundParts(p, n) {
  if (p.fp.length <= n) return { neg: p.neg, ip: p.ip, fp: p.fp.padEnd(n, '0') };
  let digits = p.ip + p.fp.slice(0, n);
  if (p.fp[n] >= '5') {
    const a = digits.split(''); let i = a.length - 1;
    while (i >= 0) { if (a[i] === '9') { a[i] = '0'; i--; } else { a[i] = String(+a[i] + 1); break; } }
    if (i < 0) a.unshift('1');
    digits = a.join('');
  }
  const il = digits.length - n;
  return { neg: p.neg, ip: (digits.slice(0, il) || '0').replace(/^0+(?=\d)/, ''), fp: digits.slice(il) };
}
const group = (ip) => ip.replace(/\B(?=(\d{3})+(?!\d))/g, GRP);
const signed = (p, s) => (p.neg && /[1-9]/.test(p.ip + p.fp) ? '-' : '') + s;
function fmtNumber(v, ty, spec, line) {
  const isInt = isIntegral(ty) || ty === 'char';
  if (ty === 'float') v = Number(fmtG(v, 7).replace(DEC, '.').replace(/E\+?/, 'e'));
  const m = /^([A-Za-z])(\d{0,2})$/.exec(spec);
  if (m) {
    const L = m[1].toUpperCase(), n = m[2] === '' ? null : +m[2];
    switch (L) {
      case 'F': case 'N': {
        const p = roundParts(decParts(v, isInt), n === null ? 2 : n);
        return signed(p, (L === 'N' ? group(p.ip) : p.ip) + (p.fp ? DEC + p.fp : ''));
      }
      case 'D':
        if (!isInt) throw new CsExc('FormatException', 'La cadena de formato no es válida.', line);
        return (v < 0 ? '-' : '') + String(Math.abs(v)).padStart(n || 0, '0');
      case 'P': { const p = roundParts(decParts(v * 100, false), n === null ? 2 : n); return signed(p, group(p.ip) + (p.fp ? DEC + p.fp : '')) + ' %'; }
      case 'C': { const p = roundParts(decParts(v, isInt), n === null ? 2 : n); return signed(p, group(p.ip) + (p.fp ? DEC + p.fp : '')) + ' €'; }
      case 'G': return isInt ? String(v) : fmtG(v, n || (ty === 'float' ? 7 : 15));
      case 'R': return isInt ? String(v) : String(v).replace('.', DEC).replace('e', 'E');
      case 'E': {
        if (v === 0) return '0' + DEC + '0'.repeat(n === null ? 6 : n) + (m[1] === 'e' ? 'e' : 'E') + '+000';
        const [mm, ee] = Math.abs(v).toExponential(n === null ? 6 : n).split('e');
        return (v < 0 ? '-' : '') + mm.replace('.', DEC) + (m[1] === 'e' ? 'e' : 'E') + (+ee < 0 ? '-' : '+') + String(Math.abs(+ee)).padStart(3, '0');
      }
      case 'X':
        if (!isInt) throw new CsExc('FormatException', 'La cadena de formato no es válida.', line);
        { let h = (v < 0 ? (v >>> 0) : v).toString(16); if (m[1] === 'X') h = h.toUpperCase(); return h.padStart(n || 0, '0'); }
    }
    throw new CsExc('FormatException', 'La cadena de formato no es válida.', line);
  }
  // formato personalizado: 0 # . , %
  const pat = spec.split(';')[0];
  const first = pat.search(/[0#]/);
  if (first < 0) return pat;
  let last = -1; for (let i = pat.length - 1; i >= 0; i--) if (/[0#]/.test(pat[i])) { last = i; break; }
  const prefix = pat.slice(0, first).replace(/['"]/g, ''), suffix = pat.slice(last + 1).replace(/['"]/g, '');
  const body = pat.slice(first, last + 1);
  const dot = body.indexOf('.');
  const ipat = dot < 0 ? body : body.slice(0, dot), fpat = dot < 0 ? '' : body.slice(dot + 1);
  const minInt = (ipat.match(/0/g) || []).length;
  const minFrac = (fpat.match(/0/g) || []).length, maxFrac = (fpat.match(/[0#]/g) || []).length;
  const grouping = /[0#],[0#]/.test(ipat);
  if (/%/.test(pat)) v *= 100;
  const p = roundParts(decParts(v, isInt && !/%/.test(pat)), maxFrac);
  let fp = p.fp; while (fp.length > minFrac && fp.endsWith('0')) fp = fp.slice(0, -1);
  let ip = p.ip === '0' && minInt === 0 ? '' : p.ip.padStart(minInt, '0');
  if (grouping) ip = group(ip);
  return signed(p, prefix + ip + (fp ? DEC + fp : '') + suffix);
}

// ---------- valores en ejecución ----------
class Arr {
  constructor(ty, dims, data) { this.ty = ty; this.et = elemOf(ty); this.dims = dims; this.d = data; }
  get length() { return this.d.length; }
  pos(idx, line) {
    if (this.dims.length === 1) { const i = idx[0]; if (i < 0 || i >= this.d.length) throw new CsExc('IndexOutOfRangeException', MSG.idx, line); return i; }
    let p = 0;
    for (let k = 0; k < this.dims.length; k++) {
      const i = idx[k];
      if (i < 0 || i >= this.dims[k]) throw new CsExc('IndexOutOfRangeException', MSG.idx, line);
      p = p * this.dims[k] + i;
    }
    return p;
  }
}
class Struct { constructor(name, f) { this.name = name; this.f = f; } }
class SB { constructor(s) { this.s = s; } }
class Rnd {
  constructor(seed) { this.a = seed >>> 0; }
  next() { let t = this.a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
}
class ExcVal { constructor(type, msg) { this.type = type; this.msg = msg; } }
const UNSET = { unset: true };

// ---------- comparación de cadenas (como CompareTo en español) ----------
const COLL = new Intl.Collator('es', { sensitivity: 'variant', caseFirst: 'lower' });
const COLL_I = new Intl.Collator('es', { sensitivity: 'accent' });
function cmpStr(a, b, ic) {
  if (a === b) return 0; if (a === null) return -1; if (b === null) return 1;
  const r = (ic ? COLL_I : COLL).compare(a, b); return r < 0 ? -1 : r > 0 ? 1 : 0;
}

// ---------- conversión de texto a número ----------
function parseIntStr(s, ty, line) {
  if (s === null) throw new CsExc('ArgumentNullException', 'El valor no puede ser nulo.', line);
  const t = s.trim();
  if (!/^[+-]?\d+$/.test(t)) throw new CsExc('FormatException', MSG.fmt, line);
  const v = Number(t);
  if (v < RANGE[ty][0] || v > RANGE[ty][1]) throw ovf(ty, line);
  return v === 0 ? 0 : v;
}
function parseRealStr(s, ty, line) {
  if (s === null) throw new CsExc('ArgumentNullException', 'El valor no puede ser nulo.', line);
  let t = s.trim();
  const m = /^([+-]?)([\d.]*)(,(\d*))?([eE][+-]?\d+)?$/.exec(t);
  if (!m || !/\d/.test(m[2] + (m[4] || ''))) throw new CsExc('FormatException', MSG.fmt, line);
  const num = Number(m[1] + (m[2].replace(/\./g, '') || '0') + '.' + (m[4] || '0') + (m[5] || ''));
  if (!isFinite(num)) throw ovf(ty, line);
  return ty === 'float' ? Math.fround(num) : num;
}
function roundEven(x) { const r = Math.round(x); return (Math.abs(x % 1) === 0.5 && r % 2 !== 0) ? r - 1 : r; }
function toIntChecked(v, from, ty, line) {
  if (from === 'double' || from === 'float') {
    if (!isFinite(v)) throw ovf(ty, line);
    v = roundEven(v);
  }
  if (v < RANGE[ty][0] || v > RANGE[ty][1]) throw ovf(ty, line);
  return v === 0 ? 0 : v;
}
function castVal(v, from, to) {
  if (from === to) return v;
  switch (to) {
    case 'int': return (from === 'double' || from === 'float') ? (isFinite(v) ? Math.trunc(v) | 0 : -2147483648) : v | 0;
    case 'long': return Math.trunc(v) || 0;
    case 'short': return ((Math.trunc(v) | 0) << 16) >> 16;
    case 'byte': return Math.trunc(v) & 255;
    case 'char': return Math.trunc(v) & 0xFFFF;
    case 'float': return Math.fround(v);
    case 'double': return v;
  }
  return v;
}
const coerce = (v, from, to) => (to === 'float' && from !== 'float' && typeof v === 'number') ? Math.fround(v) : v;

// ======================================================================
//                              COMPROBACIÓN
// ======================================================================
function compile(src) {
  const unit = parse(src);
  const P = { structs: new Map(), classes: new Map(), statics: [], nextId: 1, usesLinq: /using\s+System\.Linq\s*;/.test(src), main: null };
  const E = (msg, line, code) => new CompileError(msg, line, code);

  for (const st of unit.structs) {
    if (P.structs.has(st.name)) throw E("Ya existe un tipo llamado '" + st.name + "'", st.line, 'CS0101');
    st.fmap = new Map();
    P.structs.set(st.name, st);
  }
  for (const c of unit.classes) {
    if (P.classes.has(c.name)) throw E("Ya existe una clase llamada '" + c.name + "'", c.line, 'CS0101');
    if (P.structs.has(c.name)) throw E("Ya existe un tipo llamado '" + c.name + "'", c.line, 'CS0101');
    P.classes.set(c.name, { name: c.name, decl: c, fields: new Map(), methods: new Map() });
  }
  const typeExists = (t, line) => {
    const b = baseOf(t);
    if (['int', 'long', 'short', 'byte', 'float', 'double', 'char', 'bool', 'string', 'StringBuilder', 'Random'].includes(b) || P.structs.has(b)) return;
    if (b === 'object') throw E("El tipo 'object' no está soportado en este simulador", line, 'SIM');
    if (b === 'var') throw E("'var' solo se puede usar en variables locales con valor inicial", line, 'CS0825');
    if (b === 'void') throw E("'void' solo se puede usar como tipo de retorno de un método", line, 'CS1547');
    if (P.classes.has(b)) throw E("Este simulador no admite variables de tipo clase ('" + b + "'); usa un struct", line, 'SIM');
    throw E("No se encuentra el tipo '" + b + "' (¿está bien escrito? C# distingue mayúsculas y minúsculas)", line, 'CS0246');
  };
  for (const st of P.structs.values()) {
    for (const f of st.fields) {
      typeExists(f.ty, f.line);
      if (st.fmap.has(f.name)) throw E("El struct '" + st.name + "' ya tiene un campo '" + f.name + "'", f.line, 'CS0102');
      st.fmap.set(f.name, f);
    }
  }
  // structs que se contienen a sí mismos
  const visiting = new Set();
  const cyc = (name, line) => {
    if (visiting.has(name)) throw E("El struct '" + name + "' se contiene a sí mismo", line, 'CS0523');
    visiting.add(name);
    for (const f of P.structs.get(name).fields) if (P.structs.has(f.ty)) cyc(f.ty, f.line);
    visiting.delete(name);
  };
  for (const st of P.structs.values()) cyc(st.name, st.line);

  for (const c of P.classes.values()) {
    for (const f of c.decl.fields) {
      typeExists(f.ty, f.line);
      if (c.fields.has(f.name)) throw E("La clase ya tiene un campo '" + f.name + "'", f.line, 'CS0102');
      const d = { id: 'g' + (P.nextId++), name: f.name, ty: f.ty, kind: f.isStatic ? 'static' : 'inst', isConst: !!f.isConst, cls: c.name, init: f.init, line: f.line, readonly: f.readonly };
      c.fields.set(f.name, d);
      if (f.isStatic) P.statics.push(d);
    }
    for (const m of c.decl.methods) {
      if (m.ret !== 'void') typeExists(m.ret, m.line);
      for (const p of m.params) { typeExists(p.ty, m.line); p.id = 'p' + (P.nextId++); }
      if (c.fields.has(m.name)) throw E("'" + m.name + "' ya se usa como nombre de campo", m.line, 'CS0102');
      if (!c.methods.has(m.name)) c.methods.set(m.name, []);
      const list = c.methods.get(m.name);
      if (list.some((o) => o.params.length === m.params.length && o.params.every((p, i) => p.ty === m.params[i].ty)))
        throw E("Ya existe un método '" + m.name + "' con los mismos parámetros", m.line, 'CS0111');
      list.push(m);
      if (m.name === 'Main') {
        if (P.main) throw E('Hay más de un método Main', m.line, 'CS0017');
        if (!m.isStatic) throw E("El método Main tiene que ser 'static'", m.line, 'CS5001');
        P.main = m;
      }
    }
  }
  if (!P.main) throw E('El programa no tiene un método static void Main()', 1, 'CS5001');

  const ck = new Checker(P);
  // constantes y campos static (en orden)
  for (const c of P.classes.values()) {
    for (const d of c.fields.values()) {
      if (!d.init) { if (d.isConst) throw E('Una constante necesita un valor', d.line, 'CS0145'); continue; }
      ck.begin(c.name, null);
      if (d.init.k === 'arrinit') ck.arrInit(d.init, d.ty);
      else {
        const t = ck.val(d.init);
        ck.assignable(t, d.ty, d.init, d.line);
        if (d.isConst) {
          if (d.init.cv === undefined) throw E("El valor de la constante '" + d.name + "' tiene que ser constante", d.line, 'CS0133');
          d.cv = d.init.cv;
        }
      }
    }
  }
  for (const c of P.classes.values()) for (const list of c.methods.values()) for (const m of list) ck.method(c, m);
  return P;
}

class Checker {
  constructor(P) { this.P = P; }
  E(msg, line, code) { return new CompileError(msg, line, code); }
  begin(cls, m) { this.cls = cls; this.m = m; this.scopes = [{ vars: new Map(), inner: new Set() }]; this.loops = 0; this.switches = 0; this.catches = 0; }
  method(c, m) {
    this.begin(c.name, m);
    for (const p of m.params) this.declare({ id: p.id, name: p.name, ty: p.ty, kind: 'param', mod: p.mod }, m.line);
    this.block(m.body, false);
    CURRENT_P = this.P;
    new DefAssign().run(m.body);
    if (m.ret !== 'void' && reach(m.body))
      throw this.E("'" + c.name + '.' + m.name + "()': no todas las rutas de código devuelven un valor (falta un return)", lastLine(m.body), 'CS0161');
  }
  push() { this.scopes.push({ vars: new Map(), inner: new Set() }); }
  pop() { this.scopes.pop(); }
  lookup(name) { for (let i = this.scopes.length - 1; i >= 0; i--) { const d = this.scopes[i].vars.get(name); if (d) return d; } return null; }
  declare(d, line) {
    const top = this.scopes[this.scopes.length - 1];
    if (this.lookup(d.name)) throw this.E("Ya existe una variable llamada '" + d.name + "' en este método (en este bloque o en uno que lo contiene)", line, 'CS0128');
    if (top.inner.has(d.name)) throw this.E("No se puede declarar '" + d.name + "' aquí porque ya se usó ese nombre en un bloque interior (por ejemplo, en un for)", line, 'CS0136');
    top.vars.set(d.name, d);
    for (const s of this.scopes) s.inner.add(d.name);
    return d;
  }
  // ---- sentencias ----
  block(b, scope = true) { if (scope) this.push(); for (const s of b.body) this.stmt(s); if (scope) this.pop(); }
  cond(e) {
    const t = this.val(e);
    if (t !== 'bool') {
      let hint = '';
      if (e.k === 'assign' && e.op === '=') hint = " (¿querías poner == en vez de =?)";
      throw this.E("No se puede convertir implícitamente el tipo '" + tyName(t) + "' en 'bool'" + hint, e.line, 'CS0029');
    }
  }
  stmt(s) {
    switch (s.k) {
      case 'block': return this.block(s);
      case 'empty': return;
      case 'decl': return this.decl(s);
      case 'expr': {
        const e = s.e;
        if (!['assign', 'inc', 'call', 'newobj'].includes(e.k)) {
          const hint = (e.k === 'bin' && e.op === '==') ? " (¿querías poner = en vez de ==?)" : '';
          throw this.E('Esta línea no hace nada: solo una asignación, una llamada a un método o un ++/-- pueden ir solos como instrucción' + hint, s.line, 'CS0201');
        }
        this.chk(e); return;
      }
      case 'if': this.cond(s.cond); this.sub(s.then); if (s.els) this.sub(s.els); return;
      case 'while': this.cond(s.cond); this.loops++; this.sub(s.body); this.loops--; return;
      case 'do': this.loops++; this.sub(s.body); this.loops--; this.cond(s.cond); return;
      case 'for':
        this.push();
        for (const i of s.init) this.stmt(i);
        if (s.cond) this.cond(s.cond);
        for (const e of s.iter) {
          if (!['assign', 'inc', 'call'].includes(e.k)) throw this.E('En la tercera parte del for solo puede ir una asignación, un ++/-- o una llamada', e.line, 'CS0201');
          this.chk(e);
        }
        this.loops++; this.sub(s.body); this.loops--;
        this.pop(); return;
      case 'foreach': {
        const ct = this.val(s.coll);
        let et;
        if (isArr(ct)) et = elemOf(ct);
        else if (ct === 'string') et = 'char';
        else throw this.E("foreach no puede recorrer una variable de tipo '" + tyName(ct) + "'", s.coll.line, 'CS1579');
        let vt = s.ty;
        if (vt === 'var') vt = et; else {
          this.typeOk(vt, s.line);
          if (!canExplicit(this.P, et, vt)) throw this.E("No se puede convertir el tipo '" + tyName(et) + "' en '" + tyName(vt) + "'", s.line, 'CS0030');
        }
        s.et = et; s.vt = vt;
        this.push();
        s.d = this.declare({ id: 'v' + (this.P.nextId++), name: s.name, ty: vt, kind: 'local', foreach: true }, s.line);
        this.loops++; this.sub(s.body); this.loops--;
        this.pop(); return;
      }
      case 'switch': return this.switchStmt(s);
      case 'break':
        if (this.loops + this.switches === 0) throw this.E("'break' solo puede usarse dentro de un bucle o de un switch", s.line, 'CS0139');
        return;
      case 'continue':
        if (this.loops === 0) throw this.E("'continue' solo puede usarse dentro de un bucle", s.line, 'CS0139');
        return;
      case 'return': {
        const m = this.m;
        if (!m) throw this.E("'return' fuera de un método", s.line, 'CS0127');
        if (m.ret === 'void') {
          if (s.e) throw this.E("El método '" + m.name + "' es void y no puede devolver un valor", s.line, 'CS0127');
        } else {
          if (!s.e) throw this.E("El método '" + m.name + "' tiene que devolver un valor de tipo '" + tyName(m.ret) + "'", s.line, 'CS0126');
          const t = this.val(s.e); this.assignable(t, m.ret, s.e, s.line);
          s.ty = t;
        }
        return;
      }
      case 'throw':
        if (!s.e) { if (!this.catches) throw this.E("'throw;' solo puede usarse dentro de un catch", s.line, 'CS0156'); return; }
        if (this.val(s.e) !== 'exc') throw this.E('Solo se pueden lanzar excepciones (throw new Exception("..."))', s.line, 'CS0155');
        return;
      case 'try':
        this.block(s.body);
        for (const c of s.catches) {
          if (!EXC_TYPES.has(c.ty)) throw this.E("No se encuentra el tipo de excepción '" + c.ty + "'", c.line, 'CS0246');
          this.push();
          if (c.name) c.d = this.declare({ id: 'v' + (this.P.nextId++), name: c.name, ty: 'exc', kind: 'local' }, c.line);
          this.catches++; this.block(c.body, false); this.catches--;
          this.pop();
        }
        if (s.fin) this.block(s.fin);
        return;
    }
    throw this.E('Instrucción no soportada', s.line, 'SIM');
  }
  sub(s) { if (s.k === 'block') this.block(s); else { this.push(); this.stmt(s); this.pop(); } }
  typeOk(t, line) {
    const b = baseOf(t);
    if (['int', 'long', 'short', 'byte', 'float', 'double', 'char', 'bool', 'string', 'StringBuilder', 'Random'].includes(b) || this.P.structs.has(b)) return;
    if (b === 'object') throw this.E("El tipo 'object' no está soportado en este simulador", line, 'SIM');
    if (this.P.classes.has(b)) throw this.E("Este simulador no admite variables de tipo clase ('" + b + "'); usa un struct", line, 'SIM');
    throw this.E("No se encuentra el tipo '" + b + "' (¿está bien escrito? C# distingue mayúsculas y minúsculas)", line, 'CS0246');
  }
  decl(s) {
    if (s.ty !== 'var') this.typeOk(s.ty, s.line);
    for (const v of s.vars) {
      let ty = s.ty;
      if (ty === 'var') {
        if (!v.init) throw this.E("Una variable 'var' necesita un valor inicial", v.line, 'CS0818');
        if (v.init.k === 'arrinit') throw this.E("Con 'var' no se puede usar { ... }; escribe new tipo[] { ... }", v.line, 'CS0820');
        ty = this.val(v.init);
        if (ty === 'null') throw this.E("No se puede asignar null a una variable 'var'", v.line, 'CS0815');
        if (s.isConst) throw this.E("Una constante no puede ser 'var'", v.line, 'CS0822');
      } else if (v.init) {
        if (v.init.k === 'arrinit') {
          if (!isArr(ty)) throw this.E("Las llaves { ... } solo sirven para dar valor inicial a un array", v.line, 'CS0622');
          this.arrInit(v.init, ty);
        } else {
          const t = this.val(v.init);
          this.assignable(t, ty, v.init, v.line);
        }
      }
      if (s.isConst && (!v.init || v.init.cv === undefined)) throw this.E("El valor de la constante '" + v.name + "' tiene que ser constante", v.line, 'CS0133');
      v.ty = ty;
      v.d = this.declare({ id: 'v' + (this.P.nextId++), name: v.name, ty, kind: 'local', isConst: !!s.isConst, cv: s.isConst ? v.init.cv : undefined }, v.line);
    }
  }
  arrInit(init, ty) {
    init.ty = ty;
    const r = rankOf(ty), et = elemOf(ty);
    const level = (node, depth, dims) => {
      if (node.k !== 'arrinit') throw this.E('Se esperaba { ... } en el valor inicial del array de ' + r + ' dimensiones', node.line, 'CS0846');
      if (dims[depth] === undefined) dims[depth] = node.items.length;
      else if (dims[depth] !== node.items.length) throw this.E('Todas las filas del array tienen que tener ' + dims[depth] + ' elementos', node.line, 'CS0847');
      for (const it of node.items) {
        if (depth + 1 < r) level(it, depth + 1, dims);
        else {
          if (it.k === 'arrinit') throw this.E(isArr(et) ? 'En un array de arrays cada fila se escribe con new ' + et + ' { ... }' : 'Sobran llaves { } en el valor inicial del array', it.line, 'CS0623');
          const t = this.val(it); this.assignable(t, et, it, it.line); it.vty = t;
        }
      }
    };
    init.dims = [];
    level(init, 0, init.dims);
  }
  switchStmt(s) {
    const gt = this.val(s.e);
    if (!['int', 'long', 'short', 'byte', 'char', 'string', 'bool'].includes(gt))
      throw this.E("No se puede usar switch con un valor de tipo '" + tyName(gt) + "'", s.e.line, 'CS0151');
    s.gt = gt;
    const seen = new Set();
    this.switches++; this.push();
    for (const sec of s.sections) {
      for (const lb of sec.labels) {
        if (lb.def) { if (seen.has('default')) throw this.E("Hay dos 'default:' en el switch", lb.line, 'CS0152'); seen.add('default'); continue; }
        const t = this.val(lb.e);
        if (lb.e.cv === undefined && !(t === 'null' && gt === 'string')) throw this.E('En un case solo puede ir un valor constante (un número, un carácter o un texto fijo)', lb.line, 'CS0150');
        if (!canImplicit(this.P, t, gt, lb.e.cv)) throw this.E("El valor del case es de tipo '" + tyName(t) + "' pero el switch es de tipo '" + tyName(gt) + "'" + (gt === 'string' && t === 'char' ? ' (usa comillas dobles)' : (gt === 'char' && t === 'string' ? ' (usa comillas simples)' : '')), lb.line, 'CS0029');
        const key = String(lb.e.cv === undefined ? null : lb.e.cv);
        if (seen.has('k' + key)) throw this.E("La etiqueta 'case " + fmtCase(lb.e.cv, t) + ":' está repetida", lb.line, 'CS0152');
        seen.add('k' + key);
        lb.v = lb.e.cv === undefined ? null : lb.e.cv;
      }
      for (const st of sec.body) this.stmt(st);
      if (reach({ k: 'block', body: sec.body })) {
        const lb = sec.labels[sec.labels.length - 1];
        throw this.E("Falta un 'break' al final de " + (lb.def ? "'default:'" : "'case " + fmtCase(lb.v, gt) + ":'") + ' (en C# cada case tiene que terminar en break)', sec.body.length ? lastLine({ k: 'block', body: sec.body }) : lb.line, 'CS0163');
      }
    }
    this.pop(); this.switches--;
  }
  // ---- expresiones ----
  val(e) {
    const t = this.chk(e);
    if (t === 'void') throw this.E('Ese método no devuelve nada (es void), así que no se puede usar como valor', e.line, 'CS0029');
    if (t.startsWith('type:')) throw this.E("'" + t.slice(5) + "' es un tipo y aquí se esperaba un valor", e.line, 'CS0119');
    return t;
  }
  assignable(from, to, node, line) {
    if (canImplicit(this.P, from, to, node.cv)) return;
    let hint = '', code = 'CS0029';
    if (canExplicit(this.P, from, to)) { code = 'CS0266'; hint = '. Existe una conversión explícita: pon (' + to + ') delante si de verdad quieres convertirlo'; }
    if (from === 'string' && isNum(to)) hint = '. Para convertir texto en número usa Convert.To' + NET_NAME[to] + '(...)';
    if (from === 'string' && to === 'char') hint = ". Un char va entre comillas simples: 'a'";
    if (from === 'char' && to === 'string') hint = '. Un texto va entre comillas dobles: "a"';
    if (to === 'float' && from === 'double' && node.k === 'lit') hint = '. Los números con decimales son double: pon una f al final (7.5f)';
    if (isNum(from) && to === 'string') hint = '. Usa .ToString() o Convert.ToString(...)';
    throw this.E("No se puede convertir implícitamente el tipo '" + tyName(from) + "' en '" + tyName(to) + "'" + hint, line, code);
  }
  chk(e) { const t = this.chk2(e); e.ty = t; return t; }
  chk2(e) {
    const P = this.P;
    switch (e.k) {
      case 'lit': if (e.ty !== 'null') e.cv = e.v; return e.ty;
      case 'paren': { const t = this.chk(e.e); e.cv = e.e.cv; return t; }
      case 'name': return this.name(e);
      case 'member': return this.member(e);
      case 'index': return this.index(e);
      case 'call': return this.call(e);
      case 'newarr': {
        const et = elemOf(e.ty); this.typeOk(et, e.line);
        if (e.sizes) for (const s of e.sizes) { const t = this.val(s); if (!canImplicit(P, t, 'long') || t === 'float') throw this.E("El tamaño de un array tiene que ser un número entero, no '" + tyName(t) + "'", s.line, 'CS0029'); }
        if (e.init) {
          this.arrInit(e.init, e.ty);
          if (e.sizes) e.sizes.forEach((s, i) => {
            if (s.cv === undefined) throw this.E('Si das valores con { ... }, el tamaño tiene que ser un número fijo', s.line, 'CS0150');
            if (s.cv !== e.init.dims[i]) throw this.E('El tamaño indicado (' + s.cv + ') no coincide con los ' + e.init.dims[i] + ' valores entre llaves', s.line, 'CS0847');
          });
        }
        return e.ty;
      }
      case 'newobj': {
        const t = e.ty;
        const ats = e.args.map((a) => this.argVal(a));
        if (t === 'StringBuilder') {
          if (!(ats.length === 0 || (ats.length === 1 && (ats[0] === 'string' || canImplicit(P, ats[0], 'int'))) || (ats.length === 2 && ats[0] === 'string' && canImplicit(P, ats[1], 'int'))))
            throw this.E('new StringBuilder(...) no admite esos argumentos', e.line, 'CS1729');
          return t;
        }
        if (t === 'Random') { if (ats.length > 1 || (ats.length === 1 && !canImplicit(P, ats[0], 'int'))) throw this.E('new Random(...) no admite esos argumentos', e.line, 'CS1729'); return t; }
        if (t === 'string') {
          if (ats.length === 2 && ats[0] === 'char' && canImplicit(P, ats[1], 'int')) { e.mk = 'repeat'; return 'string'; }
          if (ats.length === 1 && ats[0] === 'char[]') { e.mk = 'chars'; return 'string'; }
          throw this.E("new String(...) se usa así: new String('-', 10)", e.line, 'CS1729');
        }
        if (P.structs.has(t)) { if (ats.length) throw this.E("El struct '" + t + "' no tiene un constructor con argumentos (en este tema se rellena campo a campo)", e.line, 'CS1729'); return t; }
        if (EXC_TYPES.has(t)) { if (ats.length > 1 || (ats.length === 1 && ats[0] !== 'string')) throw this.E('new ' + t + '(...) admite un texto como mensaje', e.line, 'CS1729'); e.mk = 'exc'; return 'exc'; }
        if (isNum(t) || t === 'char' || t === 'bool') { if (ats.length) throw this.E('new ' + t + '() no admite argumentos', e.line, 'CS1729'); e.cv = t === 'bool' ? false : 0; return t; }
        if (P.classes.has(t)) throw this.E('Este simulador no admite crear objetos de clases; usa un struct', e.line, 'SIM');
        throw this.E("No se encuentra el tipo '" + t + "'", e.line, 'CS0246');
      }
      case 'cast': {
        const f = this.val(e.e);
        if (e.ty !== 'string' && !['int', 'long', 'short', 'byte', 'float', 'double', 'char', 'bool'].includes(e.ty)) this.typeOk(e.ty, e.line);
        if (!canExplicit(P, f, e.ty)) {
          let hint = '';
          if (f === 'string' && isNumC(e.ty)) hint = ' (para convertir texto usa Convert.To' + NET_NAME[e.ty] + '(...))';
          if (isNumC(f) && e.ty === 'string') hint = ' (usa .ToString() o Convert.ToString(...))';
          throw this.E("No se puede convertir el tipo '" + tyName(f) + "' en '" + tyName(e.ty) + "'" + hint, e.line, 'CS0030');
        }
        e.from = f;
        if (e.e.cv !== undefined && isNumC(f)) e.cv = castVal(e.e.cv, f, e.ty);
        else if (e.e.cv !== undefined && f === e.ty) e.cv = e.e.cv;
        return e.ty;
      }
      case 'un': {
        const t = this.val(e.e);
        if (e.op === '!') { if (t !== 'bool') throw this.E("El operador '!' solo se aplica a valores bool", e.line, 'CS0023'); if (e.e.cv !== undefined) e.cv = !e.e.cv; return 'bool'; }
        if (e.op === '~') { if (!isIntegral(t) && t !== 'char') throw this.E("El operador '~' solo se aplica a enteros", e.line, 'CS0023'); const r = promote(t, 'int'); if (e.e.cv !== undefined) e.cv = r === 'int' ? ~e.e.cv : -e.e.cv - 1; return r; }
        if (!isNumC(t)) throw this.E("El operador '" + e.op + "' no se puede aplicar a un valor de tipo '" + tyName(t) + "'", e.line, 'CS0023');
        const r = (t === 'float' || t === 'double' || t === 'long') ? t : 'int';
        if (e.e.cv !== undefined) e.cv = e.op === '-' ? (r === 'int' ? (-e.e.cv) | 0 : -e.e.cv) : e.e.cv;
        return r;
      }
      case 'inc': {
        const t = this.val(e.e);
        this.lvalue(e.e, e.op);
        if (!isNumC(t)) throw this.E("El operador '" + e.op + "' solo se aplica a números o char, no a '" + tyName(t) + "'", e.line, 'CS0023');
        return t;
      }
      case 'bin': return this.bin(e);
      case 'cond': {
        this.cond(e.c);
        const a = this.val(e.a), b = this.val(e.b);
        let t;
        if (a === b) t = a;
        else if (canImplicit(P, a, b, e.a.cv)) t = b;
        else if (canImplicit(P, b, a, e.b.cv)) t = a;
        else throw this.E("Las dos opciones de ?: tienen tipos incompatibles ('" + tyName(a) + "' y '" + tyName(b) + "')", e.line, 'CS0173');
        e.ta = a; e.tb = b;
        if (e.c.cv !== undefined && e.a.cv !== undefined && e.b.cv !== undefined) e.cv = e.c.cv ? coerce(e.a.cv, a, t) : coerce(e.b.cv, b, t);
        return t;
      }
      case 'assign': {
        const tt = this.val(e.target);
        this.lvalue(e.target, e.op);
        const vt = this.val(e.value);
        e.vt = vt;
        if (e.op === '=') { this.assignable(vt, tt, e.value, e.line); return tt; }
        const op = e.op.slice(0, -1);
        if (op === '+' && tt === 'string') { e.concat = true; return tt; }
        const fake = { k: 'bin', op, l: { ty: tt, k: 'x' }, r: e.value, line: e.line };
        const rt = this.binType(fake, tt, vt);
        e.opTy = fake.opTy; e.rt = rt;
        if (canImplicit(P, rt, tt)) return tt;
        if (canExplicit(P, rt, tt) && canImplicit(P, vt, tt, e.value.cv)) { e.castBack = true; return tt; }
        throw this.E("No se puede convertir implícitamente el tipo '" + tyName(rt) + "' en '" + tyName(tt) + "'", e.line, 'CS0266');
      }
      case 'arrinit': throw this.E('Las llaves { ... } solo se pueden usar al declarar el array', e.line, 'CS0622');
      case 'refarg': throw this.E("'" + e.mod + "' solo puede ir delante de un argumento de un método", e.line, 'CS1525');
    }
    throw this.E('Expresión no soportada', e.line, 'SIM');
  }
  name(e) {
    const P = this.P;
    const d = this.lookup(e.name);
    if (d) { e.ref = d; if (d.isConst) e.cv = d.cv; return d.ty; }
    const c = P.classes.get(this.cls);
    const f = c && c.fields.get(e.name);
    if (f) {
      if (f.kind === 'inst') throw this.E("El campo '" + e.name + "' no es static y no se puede usar desde un método static (añade static al declararlo)", e.line, 'CS0120');
      e.ref = f; if (f.isConst) { if (f.cv === undefined) throw this.E("La constante '" + e.name + "' se usa antes de tener valor", e.line, 'CS0110'); e.cv = f.cv; } return f.ty;
    }
    if (e.name === 'System') { e.tname = 'System'; return 'type:System'; }
    const alias = { String: 'string', Int32: 'int', Int64: 'long', Int16: 'short', Double: 'double', Single: 'float', Char: 'char', Boolean: 'bool', Byte: 'byte' }[e.name] || e.name;
    if (STATIC_TYPES.has(alias) || P.classes.has(alias) || P.structs.has(alias) || alias === 'StringBuilder' || alias === 'Random' || EXC_TYPES.has(alias)) { e.tname = alias; return 'type:' + alias; }
    if (c && c.methods.has(e.name)) throw this.E("'" + e.name + "' es un método: para llamarlo pon paréntesis, " + e.name + '()', e.line, 'CS0428');
    throw this.E("El nombre '" + e.name + "' no existe en el contexto actual (¿no está declarado, o está mal escrito? Mayúsculas y minúsculas cuentan)", e.line, 'CS0103');
  }
  member(e) {
    const P = this.P;
    const ot = this.chk(e.obj);
    if (ot.startsWith('type:')) {
      const T = ot.slice(5), n = e.name;
      e.mk = 'static';
      if (T === 'System' || T === 'System.Text') {
        if (T === 'System' && n === 'Text') return 'type:System.Text';
        const al = { String: 'string', Int32: 'int', Int64: 'long', Int16: 'short', Double: 'double', Single: 'float', Char: 'char', Boolean: 'bool', Byte: 'byte' }[n] || n;
        if (STATIC_TYPES.has(al) || al === 'StringBuilder' || al === 'Random' || EXC_TYPES.has(al)) return 'type:' + al;
        throw this.E("No existe '" + T + '.' + n + "'", e.line, 'CS0234');
      }
      const K = { 'Math.PI': ['double', Math.PI], 'Math.E': ['double', Math.E], 'int.MaxValue': ['int', 2147483647], 'int.MinValue': ['int', -2147483648],
        'long.MaxValue': ['long', 9223372036854775807], 'long.MinValue': ['long', -9223372036854775808], 'short.MaxValue': ['short', 32767], 'short.MinValue': ['short', -32768],
        'byte.MaxValue': ['byte', 255], 'byte.MinValue': ['byte', 0], 'double.MaxValue': ['double', Number.MAX_VALUE], 'double.MinValue': ['double', -Number.MAX_VALUE],
        'double.Epsilon': ['double', Number.MIN_VALUE], 'double.NaN': ['double', NaN], 'double.PositiveInfinity': ['double', Infinity], 'double.NegativeInfinity': ['double', -Infinity],
        'float.MaxValue': ['float', 3.4028234663852886e38], 'float.MinValue': ['float', -3.4028234663852886e38], 'char.MaxValue': ['char', 65535], 'char.MinValue': ['char', 0],
        'string.Empty': ['string', ''], 'Environment.NewLine': ['string', '\n'], 'StringSplitOptions.None': ['StringSplitOptions', 0], 'StringSplitOptions.RemoveEmptyEntries': ['StringSplitOptions', 1] }[T + '.' + n];
      if (K) { e.cv = K[1]; return K[0]; }
      if (T === 'ConsoleColor') { e.cv = 0; return 'ConsoleColor'; }
      if (T === 'Console' && (n === 'ForegroundColor' || n === 'BackgroundColor')) { e.mk = 'conprop'; return 'ConsoleColor'; }
      if (T === 'Console' && n === 'Title') { e.mk = 'conprop'; return 'string'; }
      const cls = P.classes.get(T);
      if (cls) {
        const f = cls.fields.get(n);
        if (f) {
          if (f.kind === 'inst') throw this.E("El campo '" + n + "' no es static", e.line, 'CS0120');
          e.mk = 'sfield'; e.ref = f; if (f.isConst) e.cv = f.cv; return f.ty;
        }
        if (cls.methods.has(n)) throw this.E("'" + n + "' es un método: para llamarlo pon paréntesis", e.line, 'CS0428');
      }
      throw this.E("'" + T + "' no contiene una definición para '" + n + "'", e.line, 'CS0117');
    }
    const n = e.name;
    if (ot === 'string' && n === 'Length') { e.mk = 'strlen'; return 'int'; }
    if (isArr(ot) && (n === 'Length' || n === 'LongLength')) { e.mk = 'arrlen'; return n === 'Length' ? 'int' : 'long'; }
    if (isArr(ot) && n === 'Rank') { e.mk = 'rank'; return 'int'; }
    if (ot === 'StringBuilder' && n === 'Length') { e.mk = 'sblen'; return 'int'; }
    if (ot === 'exc' && n === 'Message') { e.mk = 'excmsg'; return 'string'; }
    if (P.structs.has(ot)) {
      const f = P.structs.get(ot).fmap.get(n);
      if (f) {
        if (!f.isPublic) throw this.E("El campo '" + n + "' del struct no es accesible: declara los campos del struct con 'public'", e.line, 'CS0122');
        e.mk = 'field'; return f.ty;
      }
    }
    if (methodExists(ot, n)) throw this.E("'" + n + "' es un método: para usarlo pon paréntesis, ." + n + '()', e.line, 'CS0428');
    let hint = '';
    if (n === 'length' || n === 'lenght' || n === 'Lenght') hint = " (se escribe 'Length', con L mayúscula)";
    else if (n === 'Count' && (isArr(ot) || ot === 'string')) hint = " (en arrays y string se usa 'Length')";
    throw this.E("'" + tyName(ot) + "' no contiene una definición para '" + n + "'" + hint, e.line, 'CS1061');
  }
  index(e) {
    const ot = this.val(e.obj);
    for (const i of e.idx) {
      const t = this.val(i);
      if (!(t === 'int' || t === 'short' || t === 'byte' || t === 'char' || t === 'long'))
        throw this.E("El índice tiene que ser un número entero, no '" + tyName(t) + "'", i.line, 'CS0029');
    }
    if (ot === 'string' || ot === 'StringBuilder') {
      if (e.idx.length !== 1) throw this.E('Una cadena solo lleva un índice: texto[i]', e.line, 'CS0022');
      e.ik = ot === 'string' ? 'str' : 'sb'; return 'char';
    }
    if (isArr(ot)) {
      const r = rankOf(ot);
      if (e.idx.length !== r) throw this.E('Número de índices incorrecto: este array tiene ' + r + (r === 1 ? ' dimensión' : ' dimensiones') + (r === 1 && e.idx.length === 2 ? ' (si es un array de arrays se escribe [i][j])' : (r === 2 && e.idx.length === 1 ? ' (se escribe [fila, columna])' : '')), e.line, 'CS0022');
      e.ik = 'arr'; return elemOf(ot);
    }
    throw this.E("No se puede usar [ ] con un valor de tipo '" + tyName(ot) + "'", e.line, 'CS0021');
  }
  lvalue(e, op) {
    const what = op === '++' || op === '--' ? "usar '" + op + "' con" : 'asignar un valor a';
    if (e.k === 'paren') return this.lvalue(e.e, op);
    if (e.k === 'name') {
      const d = e.ref;
      if (!d || e.ty.startsWith('type:')) throw this.E('No se puede ' + what + " '" + e.name + "'", e.line, 'CS0131');
      if (d.isConst) throw this.E("No se puede cambiar '" + e.name + "' porque es una constante", e.line, 'CS0131');
      if (d.foreach) throw this.E("No se puede cambiar '" + e.name + "' porque es la variable de un foreach (que solo sirve para leer)", e.line, 'CS1656');
      if (d.readonly && this.m) throw this.E("No se puede cambiar '" + e.name + "' porque es readonly", e.line, 'CS0198');
      return;
    }
    if (e.k === 'index') {
      if (e.ik === 'str') throw this.E('Los string no se pueden modificar letra a letra (texto[i] = ... no vale). Usa un StringBuilder o crea una cadena nueva.', e.line, 'CS0200');
      return;
    }
    if (e.k === 'member') {
      if (e.mk === 'field') {
        let o = e.obj; while (o.k === 'paren') o = o.e;
        if (o.k === 'call') throw this.E('No se puede cambiar un campo del struct que devuelve un método; guárdalo antes en una variable', e.line, 'CS1612');
        if (o.k === 'name' && o.ref && o.ref.foreach) throw this.E("No se pueden cambiar los campos de '" + o.name + "' porque es la variable de un foreach", e.line, 'CS1654');
        if (o.k === 'member' || o.k === 'name' || o.k === 'index') { if (o.k !== 'index') this.lvalueField(o); return; }
        throw this.E('No se puede ' + what + ' esto', e.line, 'CS0131');
      }
      if (e.mk === 'sfield') { if (e.ref.isConst) throw this.E("No se puede cambiar '" + e.name + "' porque es una constante", e.line, 'CS0131'); return; }
      if (e.mk === 'sblen' || e.mk === 'conprop') return;
      if (e.mk === 'strlen' || e.mk === 'arrlen') throw this.E("'Length' es de solo lectura", e.line, 'CS0200');
    }
    throw this.E('A la izquierda del ' + (op || '=') + ' tiene que haber una variable', e.line, 'CS0131');
  }
  lvalueField(o) {
    if (o.k === 'name' && o.ref && o.ref.foreach) throw this.E("No se pueden cambiar los campos de '" + o.name + "' porque es la variable de un foreach", o.line, 'CS1654');
    if (o.k === 'member' && o.mk === 'field') { let p = o.obj; while (p.k === 'paren') p = p.e; if (p.k === 'call') throw this.E('No se puede cambiar un campo del struct que devuelve un método', o.line, 'CS1612'); if (p.k !== 'index') this.lvalueField(p); }
  }
  binType(e, a, b) {
    const P = this.P, op = e.op;
    const bad = (hint) => this.E("El operador '" + op + "' no se puede aplicar a valores de tipo '" + tyName(a) + "' y '" + tyName(b) + "'" + (hint || ''), e.line, 'CS0019');
    if (op === '+' && (a === 'string' || b === 'string')) {
      if (a === 'void' || b === 'void') throw bad();
      e.concat = true; return 'string';
    }
    if (op === '&&' || op === '||') { if (a !== 'bool' || b !== 'bool') throw bad(' (los dos lados tienen que ser condiciones bool)'); return 'bool'; }
    if (op === '==' || op === '!=') {
      if (isNumC(a) && isNumC(b)) { e.opTy = promote(a, b); e.cmp = 'num'; return 'bool'; }
      if (a === 'bool' && b === 'bool') { e.cmp = 'eq'; return 'bool'; }
      if ((a === 'string' || a === 'null') && (b === 'string' || b === 'null')) { e.cmp = 'eq'; return 'bool'; }
      if (isRefTy(P, a) && isRefTy(P, b) && (a === b || a === 'null' || b === 'null')) { e.cmp = 'eq'; return 'bool'; }
      if (a === 'string' && b === 'char' || a === 'char' && b === 'string') throw bad(" (un char va entre comillas simples 'a' y un texto entre dobles \"a\")");
      if (P.structs.has(a) && a === b) throw bad(' (los struct no se comparan con ==; compara campo a campo)');
      throw bad();
    }
    if (['<', '>', '<=', '>='].includes(op)) {
      if (isNumC(a) && isNumC(b)) { e.opTy = promote(a, b); return 'bool'; }
      if (a === 'string' && b === 'string') throw bad(' (para comparar textos usa a.CompareTo(b) o String.Compare(a, b))');
      throw bad();
    }
    if (op === '&' || op === '|' || op === '^') {
      if (a === 'bool' && b === 'bool') { e.opTy = 'bool'; return 'bool'; }
      if ((isIntegral(a) || a === 'char') && (isIntegral(b) || b === 'char')) { e.opTy = promote(a, b); return e.opTy; }
      throw bad();
    }
    if (op === '<<' || op === '>>') {
      if ((isIntegral(a) || a === 'char') && (isIntegral(b) || b === 'char')) { e.opTy = promote(a, 'int'); return e.opTy; }
      throw bad();
    }
    if (isNumC(a) && isNumC(b)) { e.opTy = promote(a, b); return e.opTy; }
    if (op === '+' && (a === 'bool' || b === 'bool')) throw bad();
    throw bad();
  }
  bin(e) {
    const a = this.val(e.l), b = this.val(e.r);
    const t = this.binType(e, a, b);
    e.ta = a; e.tb = b;
    if ((e.op === '/' || e.op === '%') && isIntegral(e.opTy || '') && e.r.cv === 0) throw this.E('División entre la constante cero', e.line, 'CS0020');
    if (e.l.cv !== undefined && e.r.cv !== undefined) {
      if ((e.opTy === 'int' || e.opTy === 'long') && ['+', '-', '*'].includes(e.op)) {
        const exact = e.op === '+' ? e.l.cv + e.r.cv : e.op === '-' ? e.l.cv - e.r.cv : e.l.cv * e.r.cv;
        if (exact < RANGE[e.opTy][0] || exact > RANGE[e.opTy][1])
          throw this.E('La operación se sale del rango de ' + e.opTy + ' (desbordamiento en una expresión constante)', e.line, 'CS0220');
      }
      try { e.cv = binOp(e, e.l.cv, e.r.cv); } catch (x) { /* se calcula al ejecutar */ }
    }
    return t;
  }
  argVal(a) {
    if (a.k === 'refarg') {
      const t = this.val(a.e);
      this.lvalue(a.e, '=');
      a.ty = t; return t;
    }
    return this.val(a);
  }
  call(e) {
    const P = this.P, cal = e.callee;
    // método del programa
    if (cal.k === 'name' && !this.lookup(cal.name)) {
      const c = P.classes.get(this.cls);
      if (c && c.methods.has(cal.name)) return this.userCall(e, c, cal.name);
      if (BUILTIN_FREE.has(cal.name)) throw this.E("'" + cal.name + "' no existe así: " + BUILTIN_FREE.get(cal.name), cal.line, 'CS0103');
    }
    if (cal.k === 'member' && cal.obj.k === 'name' && !this.lookup(cal.obj.name) && P.classes.has(cal.obj.name) && !(this.P.classes.get(this.cls) || { fields: new Map() }).fields.has(cal.obj.name)) {
      const c = P.classes.get(cal.obj.name);
      if (c.methods.has(cal.name)) return this.userCall(e, c, cal.name);
      throw this.E("'" + c.name + "' no tiene un método '" + cal.name + "'", cal.line, 'CS0117');
    }
    if (cal.k !== 'member') {
      if (cal.k === 'name') this.name(cal);
      throw this.E('Eso no se puede llamar como un método', e.line, 'CS0149');
    }
    const ot = this.chk(cal.obj);
    const ats = e.args.map((a) => this.argVal(a));
    let key;
    if (ot.startsWith('type:')) key = ot.slice(5) + '.' + cal.name;
    else {
      const k = isArr(ot) ? 'array' : (P.structs.has(ot) ? 'struct' : (isNum(ot) ? 'num' : ot));
      key = k + '#' + cal.name;
    }
    const b = BUILTINS[key];
    if (!b) {
      if (!ot.startsWith('type:') && cal.name === 'Length') throw this.E("'Length' no lleva paréntesis: se escribe .Length", e.line, 'CS1955');
      let hint = '';
      if (ot.startsWith('type:')) {
        const T = ot.slice(5);
        if (T === 'Console' && cal.name === 'Writeline') hint = " (se escribe WriteLine, con L mayúscula)";
        else if (T === 'Console' && cal.name === 'Readline') hint = " (se escribe ReadLine, con L mayúscula)";
        else if (T === 'Console') hint = ' (o no está disponible en este simulador)';
        throw this.E("'" + T + "' no contiene una definición para '" + cal.name + "'" + hint, e.line, 'CS0117');
      }
      if (['Max', 'Min', 'Sum', 'Average', 'Count', 'Contains', 'ToList', 'OrderBy', 'Distinct', 'Reverse'].includes(cal.name) && isArr(ot)) hint = ' (eso es de LINQ, que no se ve en el tema 4 y este simulador no lo admite)';
      if (cal.name === 'Lenght' || cal.name === 'length') hint = " (se escribe Length y sin paréntesis)";
      throw this.E("'" + tyName(ot) + "' no contiene una definición para '" + cal.name + "'" + hint, e.line, 'CS1061');
    }
    e.bk = key; e.ats = ats; e.ot = ot;
    if (e.args.some((a, i) => a.k === 'refarg' && !(b.refArgs && b.refArgs.includes(i))))
      throw this.E("Este método no lleva ref ni out en sus argumentos", e.line, 'CS1615');
    const rt = b.sig.call(this, ats, e, ot);
    if (rt === undefined || rt === null) throw this.E(b.usage ? 'Argumentos no válidos. Se usa así: ' + b.usage : "Argumentos no válidos para '" + key.replace('#', '.') + "'", e.line, 'CS1502');
    return rt;
  }
  userCall(e, c, name) {
    const list = c.methods.get(name);
    const ats = e.args.map((a) => this.argVal(a));
    const cands = list.filter((m) => m.params.length === e.args.length);
    if (!cands.length) throw this.E("El método '" + name + "' no recibe " + e.args.length + ' argumento' + (e.args.length === 1 ? '' : 's') + ' (recibe ' + list.map((m) => m.params.length).join(' o ') + ')', e.line, 'CS1501');
    let lastErr = null;
    for (const m of cands) {
      try {
        m.params.forEach((p, i) => {
          const a = e.args[i];
          if (p.mod) {
            if (a.k !== 'refarg' || a.mod !== p.mod) throw this.E('El argumento ' + (i + 1) + " de '" + name + "' tiene que llevar la palabra '" + p.mod + "'", a.line, 'CS1620');
            if (ats[i] !== p.ty) throw this.E('El argumento ' + (i + 1) + " de '" + name + "' tiene que ser de tipo '" + tyName(p.ty) + "'", a.line, 'CS1503');
          } else {
            if (a.k === 'refarg') throw this.E('El argumento ' + (i + 1) + " de '" + name + "' no lleva '" + a.mod + "'", a.line, 'CS1615');
            if (!canImplicit(this.P, ats[i], p.ty, a.cv)) throw this.E('Argumento ' + (i + 1) + " de '" + name + "': no se puede convertir de '" + tyName(ats[i]) + "' a '" + tyName(p.ty) + "'", a.line, 'CS1503');
          }
        });
        if (!m.isStatic && (!this.m || this.m.isStatic)) throw this.E("El método '" + name + "' no es static y no se puede llamar desde un método static (añade static: public static void " + name + '())', e.line, 'CS0120');
        e.um = m; e.ats = ats;
        return m.ret;
      } catch (x) { if (!(x instanceof CompileError)) throw x; lastErr = x; }
    }
    throw lastErr;
  }
}
// ---------- asignación definitiva (CS0165), versión simplificada de las reglas de C# ----------
// Estado: Set de variables locales con valor seguro, o null si ese punto del código es inalcanzable.
class DefAssign {
  constructor() { this.jumps = []; }
  run(body) { this.st(body, new Set()); }
  copy(S) { return S === null ? null : new Set(S); }
  join(a, b) {
    if (a === null) return this.copy(b); if (b === null) return this.copy(a);
    const r = new Set(); for (const x of a) if (b.has(x)) r.add(x); return r;
  }
  replace(S, T) { S.clear(); for (const x of T) S.add(x); }
  ex(e, S) {
    if (!e || S === null) return;
    switch (e.k) {
      case 'name':
        if (e.ref && e.ref.da && !S.has(e.ref.id))
          throw new CompileError("Uso de la variable local no asignada '" + e.name + "': puede que llegue aquí sin valor (dale un valor al declararla o en todos los caminos)", e.line, 'CS0165');
        return;
      case 'assign': {
        let t = e.target; while (t.k === 'paren') t = t.e;
        if (e.op === '=' && t.k === 'name') { this.ex(e.value, S); if (t.ref) S.add(t.ref.id); return; }
        if (t.k === 'name') this.ex(t, S); else this.lv(t, S);
        this.ex(e.value, S); return;
      }
      case 'inc': { let t = e.e; while (t.k === 'paren') t = t.e; if (t.k === 'name') this.ex(t, S); else this.lv(t, S); return; }
      case 'bin':
        this.ex(e.l, S);
        if (e.op === '&&' || e.op === '||') this.ex(e.r, this.copy(S)); else this.ex(e.r, S);
        return;
      case 'cond': {
        this.ex(e.c, S);
        const a = this.copy(S), b = this.copy(S);
        this.ex(e.a, a); this.ex(e.b, b); this.replace(S, this.join(a, b)); return;
      }
      case 'call': {
        if (e.callee.k === 'member') this.ex(e.callee.obj, S);
        const outs = [];
        for (const a of e.args) {
          if (a.k === 'refarg') {
            let t = a.e; while (t.k === 'paren') t = t.e;
            if (a.mod === 'out' && t.k === 'name') { if (t.ref) outs.push(t.ref.id); }
            else if (t.k === 'name') this.ex(t, S); else this.lv(t, S);
          } else this.ex(a, S);
        }
        for (const id of outs) S.add(id);
        return;
      }
      case 'member': return this.ex(e.obj, S);
      case 'index': this.ex(e.obj, S); for (const i of e.idx) this.ex(i, S); return;
      case 'newarr': if (e.sizes) for (const s of e.sizes) this.ex(s, S); if (e.init) this.ex(e.init, S); return;
      case 'arrinit': for (const i of e.items) this.ex(i, S); return;
      case 'newobj': for (const a of e.args) this.ex(a, S); return;
      case 'cast': case 'un': case 'paren': return this.ex(e.e, S);
    }
  }
  lv(t, S) { // destino de una asignación que no es una variable simple: se leen sus partes
    if (t.k === 'index') { this.ex(t.obj, S); for (const i of t.idx) this.ex(i, S); }
    else if (t.k === 'member' && t.obj) { let o = t.obj; while (o.k === 'paren') o = o.e; if (o.k !== 'name') this.lv(o, S); }
  }
  loop(isLoop) { const f = { isLoop, breaks: [], conts: [] }; this.jumps.push(f); return f; }
  st(s, S) {
    if (S === null) return null;
    switch (s.k) {
      case 'block': for (const x of s.body) { S = this.st(x, S); if (S === null) return null; } return S;
      case 'decl':
        for (const v of s.vars) {
          if (v.init) this.ex(v.init, S);
          v.d.da = true;
          // shortcut: un struct sin valor inicial cuenta como asignado (C# exige rellenar todos sus campos antes de usarlo entero)
          if (v.init || isStructName(v.ty)) S.add(v.d.id);
        }
        return S;
      case 'expr': this.ex(s.e, S); return S;
      case 'if': {
        this.ex(s.cond, S);
        if (constTrue(s.cond)) return this.st(s.then, this.copy(S));
        const a = this.st(s.then, this.copy(S));
        const b = s.els ? this.st(s.els, this.copy(S)) : S;
        return this.join(a, b);
      }
      case 'while': {
        this.ex(s.cond, S);
        const f = this.loop(true); this.st(s.body, this.copy(S)); this.jumps.pop();
        let after = constTrue(s.cond) ? null : this.copy(S);
        for (const b of f.breaks) after = this.join(after, b);
        return after;
      }
      case 'do': {
        const f = this.loop(true);
        let sc = this.st(s.body, this.copy(S)); this.jumps.pop();
        for (const c of f.conts) sc = this.join(sc, c);
        if (sc !== null) this.ex(s.cond, sc);
        let after = constTrue(s.cond) ? null : sc;
        for (const b of f.breaks) after = this.join(after, b);
        return after;
      }
      case 'for': {
        S = this.copy(S);
        for (const i of s.init) S = this.st(i, S);
        if (s.cond) this.ex(s.cond, S);
        const f = this.loop(true);
        let si = this.st(s.body, this.copy(S)); this.jumps.pop();
        for (const c of f.conts) si = this.join(si, c);
        if (si !== null) for (const it of s.iter) this.ex(it, si);
        let after = s.cond && !constTrue(s.cond) ? this.copy(S) : null;
        for (const b of f.breaks) after = this.join(after, b);
        return after;
      }
      case 'foreach': {
        this.ex(s.coll, S);
        const b = this.copy(S); b.add(s.d.id);
        this.loop(true); this.st(s.body, b); this.jumps.pop();
        return S;
      }
      case 'switch': {
        this.ex(s.e, S);
        const f = this.loop(false);
        for (const sec of s.sections) this.st({ k: 'block', body: sec.body }, this.copy(S));
        this.jumps.pop();
        let after = s.sections.some((sec) => sec.labels.some((l) => l.def)) ? null : this.copy(S);
        for (const b of f.breaks) after = this.join(after, b);
        return after;
      }
      case 'break': { const f = this.jumps[this.jumps.length - 1]; if (f) f.breaks.push(this.copy(S)); return null; }
      case 'continue': { for (let i = this.jumps.length - 1; i >= 0; i--) if (this.jumps[i].isLoop) { this.jumps[i].conts.push(this.copy(S)); break; } return null; }
      case 'return': case 'throw': if (s.e) this.ex(s.e, S); return null;
      case 'try': {
        let after = this.st(s.body, this.copy(S));
        for (const c of s.catches) { const cs = this.copy(S); if (c.d) cs.add(c.d.id); after = this.join(after, this.st(c.body, cs)); }
        if (s.fin) {
          const fs = this.st(s.fin, this.copy(S));
          if (fs === null) return null;
          if (after !== null) for (const x of fs) after.add(x);
        }
        return after;
      }
    }
    return S;
  }
}
let CURRENT_P = null;
function isStructName(t) { return !!(CURRENT_P && CURRENT_P.structs.has(t)); }

function fmtCase(v, t) { if (t === 'string') return v === null ? 'null' : '"' + v + '"'; if (t === 'char') return "'" + String.fromCharCode(v) + "'"; return String(v); }
function lastLine(b) { const s = b.body && b.body.length ? b.body[b.body.length - 1] : b; return s.line; }
function constTrue(e) { return e && e.cv === true; }
function hasBreak(s) {
  switch (s.k) {
    case 'break': return true;
    case 'block': return s.body.some(hasBreak);
    case 'if': return hasBreak(s.then) || (s.els ? hasBreak(s.els) : false);
    case 'try': return hasBreak(s.body) || s.catches.some((c) => hasBreak(c.body)) || (s.fin ? hasBreak(s.fin) : false);
    default: return false; // los bucles y switch internos tienen sus propios break
  }
}
function reach(s) {
  switch (s.k) {
    case 'block': for (const x of s.body) if (!reach(x)) return false; return true;
    case 'return': case 'throw': case 'break': case 'continue': return false;
    case 'if': return !s.els || reach(s.then) || reach(s.els);
    case 'while': return !constTrue(s.cond) || hasBreak(s.body);
    case 'do': return (!constTrue(s.cond)) || hasBreak(s.body);
    case 'for': return (s.cond && !constTrue(s.cond)) || hasBreak(s.body);
    case 'switch': {
      if (!s.sections.some((sec) => sec.labels.some((l) => l.def))) return true;
      return s.sections.some((sec) => sec.body.some(hasBreak));
    }
    case 'try': if (s.fin && !reach(s.fin)) return false; return reach(s.body) || s.catches.some((c) => reach(c.body));
    default: return true;
  }
}

// ---------- operaciones ----------
function binOp(e, a, b) {
  const op = e.op;
  if (e.concat) return str(a, e.ta) + str(b, e.tb);
  if (op === '&&') return a && b; if (op === '||') return a || b;
  if (op === '==' || op === '!=') { const r = e.cmp === 'num' ? a === b : a === b; return op === '==' ? r : !r; }
  if (op === '<') return a < b; if (op === '>') return a > b; if (op === '<=') return a <= b; if (op === '>=') return a >= b;
  if (e.opTy === 'bool') { if (op === '&') return a && b; if (op === '|') return a || b; if (op === '^') return a !== b; }
  return arith(op, a, b, e.opTy, e.line);
}
function arith(op, a, b, T, line) {
  switch (T) {
    case 'int':
      switch (op) {
        case '+': return (a + b) | 0; case '-': return (a - b) | 0; case '*': return Math.imul(a, b);
        case '/': if (b === 0) throw new CsExc('DivideByZeroException', MSG.div0, line); return (a / b) | 0;
        case '%': if (b === 0) throw new CsExc('DivideByZeroException', MSG.div0, line); return (a % b) | 0;
        case '&': return a & b; case '|': return a | b; case '^': return a ^ b; case '<<': return a << b; case '>>': return a >> b;
      }
      break;
    case 'long':
      switch (op) {
        case '+': return a + b; case '-': return a - b; case '*': return a * b;
        case '/': if (b === 0) throw new CsExc('DivideByZeroException', MSG.div0, line); return Math.trunc(a / b) || 0;
        case '%': if (b === 0) throw new CsExc('DivideByZeroException', MSG.div0, line); return (a % b) || 0;
        case '&': return Number(BigInt(a) & BigInt(b)); case '|': return Number(BigInt(a) | BigInt(b)); case '^': return Number(BigInt(a) ^ BigInt(b));
        case '<<': return a * Math.pow(2, b & 63); case '>>': return Math.floor(a / Math.pow(2, b & 63));
      }
      break;
    case 'float': case 'double': {
      let r;
      switch (op) { case '+': r = a + b; break; case '-': r = a - b; break; case '*': r = a * b; break; case '/': r = a / b; break; case '%': r = a % b; break; }
      return T === 'float' ? Math.fround(r) : r;
    }
  }
  throw new Error('op ' + op + ' ' + T);
}
function str(v, t) {
  if (t === 'string') return v === null ? '' : v;
  if (t === 'char') return String.fromCharCode(v);
  if (t === 'bool') return v ? 'True' : 'False';
  if (t === 'double') return fmtG(v, 15);
  if (t === 'float') return fmtG(v, 7);
  if (isIntegral(t)) return String(v);
  if (t === 'null') return '';
  if (v === null || v === undefined) return '';
  if (v instanceof SB) return v.s;
  if (v instanceof Arr) return 'System.' + (NET_NAME[baseOf(v.ty)] || baseOf(v.ty)) + v.ty.slice(baseOf(v.ty).length);
  if (v instanceof Struct) return (v.owner ? v.owner + '+' : '') + v.name;
  if (v instanceof Rnd) return 'System.Random';
  if (v instanceof ExcVal) return 'System.' + v.type + ': ' + v.msg;
  if (t === 'ConsoleColor') return 'Black';
  if (t === 'StringSplitOptions') return v ? 'RemoveEmptyEntries' : 'None';
  return String(v);
}
function fmtComposite(fmt, vals, tys, line) {
  if (fmt === null) throw new CsExc('ArgumentNullException', 'El valor no puede ser nulo.', line);
  let out = '', i = 0;
  const bad = () => new CsExc('FormatException', 'La cadena de formato no es válida (revisa las llaves { } del texto).', line);
  while (i < fmt.length) {
    const c = fmt[i];
    if (c === '{') {
      if (fmt[i + 1] === '{') { out += '{'; i += 2; continue; }
      const j = fmt.indexOf('}', i);
      if (j < 0) throw bad();
      const m = /^\s*(\d+)\s*(?:,\s*(-?\d+))?\s*(?::(.*))?$/.exec(fmt.slice(i + 1, j));
      if (!m) throw bad();
      const k = +m[1];
      if (k >= vals.length) throw new CsExc('FormatException', 'El índice {' + k + '} es mayor que el número de valores que hay después del texto (' + vals.length + ').', line);
      let s;
      const t = tys[k], v = vals[k];
      if (m[3] !== undefined && m[3] !== '' && isNumC(t) && t !== 'char') s = fmtNumber(v, t, m[3], line);
      else s = str(v, t);
      if (m[2] !== undefined) { const w = +m[2]; s = w >= 0 ? s.padStart(w) : s.padEnd(-w); }
      out += s; i = j + 1; continue;
    }
    if (c === '}') { if (fmt[i + 1] === '}') { out += '}'; i += 2; continue; } throw bad(); }
    out += c; i++;
  }
  return out;
}
function methodExists(ot, n) { const k = isArr(ot) ? 'array' : (isNum(ot) ? 'num' : ot); return !!BUILTINS[k + '#' + n]; }

// ======================================================================
//                         MÉTODOS DE .NET SOPORTADOS
// ======================================================================
const BUILTINS = {};
const BUILTIN_FREE = new Map([['WriteLine', 'Console.WriteLine(...)'], ['ReadLine', 'Console.ReadLine()'], ['Write', 'Console.Write(...)'], ['Sqrt', 'Math.Sqrt(...)'], ['Pow', 'Math.Pow(...)']]);
function def(key, sig, run, extra) { BUILTINS[key] = Object.assign({ sig, run }, extra || {}); }
const anyVal = (t) => t !== 'void' && t !== 'type:';
const num = (t) => isNumC(t);
const imp = (P, a, b) => canImplicit(P, a, b);

// --- Console ---
function writeSig(ats, e) {
  if (ats.length === 0) return 'void';
  if (ats.length === 1) return 'void';
  if (ats[0] !== 'string') throw new CompileError('Si pones varios valores separados por comas, el primero tiene que ser el texto con los huecos {0}, {1}...', e.line, 'CS1502');
  return 'void';
}
function writeRun(args, ats) {
  if (args.length === 0) return '';
  if (args.length === 1) return ats[0] === 'char[]' ? (args[0] ? args[0].d.map((c) => String.fromCharCode(c)).join('') : '') : str(args[0], ats[0]);
  return fmtComposite(args[0], args.slice(1), ats.slice(1), this.line);
}
def('Console.WriteLine', writeSig, function (a, t) { this.rt.out(writeRun.call(this, a, t) + '\n'); });
def('Console.Write', function (ats, e) { if (!ats.length) return null; return writeSig(ats, e); }, function (a, t) { this.rt.out(writeRun.call(this, a, t)); }, { usage: 'Console.Write(valor)' });
def('Console.ReadLine', (a) => a.length ? null : 'string', function () { return this.rt.readLine(); }, { usage: 'Console.ReadLine()' });
def('Console.Clear', (a) => a.length ? null : 'void', function () { this.rt.clear(); });
def('Console.ReadKey', (a) => a.length <= 1 ? 'ConsoleKeyInfo' : null, function () { return null; });
def('Console.Beep', () => 'void', () => undefined);
def('Console.ResetColor', () => 'void', () => undefined);
def('Console.Read', function (a, e) { throw new CompileError('Console.Read() no está soportado en el simulador; usa Console.ReadLine()', e.line, 'SIM'); }, null);
def('Console.SetCursorPosition', function (a, e) { throw new CompileError('Console.SetCursorPosition no está soportado en el simulador', e.line, 'SIM'); }, null);

// --- Math ---
const m1 = (f) => [function (a) { return a.length === 1 && num(a[0]) ? 'double' : null; }, (x) => f(x[0])];
for (const [n, f] of [['Sqrt', Math.sqrt], ['Floor', Math.floor], ['Ceiling', Math.ceil], ['Truncate', Math.trunc], ['Sin', Math.sin], ['Cos', Math.cos], ['Tan', Math.tan],
  ['Asin', Math.asin], ['Acos', Math.acos], ['Atan', Math.atan], ['Log10', Math.log10], ['Exp', Math.exp]]) {
  const [s, r] = m1(f); def('Math.' + n, s, r, { usage: 'Math.' + n + '(número)' });
}
def('Math.Pow', (a) => a.length === 2 && num(a[0]) && num(a[1]) ? 'double' : null, (x) => Math.pow(x[0], x[1]), { usage: 'Math.Pow(base, exponente)' });
def('Math.Atan2', (a) => a.length === 2 && num(a[0]) && num(a[1]) ? 'double' : null, (x) => Math.atan2(x[0], x[1]));
def('Math.Log', (a) => (a.length === 1 || a.length === 2) && a.every(num) ? 'double' : null, (x) => x.length === 1 ? Math.log(x[0]) : Math.log(x[0]) / Math.log(x[1]));
def('Math.Abs', (a) => a.length === 1 && num(a[0]) ? (['short', 'int', 'long', 'float', 'double'].includes(a[0]) ? a[0] : 'int') : null, (x) => Math.abs(x[0]), { usage: 'Math.Abs(número)' });
def('Math.Sign', (a) => a.length === 1 && num(a[0]) ? 'int' : null, (x) => Math.sign(x[0]) || 0);
for (const n of ['Max', 'Min']) def('Math.' + n, (a) => a.length === 2 && num(a[0]) && num(a[1]) ? promote(a[0], a[1]) : null, (x) => (n === 'Max' ? Math.max : Math.min)(x[0], x[1]), { usage: 'Math.' + n + '(a, b)' });
def('Math.Round', (a) => (a.length === 1 || (a.length === 2 && imp(null, a[1], 'int'))) && num(a[0]) ? 'double' : null, (x) => {
  if (x.length === 1) return roundEven(x[0]);
  const p = Math.pow(10, x[1]); const y = x[0] * p; return roundEven(Number(y.toPrecision(15))) / p;
}, { usage: 'Math.Round(número) o Math.Round(número, decimales)' });

// --- Convert y Parse ---
const CONV = { ToInt32: 'int', ToInt16: 'short', ToInt64: 'long', ToByte: 'byte', ToDouble: 'double', ToSingle: 'float', ToDecimal: 'double', ToChar: 'char', ToString: 'string', ToBoolean: 'bool' };
function convertVal(v, from, to, line) {
  if (from === 'string') {
    if (v === null) return to === 'string' ? '' : (to === 'bool' ? false : 0);
    if (isIntegral(to)) return parseIntStr(v, to, line);
    if (to === 'double' || to === 'float') return parseRealStr(v, to, line);
    if (to === 'char') { if (v.length !== 1) throw new CsExc('FormatException', 'La cadena tiene que tener exactamente un carácter.', line); return v.charCodeAt(0); }
    if (to === 'bool') { const t = v.trim().toLowerCase(); if (t === 'true') return true; if (t === 'false') return false; throw new CsExc('FormatException', 'La cadena no se reconoce como un valor Boolean válido.', line); }
    return v;
  }
  if (to === 'string') return str(v, from);
  if (from === 'bool') { if (to === 'char') throw new CsExc('InvalidCastException', "No se admite la conversión de 'Boolean' en 'Char'.", line); return v ? 1 : 0; }
  if (to === 'bool') { if (from === 'char') throw new CsExc('InvalidCastException', "No se admite la conversión de 'Char' en 'Boolean'.", line); return v !== 0; }
  if (from === 'char' && (to === 'double' || to === 'float')) throw new CsExc('InvalidCastException', "No se admite la conversión de 'Char' en '" + NET_NAME[to] + "'.", line);
  if (to === 'char' && (from === 'double' || from === 'float')) throw new CsExc('InvalidCastException', "No se admite la conversión de '" + NET_NAME[from] + "' en 'Char'.", line);
  if (isIntegral(to) || to === 'char') return toIntChecked(v, from, to, line);
  return to === 'float' ? Math.fround(v) : v;
}
for (const [n, to] of Object.entries(CONV)) {
  def('Convert.' + n, (a) => a.length === 1 && (a[0] === 'string' || num(a[0]) || a[0] === 'bool' || a[0] === 'null') ? to : null,
    function (x, t) { return convertVal(x[0], t[0] === 'null' ? 'string' : t[0], to, this.line); }, { usage: 'Convert.' + n + '(valor)' });
}
for (const T of ['int', 'long', 'short', 'byte', 'double', 'float', 'char', 'bool']) {
  def(T + '.Parse', (a) => a.length === 1 && a[0] === 'string' ? T : null, function (x) {
    if (x[0] === null) throw new CsExc('ArgumentNullException', 'El valor no puede ser nulo.', this.line);
    return convertVal(x[0], 'string', T, this.line);
  }, { usage: T + '.Parse(texto)' });
  def(T + '.TryParse', function (a, e) {
    if (a.length !== 2 || a[0] !== 'string') return null;
    const r = e.args[1];
    if (r.k !== 'refarg' || r.mod !== 'out') throw new CompileError("El segundo argumento de TryParse lleva 'out': " + T + '.TryParse(texto, out variable)', e.line, 'CS1620');
    if (a[1] !== T) throw new CompileError('La variable del out tiene que ser de tipo ' + T, e.line, 'CS1503');
    return 'bool';
  }, function (x, t, cells) {
    try { cells[1].v = convertVal(x[0], 'string', T, this.line); return true; }
    catch (err) { if (!(err instanceof CsExc)) throw err; cells[1].v = T === 'bool' ? false : 0; return false; }
  }, { refArgs: [1], usage: T + '.TryParse(texto, out variable)' });
}
// ToString / CompareTo / Equals en números, char y bool
for (const k of ['num', 'char', 'bool']) {
  def(k + '#ToString', function (a, e, ot) { if (a.length === 0) return 'string'; if (a.length === 1 && a[0] === 'string' && k === 'num') return 'string'; return null; },
    function (x, t) { return x.length ? fmtNumber(this.self, this.selfTy, x[0], this.line) : str(this.self, this.selfTy); }, { usage: 'valor.ToString() o valor.ToString("0.00")' });
  def(k + '#CompareTo', (a, e, ot) => a.length === 1 && (a[0] === ot || (num(a[0]) && num(ot))) ? 'int' : null, function (x) { const a = this.self, b = x[0]; return a < b ? -1 : a > b ? 1 : 0; });
  def(k + '#Equals', (a) => a.length === 1 ? 'bool' : null, function (x) { return this.self === x[0]; });
}
// char
const charTest = { IsDigit: /\p{Nd}/u, IsLetter: /\p{L}/u, IsLetterOrDigit: /[\p{L}\p{Nd}]/u, IsUpper: /\p{Lu}/u, IsLower: /\p{Ll}/u,
  IsWhiteSpace: /\s/u, IsPunctuation: /\p{P}/u, IsNumber: /\p{N}/u, IsSymbol: /\p{S}/u, IsControl: /\p{Cc}/u };
for (const [n, re] of Object.entries(charTest))
  def('char.' + n, (a) => a.length === 1 && a[0] === 'char' ? 'bool' : null, (x) => re.test(String.fromCharCode(x[0])), { usage: 'char.' + n + "('a')" });
const chUp = (c) => { const s = String.fromCharCode(c).toUpperCase(); return s.length === 1 ? s.charCodeAt(0) : c; };
const chLow = (c) => { const s = String.fromCharCode(c).toLowerCase(); return s.length === 1 ? s.charCodeAt(0) : c; };
def('char.ToUpper', (a) => a.length === 1 && a[0] === 'char' ? 'char' : null, (x) => chUp(x[0]), { usage: "char.ToUpper('a')" });
def('char.ToLower', (a) => a.length === 1 && a[0] === 'char' ? 'char' : null, (x) => chLow(x[0]), { usage: "char.ToLower('A')" });
def('char.GetNumericValue', (a) => a.length === 1 && a[0] === 'char' ? 'double' : null, (x) => { const c = String.fromCharCode(x[0]); return /\d/.test(c) ? +c : -1; });
def('char.ToString', (a) => a.length === 1 && a[0] === 'char' ? 'string' : null, (x) => String.fromCharCode(x[0]));

// --- string (estáticos) ---
def('string.Compare', (a) => (a.length === 2 || (a.length === 3 && a[2] === 'bool')) && a.slice(0, 2).every((t) => t === 'string' || t === 'null') ? 'int' : null,
  (x) => cmpStr(x[0], x[1], !!x[2]), { usage: 'String.Compare(a, b) o String.Compare(a, b, true)' });
def('string.CompareOrdinal', (a) => a.length === 2 ? 'int' : null, (x) => x[0] === x[1] ? 0 : (x[0] < x[1] ? -1 : 1));
def('string.Equals', (a) => a.length === 2 ? 'bool' : null, (x) => x[0] === x[1]);
def('string.IsNullOrEmpty', (a) => a.length === 1 && a[0] === 'string' ? 'bool' : null, (x) => x[0] === null || x[0] === '');
def('string.IsNullOrWhiteSpace', (a) => a.length === 1 && a[0] === 'string' ? 'bool' : null, (x) => x[0] === null || x[0].trim() === '');
def('string.Concat', (a) => a.length >= 1 && a.every(anyVal) ? 'string' : null, function (x, t) { return x.map((v, i) => str(v, t[i])).join(''); });
def('string.Format', (a, e) => a.length >= 1 && a[0] === 'string' ? 'string' : null, function (x, t) { return fmtComposite(x[0], x.slice(1), t.slice(1), this.line); }, { usage: 'String.Format("texto {0}", valor)' });
def('string.Join', (a) => a.length === 2 && (a[0] === 'string' || a[0] === 'char') && isArr(a[1]) && rankOf(a[1]) === 1 ? 'string' : null,
  function (x, t) { if (!x[1]) throw new CsExc('ArgumentNullException', 'El valor no puede ser nulo.', this.line); const sep = t[0] === 'char' ? String.fromCharCode(x[0]) : (x[0] || ''); return x[1].d.map((v) => str(v, x[1].et)).join(sep); },
  { usage: 'String.Join(separador, array)' });

// --- string (instancia) ---
const S = (n, sig, run, extra) => def('string#' + n, sig, run, extra);
const isStr = (t) => t === 'string' || t === 'null';
const argOOR = (msg, line) => new CsExc('ArgumentOutOfRangeException', msg, line);
S('Substring', (a) => (a.length === 1 || a.length === 2) && a.every((t) => imp(null, t, 'int')) ? 'string' : null, function (x) {
  const s = this.self, i = x[0], n = x.length > 1 ? x[1] : s.length - i;
  if (i < 0) throw argOOR('startIndex no puede ser menor que cero.', this.line);
  if (i > s.length) throw argOOR('startIndex no puede ser mayor que la longitud de la cadena (' + s.length + ').', this.line);
  if (n < 0) throw argOOR('La longitud no puede ser menor que cero.', this.line);
  if (i + n > s.length) throw argOOR('El índice y la longitud deben hacer referencia a una ubicación de la cadena (Substring(' + i + ', ' + n + ') en un texto de ' + s.length + ' letras).', this.line);
  return s.substr(i, n);
}, { usage: 'texto.Substring(posición) o texto.Substring(posición, cantidad)' });
const idxSig = (a) => a.length >= 1 && a.length <= 3 && (isStr(a[0]) || a[0] === 'char') && a.slice(1).every((t) => imp(null, t, 'int')) ? 'int' : null;
S('IndexOf', idxSig, function (x, t) {
  const s = this.self, needle = t[0] === 'char' ? String.fromCharCode(x[0]) : x[0];
  if (needle === null) throw new CsExc('ArgumentNullException', 'El valor no puede ser nulo.', this.line);
  const st = x.length > 1 ? x[1] : 0;
  if (st < 0 || st > s.length) throw argOOR('El índice de inicio está fuera del intervalo.', this.line);
  if (x.length > 2) { if (x[2] < 0 || st + x[2] > s.length) throw argOOR('El recuento está fuera del intervalo.', this.line); const r = s.slice(0, st + x[2]).indexOf(needle, st); return r; }
  return s.indexOf(needle, st);
}, { usage: 'texto.IndexOf("algo") o texto.IndexOf("algo", desde)' });
S('LastIndexOf', idxSig, function (x, t) {
  const s = this.self, needle = t[0] === 'char' ? String.fromCharCode(x[0]) : x[0];
  if (x.length > 1) { if (x[1] < 0 || x[1] >= s.length && s.length) throw argOOR('El índice está fuera del intervalo.', this.line); return s.lastIndexOf(needle, x[1] - needle.length + 1); }
  return needle === '' ? Math.max(0, s.length - 1) : s.lastIndexOf(needle);
});
S('IndexOfAny', (a) => a.length >= 1 && a[0] === 'char[]' ? 'int' : null, function (x) { const set = new Set(x[0].d); for (let i = x[1] || 0; i < this.self.length; i++) if (set.has(this.self.charCodeAt(i))) return i; return -1; });
S('Contains', function (a, e) {
  if (a.length !== 1) return null;
  if (a[0] === 'char') { if (this.P.usesLinq) return 'bool'; throw new CompileError('En tu versión de C#, Contains necesita un texto entre comillas dobles: Contains("a"), no Contains(\'a\')', e.line, 'CS1503'); }
  return isStr(a[0]) ? 'bool' : null;
}, function (x, t) { if (x[0] === null) throw new CsExc('ArgumentNullException', 'El valor no puede ser nulo.', this.line); return this.self.includes(t[0] === 'char' ? String.fromCharCode(x[0]) : x[0]); }, { usage: 'texto.Contains("algo")' });
S('StartsWith', (a) => a.length === 1 && isStr(a[0]) ? 'bool' : null, function (x) { return this.self.startsWith(x[0]); }, { usage: 'texto.StartsWith("algo")' });
S('EndsWith', (a) => a.length === 1 && isStr(a[0]) ? 'bool' : null, function (x) { return this.self.endsWith(x[0]); }, { usage: 'texto.EndsWith("algo")' });
for (const n of ['ToUpper', 'ToUpperInvariant']) S(n, (a) => a.length === 0 ? 'string' : null, function () { return this.self.toUpperCase(); });
for (const n of ['ToLower', 'ToLowerInvariant']) S(n, (a) => a.length === 0 ? 'string' : null, function () { return this.self.toLowerCase(); });
const trimSig = (a) => a.every((t) => t === 'char') || (a.length === 1 && a[0] === 'char[]') ? 'string' : null;
const trimSet = (x, t) => x.length === 0 ? null : new Set(t[0] === 'char[]' ? x[0].d : x);
const isWs = (c) => /\s/.test(String.fromCharCode(c));
function trimRun(x, t, l, r) {
  const set = trimSet(x, t), s = this.self, ok = (c) => set ? set.has(c) : isWs(c);
  let i = 0, j = s.length;
  if (l) while (i < j && ok(s.charCodeAt(i))) i++;
  if (r) while (j > i && ok(s.charCodeAt(j - 1))) j--;
  return s.slice(i, j);
}
S('Trim', trimSig, function (x, t) { return trimRun.call(this, x, t, true, true); });
S('TrimStart', trimSig, function (x, t) { return trimRun.call(this, x, t, true, false); });
S('TrimEnd', trimSig, function (x, t) { return trimRun.call(this, x, t, false, true); });
S('Insert', (a) => a.length === 2 && imp(null, a[0], 'int') && isStr(a[1]) ? 'string' : null, function (x) {
  if (x[0] < 0 || x[0] > this.self.length) throw argOOR('El índice está fuera del intervalo (Insert(' + x[0] + ', ...) en un texto de ' + this.self.length + ' letras).', this.line);
  return this.self.slice(0, x[0]) + (x[1] || '') + this.self.slice(x[0]);
}, { usage: 'texto.Insert(posición, "algo")' });
S('Remove', (a) => (a.length === 1 || a.length === 2) && a.every((t) => imp(null, t, 'int')) ? 'string' : null, function (x) {
  const s = this.self, i = x[0], n = x.length > 1 ? x[1] : s.length - i;
  if (i < 0 || i > s.length || (x.length === 1 && i >= s.length)) throw argOOR('startIndex debe ser menor que la longitud de la cadena.', this.line);
  if (n < 0 || i + n > s.length) throw argOOR('El índice y el recuento deben hacer referencia a una ubicación de la cadena.', this.line);
  return s.slice(0, i) + s.slice(i + n);
}, { usage: 'texto.Remove(posición, cantidad)' });
S('Replace', (a) => a.length === 2 && ((isStr(a[0]) && isStr(a[1])) || (a[0] === 'char' && a[1] === 'char')) ? 'string' : null, function (x, t) {
  if (t[0] === 'char') return this.self.split(String.fromCharCode(x[0])).join(String.fromCharCode(x[1]));
  if (x[0] === null) throw new CsExc('ArgumentNullException', 'El valor no puede ser nulo.', this.line);
  if (x[0] === '') throw new CsExc('ArgumentException', 'La cadena no puede tener longitud cero.', this.line);
  return this.self.split(x[0]).join(x[1] || '');
}, { usage: 'texto.Replace("viejo", "nuevo")' });
S('Split', function (a, e) {
  if (a.length === 0) return 'string[]';
  if (a.every((t) => t === 'char')) return 'string[]';
  if (a.length === 1 && a[0] === 'char[]') return 'string[]';
  if (a.length === 2 && (a[0] === 'char[]' || a[0] === 'string[]') && a[1] === 'StringSplitOptions') return 'string[]';
  if (a.length === 1 && a[0] === 'string') throw new CompileError("En tu versión de C#, Split necesita un char entre comillas simples: Split(' '), no Split(\" \")", e.line, 'CS1503');
  return null;
}, function (x, t) {
  const s = this.self; let seps, opt = 0, strs = false;
  if (x.length === 0) seps = null;
  else if (t[0] === 'char') seps = x.map((c) => String.fromCharCode(c));
  else { strs = t[0] === 'string[]'; seps = x[0] ? x[0].d.map((c) => strs ? c : String.fromCharCode(c)) : null; if (x.length === 2) opt = x[1]; }
  let parts;
  if (!seps || !seps.length) parts = s.split(/\s/);
  else { const esc = seps.filter((z) => z).map((z) => z.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); parts = esc.length ? s.split(new RegExp(esc.join('|'))) : [s]; }
  if (opt === 1) parts = parts.filter((p) => p !== '');
  return new Arr('string[]', [parts.length], parts);
}, { usage: "texto.Split(' ')" });
S('PadLeft', (a) => (a.length === 1 || (a.length === 2 && a[1] === 'char')) && imp(null, a[0], 'int') ? 'string' : null, function (x) { return this.self.padStart(x[0], x.length > 1 ? String.fromCharCode(x[1]) : ' '); });
S('PadRight', (a) => (a.length === 1 || (a.length === 2 && a[1] === 'char')) && imp(null, a[0], 'int') ? 'string' : null, function (x) { return this.self.padEnd(x[0], x.length > 1 ? String.fromCharCode(x[1]) : ' '); });
S('ToCharArray', (a) => a.length === 0 ? 'char[]' : null, function () { const d = []; for (let i = 0; i < this.self.length; i++) d.push(this.self.charCodeAt(i)); return new Arr('char[]', [d.length], d); });
S('ToString', (a) => a.length === 0 ? 'string' : null, function () { return this.self; });
S('Equals', (a) => a.length === 1 && isStr(a[0]) ? 'bool' : null, function (x) { return this.self === x[0]; });
S('CompareTo', (a) => a.length === 1 && isStr(a[0]) ? 'int' : null, function (x) { return cmpStr(this.self, x[0], false); }, { usage: 'a.CompareTo(b)' });

// --- arrays ---
const A = (n, sig, run, extra) => def('array#' + n, sig, run, extra);
A('GetLength', (a) => a.length === 1 && imp(null, a[0], 'int') ? 'int' : null, function (x) { const d = this.self.dims; if (x[0] < 0 || x[0] >= d.length) throw new CsExc('IndexOutOfRangeException', MSG.idx, this.line); return d[x[0]]; }, { usage: 'array.GetLength(dimensión)' });
A('GetUpperBound', (a) => a.length === 1 && imp(null, a[0], 'int') ? 'int' : null, function (x) { const d = this.self.dims; if (x[0] < 0 || x[0] >= d.length) throw new CsExc('IndexOutOfRangeException', MSG.idx, this.line); return d[x[0]] - 1; });
A('GetLowerBound', (a) => a.length === 1 ? 'int' : null, () => 0);
A('ToString', (a) => a.length === 0 ? 'string' : null, function () { return str(this.self, this.selfTy); });
function sortCmp(et, line) {
  if (et === 'string') return (a, b) => cmpStr(a, b, false);
  if (isNumC(et)) return (a, b) => a - b;
  if (et === 'bool') return (a, b) => a - b;
  throw new CsExc('InvalidOperationException', 'No se pudieron comparar dos elementos de la matriz (Array.Sort no sabe ordenar ' + et + ').', line);
}
const arr1 = (t) => isArr(t) && rankOf(t) === 1;
def('Array.Sort', (a) => (a.length === 1 && arr1(a[0])) || (a.length === 3 && arr1(a[0]) && imp(null, a[1], 'int') && imp(null, a[2], 'int')) ? 'void' : null, function (x) {
  const arr = x[0]; if (!arr) throw nullref(this.line);
  const i = x.length > 1 ? x[1] : 0, n = x.length > 1 ? x[2] : arr.d.length;
  if (i < 0 || n < 0 || i + n > arr.d.length) throw argOOR('El índice y la longitud no corresponden a una parte válida del array.', this.line);
  const part = arr.d.slice(i, i + n).sort(sortCmp(arr.et, this.line));
  for (let k = 0; k < n; k++) arr.d[i + k] = part[k];
}, { usage: 'Array.Sort(array)' });
def('Array.Reverse', (a) => (a.length === 1 && arr1(a[0])) || (a.length === 3 && arr1(a[0])) ? 'void' : null, function (x) {
  const arr = x[0]; if (!arr) throw nullref(this.line);
  const i = x.length > 1 ? x[1] : 0, n = x.length > 1 ? x[2] : arr.d.length;
  const part = arr.d.slice(i, i + n).reverse(); for (let k = 0; k < n; k++) arr.d[i + k] = part[k];
});
def('Array.IndexOf', (a) => a.length === 2 && arr1(a[0]) ? 'int' : null, function (x) { return x[0].d.indexOf(x[1]); });
def('Array.LastIndexOf', (a) => a.length === 2 && arr1(a[0]) ? 'int' : null, function (x) { return x[0].d.lastIndexOf(x[1]); });
def('Array.Clear', (a) => a.length === 3 && isArr(a[0]) ? 'void' : null, function (x) { for (let k = x[1]; k < x[1] + x[2]; k++) x[0].d[k] = this.rt.defVal(x[0].et); });
def('Array.Copy', (a) => (a.length === 3 && isArr(a[0]) && isArr(a[1])) || (a.length === 5 && isArr(a[0]) && isArr(a[2])) ? 'void' : null, function (x) {
  const [src, si, dst, di, n] = x.length === 3 ? [x[0], 0, x[1], 0, x[2]] : x;
  if (si + n > src.d.length || di + n > dst.d.length) throw new CsExc('ArgumentException', 'La matriz de origen o de destino no es lo bastante larga.', this.line);
  const part = src.d.slice(si, si + n); for (let k = 0; k < n; k++) dst.d[di + k] = this.rt.cloneV(part[k]);
});
def('Array.Resize', function (a, e) {
  if (a.length !== 2 || !arr1(a[0])) return null;
  if (e.args[0].k !== 'refarg' || e.args[0].mod !== 'ref') throw new CompileError('Array.Resize se usa con ref: Array.Resize(ref array, nuevoTamaño)', e.line, 'CS1620');
  return 'void';
}, function (x, t, cells) {
  const old = cells[0].v, n = x[1], d = [];
  for (let k = 0; k < n; k++) d.push(old && k < old.d.length ? old.d[k] : this.rt.defVal(elemOf(t[0])));
  cells[0].v = new Arr(t[0], [n], d);
}, { refArgs: [0] });

// --- StringBuilder ---
const B = (n, sig, run, extra) => def('StringBuilder#' + n, sig, run, extra);
B('Append', (a) => a.length === 1 && anyVal(a[0]) ? 'StringBuilder' : null, function (x, t) { this.self.s += t[0] === 'char[]' ? x[0].d.map((c) => String.fromCharCode(c)).join('') : str(x[0], t[0]); return this.self; });
B('AppendLine', (a) => a.length <= 1 ? 'StringBuilder' : null, function (x, t) { this.self.s += (x.length ? str(x[0], t[0]) : '') + '\n'; return this.self; });
B('Insert', (a) => a.length === 2 && imp(null, a[0], 'int') ? 'StringBuilder' : null, function (x, t) {
  if (x[0] < 0 || x[0] > this.self.s.length) throw argOOR('El índice está fuera del intervalo.', this.line);
  this.self.s = this.self.s.slice(0, x[0]) + str(x[1], t[1]) + this.self.s.slice(x[0]); return this.self;
});
B('Remove', (a) => a.length === 2 && a.every((t) => imp(null, t, 'int')) ? 'StringBuilder' : null, function (x) {
  const s = this.self.s; if (x[0] < 0 || x[1] < 0 || x[0] + x[1] > s.length) throw argOOR('El índice y la longitud deben hacer referencia a una ubicación del StringBuilder.', this.line);
  this.self.s = s.slice(0, x[0]) + s.slice(x[0] + x[1]); return this.self;
});
B('Replace', (a) => a.length === 2 && ((isStr(a[0]) && isStr(a[1])) || (a[0] === 'char' && a[1] === 'char')) ? 'StringBuilder' : null, function (x, t) {
  const f = t[0] === 'char' ? String.fromCharCode(x[0]) : x[0], r = t[0] === 'char' ? String.fromCharCode(x[1]) : (x[1] || '');
  if (f === '' || f === null) throw new CsExc('ArgumentException', 'La cadena no puede tener longitud cero.', this.line);
  this.self.s = this.self.s.split(f).join(r); return this.self;
});
B('Clear', (a) => a.length === 0 ? 'StringBuilder' : null, function () { this.self.s = ''; return this.self; });
B('ToString', (a) => a.length === 0 || (a.length === 2 && a.every((t) => imp(null, t, 'int'))) ? 'string' : null, function (x) { return x.length ? this.self.s.substr(x[0], x[1]) : this.self.s; });
B('Equals', (a) => a.length === 1 ? 'bool' : null, function (x) { return x[0] instanceof SB && x[0].s === this.self.s; });

// --- Random ---
def('Random#Next', (a) => a.length <= 2 && a.every((t) => imp(null, t, 'int')) ? 'int' : null, function (x) {
  const r = this.self.next();
  if (x.length === 0) return Math.floor(r * 2147483647);
  const lo = x.length === 2 ? x[0] : 0, hi = x.length === 2 ? x[1] : x[0];
  if (hi < lo || (x.length === 1 && hi < 0)) throw argOOR("'minValue' no puede ser mayor que maxValue.", this.line);
  return lo + Math.floor(r * (hi - lo));
}, { usage: 'r.Next(máximo) o r.Next(mínimo, máximo)' });
def('Random#NextDouble', (a) => a.length === 0 ? 'double' : null, function () { return this.self.next(); });
// --- excepciones y struct ---
def('exc#ToString', (a) => a.length === 0 ? 'string' : null, function () { return 'System.' + this.self.type + ': ' + this.self.msg; });
def('struct#ToString', (a) => a.length === 0 ? 'string' : null, function () { return str(this.self, this.selfTy); });

// ======================================================================
//                               EJECUCIÓN
// ======================================================================
const BRK = { brk: 1 }, CNT = { cnt: 1 }, RET = { ret: 1 };
const MAX_STEPS = 20000000, MAX_OUT = 200000, MAX_DEPTH = 1500;

class Runtime {
  constructor(P, inputs, seed) {
    this.P = P; this.inputs = inputs; this.inPos = 0; this.segs = []; this.outLen = 0; this.steps = 0; this.depth = 0;
    this.G = Object.create(null); this.seed = seed || 12345; this.line = 1; this.self = null; this.selfTy = null;
  }
  out(s) {
    if (!s) return;
    this.outLen += s.length;
    if (this.outLen > MAX_OUT) throw new Halt('El programa ha escrito demasiado texto (¿un bucle que no termina?). Se ha detenido.', this.line);
    const last = this.segs[this.segs.length - 1];
    if (last && last.t === 'out') last.s += s; else this.segs.push({ t: 'out', s });
  }
  clear() { this.segs = []; }
  readLine() {
    if (this.inPos >= this.inputs.length) throw new NeedInput();
    const s = this.inputs[this.inPos++];
    this.segs.push({ t: 'in', s: s + '\n' });
    return s;
  }
  defVal(t) {
    if (isNumC(t)) return 0;
    if (t === 'bool') return false;
    const st = this.P.structs.get(t);
    if (st) { const f = Object.create(null); for (const x of st.fields) f[x.name] = this.defVal(x.ty); const s = new Struct(t, f); s.owner = st.outer; return s; }
    return null;
  }
  cloneV(v) {
    if (v instanceof Struct) { const f = Object.create(null); for (const k in v.f) f[k] = this.cloneV(v.f[k]); const s = new Struct(v.name, f); s.owner = v.owner; return s; }
    return v;
  }
  tick(line) { if (++this.steps > MAX_STEPS) throw new Halt('El programa no termina (¿un bucle infinito?). Se ha detenido tras demasiados pasos.', line); }

  // ---- sentencias ----
  execBlock(list, fr) {
    for (let i = 0; i < list.length; i++) { const r = this.exec(list[i], fr); if (r) return r; }
    return undefined;
  }
  exec(s, fr) {
    this.line = s.line; this.tick(s.line);
    switch (s.k) {
      case 'block': return this.execBlock(s.body, fr);
      case 'empty': return;
      case 'expr': this.ev(s.e, fr); return;
      case 'decl':
        for (const v of s.vars) {
          let val;
          if (!v.init) val = this.P.structs.has(v.ty) ? this.defVal(v.ty) : UNSET;
          else if (v.init.k === 'arrinit') val = this.buildInit(v.init, v.ty, fr);
          else val = coerce(this.cloneV(this.ev(v.init, fr)), v.init.ty, v.ty);
          fr[v.d.id] = { v: val };
        }
        return;
      case 'if': return this.ev(s.cond, fr) ? this.exec(s.then, fr) : (s.els ? this.exec(s.els, fr) : undefined);
      case 'while':
        while (this.ev(s.cond, fr)) {
          const r = this.exec(s.body, fr);
          if (r === BRK) break; if (r === RET) return r;
          this.tick(s.line);
        }
        return;
      case 'do':
        do {
          const r = this.exec(s.body, fr);
          if (r === BRK) break; if (r === RET) return r;
          this.tick(s.line);
        } while (this.ev(s.cond, fr));
        return;
      case 'for':
        for (const i of s.init) this.exec(i, fr);
        while (!s.cond || this.ev(s.cond, fr)) {
          const r = this.exec(s.body, fr);
          if (r === BRK) break; if (r === RET) return r;
          for (const it of s.iter) this.ev(it, fr);
          this.tick(s.line);
        }
        return;
      case 'foreach': {
        const c = this.ev(s.coll, fr);
        if (c === null) throw nullref(s.line);
        const n = c instanceof Arr ? c.d.length : c.length;
        for (let i = 0; i < n; i++) {
          let v = c instanceof Arr ? c.d[i] : c.charCodeAt(i);
          if (s.et !== s.vt) v = castVal(v, s.et, s.vt);
          fr[s.d.id] = { v: this.cloneV(v) };
          const r = this.exec(s.body, fr);
          if (r === BRK) break; if (r === RET) return r;
          this.tick(s.line);
        }
        return;
      }
      case 'switch': {
        const v = this.ev(s.e, fr);
        let start = -1;
        for (let i = 0; i < s.sections.length && start < 0; i++) for (const lb of s.sections[i].labels) if (!lb.def && lb.v === v) { start = i; break; }
        if (start < 0) start = s.sections.findIndex((sec) => sec.labels.some((l) => l.def));
        if (start < 0) return;
        const r = this.execBlock(s.sections[start].body, fr);
        return r === BRK ? undefined : r;
      }
      case 'break': return BRK;
      case 'continue': return CNT;
      case 'return':
        if (s.e) fr.$rv = coerce(this.cloneV(this.ev(s.e, fr)), s.ty, fr.$ret);
        return RET;
      case 'throw': {
        if (!s.e) throw fr.$exc;
        const x = this.ev(s.e, fr);
        throw new CsExc(x.type, x.msg, s.line);
      }
      case 'try': {
        // NeedInput y Halt no son excepciones de C#: atraviesan sin ejecutar catch ni finally
        let res, pending = null;
        try { res = this.exec(s.body, fr); }
        catch (x) {
          if (!(x instanceof CsExc)) throw x;
          const c = s.catches.find((c) => excIs(x.type, c.ty));
          if (!c) pending = x;
          else {
            if (c.d) fr[c.d.id] = { v: new ExcVal(x.type, x.message) };
            const save = fr.$exc; fr.$exc = x;
            try { res = this.execBlock(c.body.body, fr); }
            catch (y) { if (!(y instanceof CsExc)) throw y; pending = y; }
            finally { fr.$exc = save; }
          }
        }
        if (s.fin) { const r = this.exec(s.fin, fr); if (r) return r; }
        if (pending) throw pending;
        return res;
      }
    }
    throw new Error('exec ' + s.k);
  }
  buildInit(init, ty, fr) {
    const r = rankOf(ty), et = elemOf(ty);
    if (r === 1) return new Arr(ty, [init.items.length], init.items.map((it) => coerce(this.cloneV(this.ev(it, fr)), it.vty, et)));
    const data = [];
    const walk = (node, depth) => { for (const it of node.items) { if (depth + 1 < r) walk(it, depth + 1); else data.push(coerce(this.cloneV(this.ev(it, fr)), it.vty, et)); } };
    walk(init, 0);
    return new Arr(ty, init.dims.slice(), data);
  }
  newArr(e, fr) {
    if (e.init) return this.buildInit(e.init, e.ty, fr);
    const dims = e.sizes.map((s) => { const n = this.ev(s, fr); if (n < 0) throw new CsExc('OverflowException', 'La operación aritmética ha provocado un desbordamiento (tamaño de array negativo: ' + n + ').', e.line); return n; });
    const total = dims.reduce((a, b) => a * b, 1);
    if (total > 5000000) throw new Halt('Array demasiado grande para el simulador (' + total + ' elementos).', e.line);
    const et = elemOf(e.ty), d = new Array(total);
    for (let i = 0; i < total; i++) d[i] = this.defVal(et);
    return new Arr(e.ty, dims, d);
  }
  // ---- expresiones ----
  ev(e, fr) {
    if (e.cv !== undefined) return e.cv;
    switch (e.k) {
      case 'lit': return e.v;
      case 'paren': return this.ev(e.e, fr);
      case 'name': {
        const c = e.ref.kind === 'static' ? this.G[e.ref.id] : fr[e.ref.id];
        if (c === undefined || c.v === UNSET) throw new CompileError("Uso de la variable local no asignada '" + e.name + "' (dale un valor antes de usarla)", e.line, 'CS0165');
        return c.v;
      }
      case 'member': {
        switch (e.mk) {
          case 'sfield': return this.G[e.ref.id].v;
          case 'conprop': return 0;
        }
        const o = this.ev(e.obj, fr);
        if (o === null || o === undefined) throw nullref(e.line);
        switch (e.mk) {
          case 'strlen': return o.length;
          case 'arrlen': return o.d.length;
          case 'rank': return o.dims.length;
          case 'sblen': return o.s.length;
          case 'excmsg': return o.msg;
          case 'field': return o.f[e.name];
        }
        throw new Error('member ' + e.mk);
      }
      case 'index': {
        const o = this.ev(e.obj, fr);
        if (o === null) throw nullref(e.line);
        if (e.ik === 'str' || e.ik === 'sb') {
          const s = e.ik === 'str' ? o : o.s, i = this.ev(e.idx[0], fr);
          if (i < 0 || i >= s.length) throw new CsExc(e.ik === 'str' ? 'IndexOutOfRangeException' : 'ArgumentOutOfRangeException', e.ik === 'str' ? MSG.idx + ' (posición ' + i + ' en un texto de ' + s.length + ' letras)' : 'El índice está fuera del intervalo.', e.line);
          return s.charCodeAt(i);
        }
        return o.d[o.pos(e.idx.map((x) => this.ev(x, fr)), e.line)];
      }
      case 'call': return this.call(e, fr);
      case 'newarr': return this.newArr(e, fr);
      case 'newobj': {
        const args = e.args.map((a) => this.ev(a, fr));
        switch (e.ty) {
          case 'StringBuilder': return new SB(args.length && e.args[0].ty === 'string' ? (args[0] || '') : '');
          case 'Random': return new Rnd(args.length ? args[0] : this.seed++);
          case 'string': if (e.mk === 'repeat') { if (args[1] < 0) throw argOOR('El recuento no puede ser negativo.', e.line); return String.fromCharCode(args[0]).repeat(args[1]); } return args[0].d.map((c) => String.fromCharCode(c)).join('');
        }
        if (e.mk === 'exc') return new ExcVal(e.ty, args.length ? args[0] : "Se produjo una excepción de tipo '" + e.ty + "'.");
        return this.defVal(e.ty);
      }
      case 'cast': return castVal(this.ev(e.e, fr), e.from, e.ty);
      case 'un': {
        const v = this.ev(e.e, fr);
        if (e.op === '!') return !v;
        if (e.op === '-') return e.ty === 'int' ? (-v) | 0 : (e.ty === 'float' ? Math.fround(-v) : -v);
        if (e.op === '~') return e.ty === 'int' ? ~v : -v - 1;
        return v;
      }
      case 'inc': {
        const ref = this.lref(e.e, fr);
        const old = ref.get();
        if (old === UNSET) throw new CompileError("Uso de la variable local no asignada '" + (e.e.name || '') + "'", e.line, 'CS0165');
        let nv = e.op === '++' ? old + 1 : old - 1;
        nv = wrapTo(nv, e.ty);
        ref.set(nv);
        return e.pre ? nv : old;
      }
      case 'bin': {
        if (e.op === '&&') return this.ev(e.l, fr) && this.ev(e.r, fr);
        if (e.op === '||') return this.ev(e.l, fr) || this.ev(e.r, fr);
        return binOp(e, this.ev(e.l, fr), this.ev(e.r, fr));
      }
      case 'cond': return this.ev(e.c, fr) ? coerce(this.ev(e.a, fr), e.ta, e.ty) : coerce(this.ev(e.b, fr), e.tb, e.ty);
      case 'assign': {
        if (e.target.k === 'member' && e.target.mk === 'conprop') { this.ev(e.value, fr); return 0; }
        const ref = this.lref(e.target, fr);
        let nv;
        if (e.op === '=') nv = coerce(this.cloneV(this.ev(e.value, fr)), e.vt, e.ty);
        else {
          const old = ref.get();
          if (old === UNSET) throw new CompileError("Uso de la variable local no asignada '" + (e.target.name || '') + "'", e.line, 'CS0165');
          const v = this.ev(e.value, fr);
          if (e.concat) nv = str(old, 'string') + str(v, e.vt);
          else {
            nv = arith(e.op.slice(0, -1), old, v, e.opTy, e.line);
            nv = e.castBack ? castVal(nv, e.rt, e.ty) : coerce(nv, e.rt, e.ty);
          }
        }
        ref.set(nv);
        return nv;
      }
    }
    throw new Error('ev ' + e.k);
  }
  lref(e, fr) {
    while (e.k === 'paren') e = e.e;
    const rt = this;
    switch (e.k) {
      case 'name': {
        const c = e.ref.kind === 'static' ? this.G[e.ref.id] : fr[e.ref.id];
        return { get: () => c.v, set: (v) => { c.v = v; }, cell: c };
      }
      case 'index': {
        const o = this.ev(e.obj, fr);
        if (o === null) throw nullref(e.line);
        if (e.ik === 'sb') {
          const i = this.ev(e.idx[0], fr);
          if (i < 0 || i >= o.s.length) throw argOOR('El índice está fuera del intervalo.', e.line);
          return { get: () => o.s.charCodeAt(i), set: (v) => { o.s = o.s.slice(0, i) + String.fromCharCode(v) + o.s.slice(i + 1); } };
        }
        const p = o.pos(e.idx.map((x) => this.ev(x, fr)), e.line);
        return { get: () => o.d[p], set: (v) => { o.d[p] = v; } };
      }
      case 'member': {
        if (e.mk === 'sfield') { const c = this.G[e.ref.id]; return { get: () => c.v, set: (v) => { c.v = v; }, cell: c }; }
        const o = this.ev(e.obj, fr);
        if (o === null) throw nullref(e.line);
        if (e.mk === 'sblen') return { get: () => o.s.length, set: (v) => { if (v < 0) throw argOOR('La longitud no puede ser negativa.', e.line); o.s = v <= o.s.length ? o.s.slice(0, v) : o.s + '\0'.repeat(v - o.s.length); } };
        return { get: () => o.f[e.name], set: (v) => { o.f[e.name] = v; } };
      }
    }
    throw new Error('lref ' + e.k);
  }
  call(e, fr) {
    if (e.um) return this.callUser(e.um, e.args, fr, e.line);
    const b = BUILTINS[e.bk];
    const cal = e.callee;
    let self = null;
    if (!e.ot.startsWith('type:')) {
      self = this.ev(cal.obj, fr);
      if (self === null || self === undefined) throw nullref(e.line);
    }
    const cells = [];
    const args = e.args.map((a, i) => {
      if (a.k === 'refarg') { const r = this.lref(a.e, fr); cells[i] = { get v() { return r.get(); }, set v(x) { r.set(x); } }; return a.mod === 'out' ? undefined : r.get(); }
      return this.ev(a, fr);
    });
    const ctx = { rt: this, line: e.line, self, selfTy: e.ot };
    const r = b.run.call(ctx, args, e.ats, cells);
    return r;
  }
  callUser(m, argNodes, fr, line) {
    const nf = Object.create(null);
    m.params.forEach((p, i) => {
      const a = argNodes[i];
      if (p.mod) {
        const r = this.lref(a.e, fr);
        nf[p.id] = r.cell || { get v() { return r.get(); }, set v(x) { r.set(x); } };
      } else nf[p.id] = { v: coerce(this.cloneV(this.ev(a, fr)), a.ty, p.ty) };
    });
    nf.$ret = m.ret;
    if (++this.depth > MAX_DEPTH) throw new Halt('Demasiadas llamadas anidadas (¿un método que se llama a sí mismo sin parar?). Desbordamiento de la pila.', line);
    const r = this.execBlock(m.body.body, nf);
    this.depth--;
    if (m.ret !== 'void') return nf.$rv;
    return undefined;
  }
}
function wrapTo(v, t) {
  switch (t) {
    case 'int': return v | 0; case 'short': return (v << 16) >> 16; case 'byte': return v & 255; case 'char': return v & 0xFFFF;
    case 'float': return Math.fround(v);
  }
  return v;
}
function excIs(type, want) {
  if (want === 'Exception') return true;
  for (let t = type; t; t = EXC_PARENT[t]) if (t === want) return true;
  return false;
}

// ---------- punto de entrada ----------
const cache = { src: null, P: null, err: null };
function compileCached(src) {
  if (cache.src !== src) {
    cache.src = src; cache.P = null; cache.err = null;
    try { cache.P = compile(src); } catch (x) { if (x instanceof CompileError) cache.err = x; else { cache.err = new CompileError('Error interno del simulador al analizar: ' + x.message, 1, 'SIM'); } }
  }
  return cache;
}
// Ejecuta el programa desde el principio con las líneas de entrada dadas.
// status: 'done' | 'input' (espera otra línea) | 'compile' | 'exception' | 'halt'
function run(src, inputs, seed) {
  const c = compileCached(src);
  if (c.err) return { status: 'compile', segs: [], error: c.err.message, line: c.err.line, code: c.err.code };
  const P = c.P, rt = new Runtime(P, inputs || [], seed);
  try {
    for (const d of P.statics) rt.G[d.id] = { v: d.isConst ? d.cv : rt.defVal(d.ty) };
    for (const d of P.statics) if (d.init && !d.isConst) {
      rt.G[d.id].v = d.init.k === 'arrinit' ? rt.buildInit(d.init, d.ty, {}) : coerce(rt.cloneV(rt.ev(d.init, {})), d.init.ty, d.ty);
    }
    const fr = Object.create(null);
    if (P.main.params.length === 1) fr[P.main.params[0].id] = { v: new Arr('string[]', [0], []) };
    fr.$ret = P.main.ret;
    rt.execBlock(P.main.body.body, fr);
    return { status: 'done', segs: rt.segs, steps: rt.steps };
  } catch (x) {
    if (x instanceof NeedInput) return { status: 'input', segs: rt.segs };
    if (x instanceof CsExc) return { status: 'exception', segs: rt.segs, error: 'Excepción no controlada: System.' + x.type + ': ' + x.message, line: x.line };
    if (x instanceof Halt) return { status: 'halt', segs: rt.segs, error: x.message, line: x.line };
    if (x instanceof CompileError) return { status: 'exception', segs: rt.segs, error: x.message, line: x.line };
    if (x instanceof RangeError) return { status: 'halt', segs: rt.segs, error: 'Desbordamiento de la pila (¿un método que se llama a sí mismo sin parar?).', line: rt.line };
    return { status: 'halt', segs: rt.segs, error: 'Error interno del simulador: ' + x.message, line: rt.line };
  }
}
root.CSharp = { run: run, compile: compile, version: '1' };
}
CSharpFactory(window);
