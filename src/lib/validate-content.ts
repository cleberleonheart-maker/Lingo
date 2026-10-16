import { COURSES } from '@/constants/content';
import type { Exercise } from '@/constants/content';
import type { LanguageId } from '@/constants/languages';

/**
 * Validador de conteúdo: checa o que o typecheck não pega (opção certa dentro do
 * próprio enunciado, `fill` com resposta vazia, `translate` com `from` no idioma
 * alvo, coluna de `match` repetida, banco menor que a sessão, ids duplicados e
 * caractere de outro alfabeto). As regras nasceram dos bugs de 2026-09-29.
 *
 * Devolve a lista de problemas; vazia quando está tudo certo.
 */
export function findContentProblems(): string[] {
  const problems: string[] = [];
  const err = (file: string, where: string, msg: string) =>
    problems.push(`[${file}] ${where}: ${msg}`);

  const norm = (s: string) =>
    String(s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  // hiragana/katakana/CJK/hangul/cirilico/grego/arabe
  const nonLatin = /[\u3040-\u30ff\u4e00-\u9fff\uac00-\ud7af\u0400-\u04ff\u0370-\u03ff\u0600-\u06ff]/g;
  const jaScript = /[\u3040-\u30ff\u4e00-\u9fff]/;

  function checkAnswerEmpty(ex: Exercise, where: string, file: string) {
    if (ex.kind === 'fill' && !String(ex.answer || '').trim())
      err(file, where, `fill com answer vazio`);
    if (ex.kind === 'fill' && (!ex.accept || ex.accept.length === 0))
      err(file, where, `fill sem accept`);
    if (ex.kind === 'translate' && (!ex.accept || ex.accept.length === 0))
      err(file, where, `translate sem accept`);
    if (ex.kind === 'listen' && (!ex.accept || ex.accept.length === 0))
      err(file, where, `listen sem accept`);
  }

  function checkChoice(ex: Exercise & { kind: 'choice' }, where: string, file: string) {
    if (!ex.prompt || !ex.options || !ex.options.length) {
      err(file, where, 'choice incompleto');
      return;
    }
    const right = ex.options.find((o) => o.id === ex.answer);
    if (!right) {
      err(file, where, `choice: answer "${ex.answer}" não existe nas opções`);
      return;
    }
    if (norm(ex.prompt).includes(norm(right.text)) && norm(right.text).length >= 3)
      err(file, where, `prompt contém a resposta correta ("${right.text}")`);
  }

  function checkTranslate(ex: Exercise & { kind: 'translate' }, where: string, file: string) {
    if (!ex.from || !String(ex.from).trim()) {
      err(file, where, 'translate sem from');
      return;
    }
    const from = norm(ex.from);
    const match = (ex.accept || []).some((a) => {
      const na = norm(a);
      return na === from || (from.includes(na) && na.length >= 4);
    });
    if (match) {
      if (file === 'ja' && ex.label) return; // de propósito, com label de romaji
      err(file, where, `from ("${ex.from}") está no idioma alvo (bate com accept)`);
    }
  }

  function checkMatch(ex: Exercise & { kind: 'match' }, where: string, file: string) {
    const lefts = ex.pairs.map((p) => norm(p.left));
    const rights = ex.pairs.map((p) => norm(p.right));
    if (new Set(lefts).size !== lefts.length) err(file, where, `match: coluna esquerda repetida`);
    if (new Set(rights).size !== rights.length) err(file, where, `match: coluna direita repetida`);
  }

  function checkAlphabet(ex: Exercise, where: string, file: string) {
    const texts: Array<[string, string]> = [];
    if (ex.kind === 'choice') {
      texts.push(['prompt', ex.prompt]);
      ex.options.forEach((o) => texts.push(['option', o.text]));
    }
    if (ex.kind === 'translate') {
      texts.push(['from', ex.from]);
      texts.push(['accept', ex.accept.join(' ')]);
    }
    if (ex.kind === 'fill') texts.push(['before/after', ex.before + ex.after + ex.answer]);
    if (ex.kind === 'listen') texts.push(['speak', ex.speak]);
    if (ex.kind === 'match')
      texts.push(['pairs', ex.pairs.map((p) => p.left + ' ' + p.right).join(' ')]);
    for (const [label, t] of texts) {
      const bad = String(t).match(nonLatin) || [];
      if (bad.length && file !== 'ja')
        err(file, where, `${label} contém caractere de outro alfabeto "${[...new Set(bad)].join('')}"`);
      if (file === 'ja' && bad.length && !jaScript.test(String(t)))
        err(file, where, `${label} com alfabeto inesperado`);
    }
  }

  function checkPortuguese(text: string, where: string, file: string) {
    // "se favor" não existe em pt-BR: é o "se" do espanhol/italiano vazando.
    if (/\bse favor\b/i.test(String(text)))
      err(file, where, `texto em português suspeito ("${text}")`);
  }

  function checkEx(ex: Exercise, where: string, file: string) {
    checkAnswerEmpty(ex, where, file);
    if (ex.kind === 'choice') checkChoice(ex, where, file);
    if (ex.kind === 'translate') checkTranslate(ex, where, file);
    if (ex.kind === 'match') checkMatch(ex, where, file);
    checkAlphabet(ex, where, file);
    // lado em português: enunciado de choice, `from` de translate e a coluna
    // direita de match (a esquerda é o idioma estudado).
    const ptStrings: string[] = [];
    if (ex.kind === 'choice') ptStrings.push(ex.prompt);
    if (ex.kind === 'translate') ptStrings.push(ex.from);
    if (ex.kind === 'match') ex.pairs.forEach((p) => ptStrings.push(p.right));
    ptStrings.forEach((t) => checkPortuguese(t, where, file));
  }

  for (const file of Object.keys(COURSES) as LanguageId[]) {
    const course = COURSES[file];
    if (!course) {
      problems.push(`[${file}] curso ausente`);
      continue;
    }
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        const where = `${lesson.id}`;
        const ids = [...lesson.exercises, ...(lesson.pool || [])].map((e) => e.id);
        if (new Set(ids).size !== ids.length) err(file, where, 'ids duplicados');
        if (lesson.pool) {
          if ((lesson.perSession ?? 8) > lesson.pool.length)
            err(file, where, `perSession (${lesson.perSession}) > pool (${lesson.pool.length})`);
          lesson.pool.forEach((e, i) => checkEx(e, `${where} pool[${i}]`, file));
        }
        lesson.exercises.forEach((e, i) => checkEx(e, `${where} ex[${i}]`, file));
      }
      if (unit.exam) {
        unit.exam.exercises.forEach((e, i) =>
          checkEx(e, `exam ${unit.exam.id} ex[${i}]`, file)
        );
      }
    }
  }

  return problems;
}
