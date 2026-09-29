# Lingo — estado em 2026-09-29

Vertical slice estilo Duolingo, montada do zero sobre o template do Expo.

## O que existe

**Avatar (`src/components/avatar.tsx`)** — reescrito na técnica do TAMI
(`/root/tami/index.html:291-325`): `View` + `LinearGradient` em vez de SVG com path
desenhado à mão. A piscada encolhe o próprio olho com `scaleY`, então não existe
pálpebra para alinhar — que era exatamente o bug do rework no Pulsa.

**Um avatar por idioma** (`src/constants/languages.ts`) — 6 idiomas, cada um com
esfera, adereço (emoji) e bochecha próprios:

| idioma | esfera | adereço |
|---|---|---|
| en | rosa → violeta | 🎀 |
| es | azul claro | 🧢 |
| fr | creme → vermelho | 🎩 |
| de | azul → lima | 🎓 |
| it | turquesa | 🍕 |
| ja | rosa → vinho | 🌸 |

**Conteúdo (`src/constants/content.ts`)** — só inglês tem lição: 1 unidade,
3 lições + 1 prova, 5 tipos de exercício (`choice`, `translate`, `fill`,
`match`, `listen`). Os outros 5 idiomas têm o array vazio de propósito — a tela
mostra "em breve" em vez de quebrar.

**Progresso (`src/lib/progress.ts`)** — AsyncStorage, com streak e
`streakBest`. `touchStudy` só avança o streak se for o dia seguinte.

**Telas** — `(tabs)/index` é o mapa, `(tabs)/languages` a lista de idiomas,
`lesson/[id]` e `exam/[id]` rodam o `ExercisePlayer`, `result` mostra o placar.
O `_layout` virou `Stack` porque as tabs prendiam as telas de exercício.

**`ExercisePlayer`** — barra de progresso, um exercício por vez, feedback
imediato (verde/vermelho + resposta certa), botão "Continuar" que só aparece
depois de responder. `listen` fala sozinho ao entrar (via `expo-speech`).
`match` é pareamento de verdade: toca na esquerda, depois na direita.

## Pendências

- **Nada foi testado em runtime.** `expo export` e `expo start` morrem os dois
  sem mensagem de erro, sempre logo depois de "Starting Metro Bundler" /
  "Waiting on http://localhost:8081", sem deixar porta em LISTEN e sem processo
  Node vivo. Tentado em 2026-09-29:
  - `expo export --platform web` — 3x, morre em ~9 min
  - `expo start --web --port 8081` — 2x, morre logo após announce
  - `EXPO_NO_DEVTOOLS=1` — o DevTools (Electron) falha como root, o Metro ainda
    assim morre junto
  - Com e sem `--clear`, com `--max-old-space-size=4096`
  - 4ª tentativa em 2026-09-29 13:48, na porta 8082, com 2.0 GB livres

  **A memória não é a causa.** A última tentativa morreu com 2 GB disponíveis,
  e o processo some logo depois de "Starting Metro Bundler" — sem stack trace,
  sem porta em LISTEN, sem processo Node vivo. Nenhuma das 4-Saharan deu pista
  além disso. O DevTools (Electron) falha como root, mas desativá-lo não resolve
  porque o Metro morre do mesmo jeito. Hipóteses restantes: incompatibilidade
  do binário do Metro com este proot/aarch64, ou o watchdog de memória do
  proot. **Não é bug do código** — nenhum erro de código apareceu em nenhum log.

  **Isto não é bug do código:** o typecheck passa limpo e os três pacotes estão
  instalados. Mas isso também não prova que o app abre — só prova que os tipos
  batem. Precisa rodar `npx expo start` numa máquina folgada antes de confiar.

  Antes de qualquer build, checar:
  1. `free -m` (quer ~2 GB livres)
  2. `npx tsc --noEmit` (erro de tipo sai aqui)
  3. `ls node_modules/<pacote>` (instalação pode dar timeout e gravar pela
     metade)
  4. só então buildar — e se falhar, **não repetir igual**: ler o log
- Os 5 idiomas além do inglês não têm conteúdo escrito.
- Faltam coração, os states `.playing`/`.sleep` e a recompensa daily do Duolingo.
- O `avatar.tsx` antigo (SVG) foi substituído; o `react-native-svg` continua
  instalado e sem uso.
- `package-lock.json` nunca foi revisado (é novo, fora do `.gitignore`).

## Bug já corrigido no caminho

`react-native-safe-area-context` estava instalado sem os tipos
(`lib/typescript/` faltando), o que dava erro de TS7016 em toda tela que
importava `useSafeAreaInsets`. Reinstalado.

Também criei `expo-env.d.ts` declarando `*.module.css` e `*.css`, que elimina
os 2 últimos erros do template. **Typecheck do projeto inteiro passa limpo
pela primeira vez.**
