
// =============================================
// 📢 SERVICIO DE NOTIFICACIONES DISCORD
// 📁 services/discord.service.ts
// =============================================
/*
📘 PROPÓSITO DEL SERVICIO:
- Abstraer la comunicación con Discord Webhook API
- Formatear mensajes para Discord
- Manejar errores de red y API
- Permitir personalización de mensajes (embeds, imágenes, etc.)

🌐 DISCORD WEBHOOK API:
- Permite enviar mensajes a canales sin bot
- Acepta texto plano y rich embeds
- Soporta menciones, emojis, y formatting
- Rate limiting: 5 requests/segundo por webhook
*/

import { envs } from "../../config/envs";

export class DiscordService {
  
  // =============================================
  // 🔗 CONFIGURACIÓN DEL WEBHOOK
  // =============================================
  private readonly discordWebhookUrl = envs.DISCORT_WEBHOOK_URL;
  // 👉 URL del webhook de Discord obtenida de variables de entorno
  //    Formato: https://discord.com/api/webhooks/ID/TOKEN
  //    Se crea desde Discord: Server Settings → Integrations → Webhooks

  constructor() {}

  // =============================================
  // 📤 MÉTODO PRINCIPAL DE NOTIFICACIÓN
  // =============================================
  async notify(message: string): Promise<boolean> {
    /*
    📘 ESTRUCTURA DEL MENSAJE A DISCORD:
    - content: mensaje de texto plano
    - embeds: mensajes enriquecidos (colores, imágenes, campos)
    - username: nombre personalizado del webhook
    - avatar_url: imagen de perfil personalizada
    */
    
    // 📦 Payload para Discord API
    const body = {
      content: message,
      // 👉 Mensaje de texto que aparecerá en el canal
      //    Soporta markdown: **bold**, *italic*, `code`, etc.
      
      /*
      🎨 EJEMPLO DE EMBEDS AVANZADOS:
      embeds: [
        {
          title: "GitHub Event",
          description: message,
          color: 0x00ff00,           // Color verde
          thumbnail: {
            url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
          },
          fields: [
            {
              name: "Repository",
              value: repository.full_name,
              inline: true
            },
            {
              name: "User",
              value: user.login,
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "GitHub Webhook",
            icon_url: "https://github.com/favicon.ico"
          }
        }
      ]
      */
      
      /* 
      🖼️ EJEMPLO CON GIF PERSONALIZADO:
      embeds: [
        {
          image: {
            url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjZycHVhaG5jcXNqcG43ZWtpMW9vNGYwZnU0OGhuem91Zmh6ZWNnaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/du3J3cXyzhj75IOgvA/giphy.gif",
          },
        },
      ],
      */
    };

    // =============================================
    // 🌐 PETICIÓN HTTP A DISCORD
    // =============================================
    try {
      const resp = await fetch(this.discordWebhookUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
          // 👉 Discord espera JSON en el Content-Type
        },
        body: JSON.stringify(body),
        // 👉 Convertir objeto JavaScript a JSON string
      });

      // ❌ Verificar si la respuesta fue exitosa
      if (!resp.ok) {
        console.error(`Discord API error: ${resp.status} ${resp.statusText}`);
        // 👉 Discord puede responder con:
        //    - 400: Bad Request (payload malformado)
        //    - 404: Webhook not found (URL incorrecta)
        //    - 429: Rate Limited (demasiadas requests)
        
        return false;
      }

      // ✅ Notificación enviada exitosamente
      console.log("✅ Message sent to Discord successfully");
      return true;
      
    } catch (error) {
      // 🌐 Errores de red (sin internet, timeout, etc.)
      console.error("Network error sending to Discord:", error);
      return false;
    }
    
    /*
    📘 MANEJO DE ERRORES MEJORADO:
    
    if (!resp.ok) {
      const errorBody = await resp.text();
      console.error(`Discord error ${resp.status}: ${errorBody}`);
      
      // Diferentes estrategias según el error
      switch (resp.status) {
        case 429: // Rate Limited
          const retryAfter = resp.headers.get('retry-after');
          console.log(`Rate limited, retry after ${retryAfter}ms`);
          break;
        case 404: // Webhook not found
          console.error('Webhook URL is invalid');
          break;
        default:
          console.error('Unknown Discord API error');
      }
      return false;
    }
    */
  }
  
  /*
  🚀 MÉTODOS ADICIONALES ÚTILES:

  // 📢 Notificación con embed personalizado
  async notifyWithEmbed(title: string, description: string, color: number = 0x0099ff) {
    const body = {
      embeds: [{
        title,
        description,
        color,
        timestamp: new Date().toISOString()
      }]
    };
    // ... resto del código similar
  }

  // ⚠️ Notificación de error crítico
  async notifyError(error: string, details?: any) {
    const body = {
      content: `🚨 **ERROR CRÍTICO** 🚨`,
      embeds: [{
        title: "Error en Webhook Server",
        description: error,
        color: 0xff0000, // Rojo
        fields: details ? [
          { name: "Details", value: JSON.stringify(details, null, 2) }
        ] : []
      }]
    };
    // ... enviar
  }
  */
}