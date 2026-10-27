# Contribuindo com o MeuMercado

Obrigado pelo interesse! 💚

## Fluxo

1. Faça um fork e crie uma branch: `git checkout -b feat/minha-melhoria`.
2. `npm install` e `npm run dev`.
3. Antes do PR, rode:
   ```bash
   npm run typecheck
   npm test
   npm run build
   npm run test:e2e   # requer `npx playwright install chromium`
   ```
4. Use mensagens de commit no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/) (`feat:`, `fix:`, `docs:`...).
5. Abra o Pull Request descrevendo o problema e a solução (com screenshots para mudanças visuais).

## Diretrizes

- Vue 3 + `<script setup lang="ts">`, TypeScript strict, sem `any`.
- Lógica de negócio em `stores/`, `services/` e `composables/` — não nos componentes.
- Mobile-first, área de toque ≥ 44px, acessível por teclado, contraste WCAG AA.
- Nada de backend, serviços pagos, tokens ou segredos.
- Adicionou produto ao catálogo? Veja a seção "Como adicionar produtos" no README.

## Reportando bugs

Abra uma issue com passos para reproduzir, navegador/aparelho e comportamento esperado.
