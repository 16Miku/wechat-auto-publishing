# Skill Completo de Publicación Automática en Cuentas Oficiales de WeChat

Transforma el flujo de «Preparación del entorno → Organización de información → Redacción → Imágenes → **Borrador** → **Notificación/Aprobación** → **Publicación oficial** → Archivado → Programación» en un flujo de trabajo reproducible.

## Producción por Defecto (Servidor / OpenClaw)

```text
Redacción + Imágenes
  → API de WeChat solo envía a borradores (media_id)
  → Feishu 「Pendiente de publicación · Borrador recibido」+ https://mp.weixin.qq.com/
  → El administrador hace clic en 「Publicar」 en el panel de control
```

**Configuración**: `PUBLISH_CHANNEL=api` + `PUBLISH_MODE=draft_notify_feishu`  

**Razón**: `freepublish` suele presentar problemas como «contenido buscable pero comportamiento anómalo en páginas/listas»; el costo de iniciar sesión en WeChat mediante modo headless en Linux es elevado.  
**Documentación**: `references/draft-notify-feishu.md`  
**Scripts**: `templates/feishu-draft-ready.example.sh` / `.ps1`

## Doble Canal (Aún disponible)

| Canal | Nombre | Cuándo usar |
|------|------|--------|
| **A** | API de Plataforma Abierta de WeChat | Borradores, programación, servidor |
| **B** | Navegador local vía Chrome DevTools | Automatización hasta el escaneo de QR en Windows |

| Modo | Descripción |
|------|------|---|
| **draft_notify_feishu** | API Borrador + Tarea de Feishu + **Publicación manual** (Default servidor) |
| draft_only | Solo borrador |
| browser_full | Publicación vía navegador local + **Código de verificación** opcional vía Feishu |
| api_freepublish | Experimental; acepta riesgos de visibilidad |

## Dos tipos de mensajes de Feishu

| Tipo | Momento | Documentación/Plantilla |
|------|------|-----------|
| Borrador listo | Tras obtener el media_id | `draft-notify-feishu.md` / `feishu-draft-ready.example.*` |
| Código de verificación | «Verificación de WeChat» en Browser | `feishu-qr-notify.md` / `feishu-qr-notify.example.*` |

## Accesos Detallados

- Agent: `SKILL.md`  
- Operador: `runbook.md`  
- Vista general de publicación: `references/publishing.md`  
- Resumen de prácticas reales: `references/session-practices.md`  
- Multi-cuenta: `references/multi-account.md`  
- Browser: `references/browser-chrome-publish.md`  

## Estructura del Directorio

```text
wechat-auto-publishing-complete/
├─ SKILL.md / runbook.md / README.md
├─ references/
│  ├─ draft-notify-feishu.md      ← Modo predeterminado de servidor
│  ├─ publishing.md
│  ├─ browser-chrome-publish.md
│  ├─ feishu-qr-notify.md
│  ├─ multi-account.md
│  ├─ session-practices.md
│  └─ …
└─ templates/
   ├─ feishu-draft-ready.example.sh / .ps1
   ├─ feishu-qr-notify.example.sh / .ps1
   ├─ publish.mjs
   ├─ env.example.txt
   └─ …
```

## Inicio Rápido (OpenClaw / Linux)

1. Configurar `WECHAT_*` + `FEISHU_NOTIFY_OPEN_ID` + `PUBLISH_MODE=draft_notify_feishu`  
2. Actualización diaria: Generar paquete → API draft → Notificación `feishu-draft-ready`  
3. El administrador sigue los tres pasos de Feishu para publicar en el panel de control de mp  
4. Archivar con `status=draft_ready_notified`  

## Puntos Clave de Implementación

1. Servidor: **No** usar freepublish por defecto; **No** usar Xvfb para iniciar sesión en WeChat y publicar directamente  
2. Usar enlaces estables de la página de inicio para Feishu; evitar enlaces profundos (deep links) basados en tokens  
3. Limpiar el proxy antes de enviar a Feishu; usar rutas relativas para `--image`  
4. Browser: Doble ProseMirror, seleccionar la portada desde el cuerpo del texto, verificar el autor al cambiar de cuenta  

## Declaración de Seguridad

Este Skill solo contiene flujos, plantillas y configuraciones de marcador de posición; no incluye credenciales reales ni sesiones.
