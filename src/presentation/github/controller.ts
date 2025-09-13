// =============================================
// 🎮 CONTROLADOR PRINCIPAL DE WEBHOOKS
// 📁 controllers/github.controller.ts
// =============================================
/*
📘 RESPONSABILIDADES DEL CONTROLADOR:
- Recibir y procesar webhooks de GitHub
- Determinar el tipo de evento usando headers
- Delegar procesamiento a GitHubService según el evento
- Coordinar notificaciones con DiscordService
- Manejar respuestas HTTP apropiadas
- Logging de eventos para debugging

🔄 FLUJO DE PROCESAMIENTO:
1. Extraer tipo de evento de headers de GitHub
2. Obtener payload JSON del request body
3. Switch statement para manejar diferentes eventos
4. Generar mensaje personalizado para cada evento
5. Enviar notificación a Discord
6. Responder a GitHub con status code apropiado
*/

import { Request, Response } from "express";
import { GitHubService } from "../services/github.service";
import { DiscordService } from "../services/discord.service";

export class GitHubController {
  
  // =============================================
  // 🏗️ INYECCIÓN DE DEPENDENCIAS
  // =============================================
  constructor(
    private readonly githubService = new GitHubService(),
    // 👉 Servicio que procesa eventos específicos de GitHub
    //    Contiene la lógica de negocio para cada tipo de evento
    
    private readonly discordService = new DiscordService(),
    // 👉 Servicio que maneja notificaciones a Discord
    //    Abstrae la comunicación con Discord webhook API
  ) {}

  // =============================================
  // 🎯 HANDLER PRINCIPAL DE WEBHOOKS
  // =============================================
  webHookHandler = (req: Request, res: Response) => {
    /*
    📘 ESTRUCTURA DEL REQUEST DE GITHUB:
    - Headers: contiene 'x-github-event' con el tipo de evento
    - Body: payload JSON con todos los datos del evento
    - Signature: validada previamente por el middleware
    
    🎯 EVENTOS SOPORTADOS:
    - 'star': usuario da/quita estrella al repositorio
    - 'issues': se abre/cierra/modifica un issue
    - Extensible para: 'push', 'pull_request', 'release', etc.
    */
    
    // 🏷️ Extraer tipo de evento de headers de GitHub
    const githubEvent = req.header("x-github-event") ?? "unknown";
    // 👉 GitHub siempre envía este header indicando el tipo de evento
    //    Fallback a "unknown" si por alguna razón no existe

    // 📦 Obtener payload completo del evento
    const payload = req.body;
    // 👉 Express ya parseó el JSON gracias al middleware json()
    //    Contiene toda la información del evento (user, repo, action, etc.)
    
    let message: string;
    // 👉 Variable que contendrá el mensaje final para Discord

    // =============================================
    // 🔄 PROCESAMIENTO SEGÚN TIPO DE EVENTO
    // =============================================
    switch (githubEvent) {
      
      // ⭐ EVENTO: Usuario da/quita estrella
      case "star":
        message = this.githubService.onStar(payload);
        // 👉 Procesa eventos de estrella (starred/unstarred)
        //    Genera mensaje: "User X starred/unstarred repository Y"
        break;

      // 🐛 EVENTO: Issues (abrir/cerrar/modificar)
      case "issues":
        message = this.githubService.onIssue(payload);
        // 👉 Procesa eventos de issues (opened/closed/reopened)
        //    Genera mensaje con título del issue y acción realizada
        break;

      // 🔧 EVENTOS NO IMPLEMENTADOS
      default:
        message = `Unknown event ${githubEvent}`;
        // 👉 Fallback para eventos no soportados aún
        //    Útil para debugging y saber qué eventos llegan
        /*
        📘 EVENTOS ADICIONALES QUE PODRÍAS IMPLEMENTAR:
        case "push":
          message = this.githubService.onPush(payload);
          break;
        case "pull_request":
          message = this.githubService.onPullRequest(payload);
          break;
        case "release":
          message = this.githubService.onRelease(payload);
          break;
        case "fork":
          message = this.githubService.onFork(payload);
          break;
        */
    }

    // =============================================
    // 📢 NOTIFICACIÓN A DISCORD
    // =============================================
    this.discordService.notify(message)
      .then(() => res.status(202).send('Accepted'))
      // ✅ Status 202: Accepted - GitHub recomienda este código
      //    Indica que el webhook fue recibido y se está procesando
      
      .catch(() => res.status(500).json({ error: 'internal server error'}))
      // ❌ Status 500: Error interno si Discord falla
      //    GitHub reintentará el webhook automáticamente
    
    /*
    📘 SOBRE LOS STATUS CODES:
    - 202 Accepted: Webhook recibido correctamente
    - 500 Internal Error: GitHub reintentará automáticamente
    - 401 Unauthorized: Firma inválida (manejado por middleware)
    - 400 Bad Request: Payload malformado
    
    🔄 GITHUB RETRY LOGIC:
    - Si respondes con 5xx, GitHub reintentará hasta 3 veces
    - Usa exponential backoff entre reintentos
    - Después de 3 fallos, marca el webhook como fallido
    */

    // 📝 Log local para debugging y monitoreo
    console.log(message)
    // 👉 Útil para debugging y ver qué eventos se procesan
    //    En producción, usar un logger más sofisticado
  };
}