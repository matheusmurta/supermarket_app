# 🛒 MeuMercado

> Planeje, organize, salve e compartilhe a lista de compras do mês, sem login, sem servidor e funcionando offline.

MeuMercado é um Progressive Web App open source com um **catálogo de mais de 300 produtos comuns em supermercados brasileiros**. Você monta a compra do mês tocando nos itens, sem precisar digitar tudo de novo.

## O problema

Todo mês a lista se repete: arroz, feijão, café, leite, detergente... Digitar tudo no bloco de notas é lento, e listas de papel se perdem. O MeuMercado traz catálogo pronto, quantidades ajustáveis, marcação durante a compra, duplicação para o mês seguinte e compartilhamento pelo WhatsApp.

## ✨ Funcionalidades

- **Catálogo offline**: mais de 300 produtos em 20 categorias, busca instantânea que ignora acentos e maiúsculas, filtros, favoritos e itens frequentes.
- **Produtos personalizados**: criar, editar e excluir, com prevenção de duplicidade e consulta opcional ao Open Food Facts pelo código de barras.
- **Várias listas**: criar, renomear, excluir (com confirmação e desfazer), duplicar, arquivar ou reativar, definir como ativa, pesquisar e ordenar.
- **Lista modelo da casa** para começar cada mês já preenchido.
- **Modo supermercado**: itens agrupados por categoria, checkbox com animação, progresso, desfazer e ordenação por categoria, A–Z, pendentes ou manual (setas que funcionam com toque e teclado).
- **Unidades**: unidade, pacote, caixa, garrafa, L, mL, kg, g e dúzia. Aceita decimais (0,5 kg) e tamanho de embalagem separado ("2 pacotes de 5 kg").
- **Preços opcionais** informados por você, com cálculo do gasto estimado. O app não inventa preços.
- **Compartilhamento** pelo WhatsApp (`wa.me`), por cópia do texto ou pelo menu nativo (Web Share API).
- **Backup JSON** com validação de schema.
- **Tema** claro, escuro ou do sistema; respeita `prefers-reduced-motion` e as safe areas de aparelhos com notch.
- **PWA instalável**, com funcionamento offline e aviso de atualização.

## 📸 Screenshots

> _Ainda não há screenshots._ Execute `npm run dev` para ver o app. Contribuições com capturas reais são bem-vindas (`docs/screenshots/`).

## 🧰 Stack

Vue 3 · TypeScript strict · Vite · Tailwind CSS · Pinia · Vue Router · Lucide · VueUse · vite-plugin-pwa · Vitest · Vue Testing Library · Playwright.

## Pré-requisitos

Node.js 20 ou superior (testado com o 24) e npm 10 ou superior.

## Instalação

```bash
git clone <URL_DO_SEU_REPOSITORIO>   # placeholder: configure seu repositório
cd meumercado
npm install
npm run dev
```

> ⚠️ Projetos dentro do **OneDrive/Dropbox** podem ter o `node_modules` corrompido pela sincronização (arquivos ausentes). Se surgirem erros de módulo, mova o projeto para fora da pasta sincronizada e rode `npm ci`.

## Comandos

| Comando | Descrição |
|---|---|
| `npm run dev` | Desenvolvimento (`http://localhost:5173`) |
| `npm run typecheck` | Checagem de tipos (vue-tsc) |
| `npm test` | Testes unitários e de componentes |
| `npm run test:e2e` | Testes E2E (antes: `npx playwright install chromium`) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build em `http://localhost:4173` |
| `npm run icons` | Regenera os ícones do PWA |

## 🚀 Publicação gratuita

O build é estático e usa rotas com hash (`/#/listas`), então não precisa de configuração de rewrite.

- **Netlify/Vercel**: use o comando `npm run build` e publique a pasta `dist`.
- **GitHub Pages**: rode `BASE_PATH=/nome-do-repo/ npm run build` e publique `dist/` (por exemplo, com a action `actions/deploy-pages`).

