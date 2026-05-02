# Guía de contribución — vertiche-dashboard

## Reglas de oro

1. **Nadie hace push directo a `main`.** Siempre abrir un PR.
2. **Cada equipo solo toca su carpeta.** Ver ownership abajo.
3. **El líder de equipo es el único que aprueba y mergea** el PR de su equipo.
4. **Si necesitas algo de `src/shared/`**, abrir un issue y coordinar con el lead antes de modificar.

---

## Ownership por carpeta

| Carpeta | Equipo | Quién aprueba PRs |
|---------|--------|-------------------|
| `src/features/rfid/` | Equipo RFID | Líder RFID |
| `src/features/ventas/` | Equipo Ventas | Líder Ventas |
| `src/features/monitoreo/` | Equipo Monitoreo | Líder Monitoreo |
| `src/shared/` | Lead / Owner | Lead |
| `src/App.jsx`, `src/main.jsx` | Lead / Owner | Lead |

---

## Flujo de trabajo

```
1. Crea tu rama desde main:
   git checkout main && git pull
   git checkout -b rfid/nombre-del-cambio
   (o ventas/..., o monitoreo/...)

2. Haz tus cambios solo dentro de tu carpeta features/<equipo>/

3. Verifica localmente antes de subir:
   npm run build   # debe compilar sin errores
   npm test        # los tests deben pasar

4. Abre un Pull Request a main en GitHub
   - Usa el template de PR (se carga automáticamente)
   - Asigna a tu líder como reviewer

5. Tu líder revisa y aprueba
   - GitHub solo permite mergear si el CODEOWNER aprobó
   - No merges sin aprobación

6. Líder mergea a main
```

---

## Configuración de GitHub (una sola vez, lo hace el lead)

En **Settings → Branches → Add branch ruleset** para `main`:

- [x] Require a pull request before merging
- [x] Require approvals: **1**
- [x] Require review from Code Owners
- [x] Do not allow bypassing the above settings

---

## Preguntas frecuentes

**¿Puedo importar componentes de otro equipo?**
No directamente. Si necesitas funcionalidad de otro módulo, habla con ese equipo para moverlo a `src/shared/`.

**¿Qué hago si mi cambio rompe el build?**
No hagas push. Arregla el build localmente primero (`npm run build`). Si necesitas ayuda, contacta al lead.

**¿Puedo tocar `src/shared/`?**
Solo con aprobación del lead. Abre un issue primero explicando qué necesitas y por qué.
