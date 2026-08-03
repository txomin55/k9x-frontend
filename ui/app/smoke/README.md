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
| `SMOKE_RUN_ID` | `MMDD-HHMMSS` | Sufijo único de los nombres creados. |
| `SMOKE_GOOGLE_EMAIL` / `SMOKE_GOOGLE_PASSWORD` | — | Credenciales para el auto-login (alternativa al fichero). |
| `SMOKE_CREDENTIALS_FILE` | `.auth/credentials.json` | Ruta del fichero `{ "email", "password" }`. |

## Uso

1. **Capturar la sesión real (una vez)** — abre un navegador headed y guarda
   `.auth/smoke-state.json` (gitignored):

   ```bash
   pnpm test:smoke:auth
   ```

   - Si ya existe un `smoke-state.json` válido, **lo reutiliza** y no vuelve a loguear.
   - Si no, hace el **login de Google automáticamente** con las credenciales de
     `.auth/credentials.json` (`{ "email": ..., "password": ... }`, gitignored) o de
     las env `SMOKE_GOOGLE_EMAIL` / `SMOKE_GOOGLE_PASSWORD`.
   - Si el auto-login falla (captcha, 2FA, Google bloquea el navegador), cae al
     **login manual**: complétalo a mano en el navegador headed (hasta 240s).

   La cuenta de test **no debe tener 2FA** (Google bloquea el login automatizado con 2FA).
   La app refresca el token sola vía la cookie `refresh_token`; solo hay que
   re-capturar cuando esa cookie expira.

2. **Ejecutar los smoke** (reutilizan el estado guardado):

   ```bash
   pnpm test:smoke
   # contra un deploy:
   PWA_PRO_URL=https://staging.app SMOKE_API_URL=https://staging-api pnpm test:smoke
   ```

Todo lo creado (jueces, perros, competiciones, stages, eventos) se nombra con el
prefijo `--SMOKE--` más un contador y el `RUN_ID` (p. ej. `--SMOKE-- Judge 1 (0803-142530)`),
así que cualquier resto es identificable a simple vista. La competición se crea
con nombre por defecto y se renombra justo después.

Los datos creados (juez, perros, competición→stage→evento) se borran en `afterAll`
vía `DELETE /secured/competitions|dogs|judges/{id}` (la competición borra en
cascada sus stages y eventos).

Las journeys `scoring` y `visitor` dejan su competición en estado `STARTED`
(normalmente no borrable, 412). El backend hace una excepción para los datos de
smoke: una competición cuyo nombre empieza por `--SMOKE--` **y** cuyo creador es
`k9x.support@gmail.com` se puede borrar en cualquier estado, así que el cleanup
lo elimina todo. Contra un backend sin esa excepción, esas competiciones
puntuadas quedan sin borrar.