## 📁 Estrutura

```text
src/
├── components/  layout/ · lists/ · products/ · ui/
├── composables/ useListActions (ações com toast e desfazer)
├── data/        categories.ts · products.ts · catalog/*.ts · sample.ts
├── models/      tipos de domínio
├── router/
├── services/    storage · catalog · sharing · backup · validators · openfoodfacts
├── stores/      catalog · lists · settings · toast · stats
├── styles/ · tests/ · views/
e2e/             testes Playwright
scripts/         gerador de ícones
```

## 💾 Armazenamento local

| Chave | Conteúdo |
|---|---|
| `meumercado:v1:lists` | Listas e itens |
| `meumercado:v1:custom-products` | Produtos personalizados |
| `meumercado:v1:custom-categories` | Categorias personalizadas |
| `meumercado:v1:favorites` | Favoritos |
| `meumercado:v1:settings` | Preferências |
| `meumercado:v1:active-list` | Lista ativa |

- Cada valor é salvo no formato `{ version, data }`, o que permite migrações de schema.
- Os dados são validados ao carregar. Se algo estiver corrompido, o app ignora o valor e guarda uma cópia em `<chave>:corrupted`.
- As gravações usam debounce, e o app salva imediatamente quando a página é ocultada ou fechada.
- Se o salvamento falhar (por exemplo, cota excedida), aparece um aviso em Configurações.
- O catálogo padrão vem de arquivos estáticos e não é salvo no `localStorage`.

> ⚠️ Limpar os dados do navegador **apaga suas listas**. Os dados **não são sincronizados entre aparelhos**. Exporte backups em Configurações.

## 💬 Compartilhamento pelo WhatsApp

O texto é gerado por categoria, com ☐/☑, quantidades, unidades, observações e um resumo no final. Ele abre pela URL oficial `https://wa.me/?text=` com `encodeURIComponent`, no celular ou no WhatsApp Web/Desktop. Em listas longas, o app mostra um aviso e oferece **Copiar** ou **Compartilhar** (Web Share API) para que nada seja cortado. Não há API paga nem colaboração em tempo real.

## ➕ Adicionar produtos ao catálogo

Edite o arquivo correspondente em `src/data/catalog/`:

```ts
['Nome do produto', 'kg', 1, '🍎', 'sinônimos separados por espaço'],
```

O ID é gerado a partir do nome (`p-nome-do-produto`). Não renomeie produtos existentes, porque o ID muda e favoritos e histórico deixam de corresponder. Os testes verificam se os IDs são únicos e se as categorias são válidas.

## 🏷️ Novas categorias

Você pode criar categorias pelo app, em **Configurações → Categorias personalizadas**, ou no código, editando `src/data/categories.ts`.

## 📶 Offline e limitações

- Depois do primeiro carregamento, o service worker (Workbox) guarda todos os recursos e o app funciona sem internet.
- Para instalar, use "Adicionar à tela inicial" (Safari no iOS) ou "Instalar app" (Chrome no Android).
- A consulta ao Open Food Facts é opcional e precisa de internet.

## 🖼️ Fontes e licenças de terceiros

- Ícones de interface: [Lucide](https://lucide.dev) (ISC).
- Ícones de produtos: emojis Unicode, exibidos pela fonte do sistema.
- [Open Food Facts](https://world.openfoodfacts.org) (opcional): dados sob ODbL e imagens sob CC BY-SA, com atribuição na interface.
- Os ícones do PWA são gerados pelo próprio projeto.

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](./CONTRIBUTING.md).

## 🗺️ Roadmap

- [ ] Leitura de código de barras pela câmera
- [ ] Arrastar e soltar na ordenação manual
- [ ] Histórico de preços informados pelo usuário
- [ ] Transferir lista entre aparelhos via arquivo/QR code

## 📄 Licença

[MIT](./LICENSE)
