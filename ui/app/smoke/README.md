# Smoke tests (e2e contra backend real)

Recorridos básicos de la app contra **endpoints reales** (sin mocks), para detectar
regresiones en los flujos felices.

- Config: `playwright.smoke.config.ts` (separada de la suite mockeada).
- Tests: `smoke/*.smoke.spec.ts`.
- Helpers de flujo: `smoke/utils/flows.ts`. Cleanup por API: `smoke/utils/cleanup.ts`.

## Variables

| Variable | Default | Qué controla |
|---|---|---|
| `PWA_PRO_URL` | `http://localhost:5173` | URL del front a testar. En local arranca `start:integrated` (API en `:4000`). Apúntala a un deploy para testar otro entorno. |
| `SMOKE_API_URL` | `http://localhost:4000` | API real usada por el cleanup (DELETE de lo creado). |
| `SMOKE_RUN_ID` | `Date.now()` | Sufijo único de los nombres creados. |

## Uso

1. **Capturar la sesión real (una vez)** — abre un navegador headed, completa el
   login de Google y guarda `.auth/smoke-state.json` (gitignored):

   ```bash
   pnpm test:smoke:auth
   ```

   La app refresca el token sola vía la cookie `refresh_token`; solo hay que
   re-capturar cuando esa cookie expira.

2. **Ejecutar los smoke** (reutilizan el estado guardado):

   ```bash
   pnpm test:smoke
   # contra un deploy:
   PWA_PRO_URL=https://staging.app SMOKE_API_URL=https://staging-api pnpm test:smoke
   ```

Los datos creados (juez, perros, competición→stage→evento) se borran en `afterAll`
vía `DELETE /secured/competitions|dogs|judges/{id}` (la competición borra en
cascada sus stages y eventos).
