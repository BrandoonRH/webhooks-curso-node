// Importamos express, que será el framework para crear nuestro servidor HTTP
import express from "express";

// Importamos las variables de entorno procesadas desde config/envs
import { envs } from "./config/envs";
import { GitHubController } from "./presentation/github/controller";
import { GithubSha256Middleware } from "./presentation/middlewares/github.middleware";

// =========================
//! (IIFE) Función anónima auto-invocada
// =========================
// Una IIFE (Immediately Invoked Function Expression) es una función que
// se define y se ejecuta inmediatamente.
// Nos sirve para inicializar nuestra aplicación sin necesidad de llamar
// manualmente a "main()" más abajo en el código.
(() => {
  main();
})();

// =============================================
// 🌐 SERVIDOR WEBHOOK DE GITHUB
// 📁 app.ts - Configuración principal
// =============================================
/*
📘 PROPÓSITO DEL SERVIDOR:
- Recibir webhooks de GitHub cuando ocurren eventos en repositorios
- Validar la autenticidad de los webhooks usando SHA-256 HMAC
- Procesar diferentes tipos de eventos (stars, issues, pull requests, etc.)
- Enviar notificaciones automáticas a Discord
- Mantener seguridad mediante verificación de firmas criptográficas

🔄 FLUJO PRINCIPAL:
1. GitHub envía webhook → Middleware de validación
2. Se verifica la firma SHA-256 del payload
3. Si es válido → Controller procesa el evento
4. Se genera mensaje personalizado según el tipo de evento
5. Se envía notificación a Discord
6. Se responde a GitHub con confirmación

🛡️ SEGURIDAD IMPLEMENTADA:
- Validación HMAC SHA-256 obligatoria
- Headers de GitHub verificados
- Secret token para autenticación
- Manejo de errores seguros
*/

// =========================
// Función principal de la aplicación
// =========================
function main() {
  // Creamos una instancia de Express
  const app = express();

  const controller = new GitHubController();

  app.use(express.json());

  // =============================================
  // 🛡️ MIDDLEWARE DE SEGURIDAD SHA-256
  // =============================================
  app.use(GithubSha256Middleware.verifyGithubSignature);
  // 👉 Middleware que se ejecuta ANTES de cualquier ruta
  //    Valida que el webhook realmente venga de GitHub
  //    Usa criptografía SHA-256 para verificar autenticidad

  // Definimos una ruta POST que escuchará los webhooks de GitHub
  // =============================================
  // 🎯 RUTA PRINCIPAL PARA WEBHOOKS
  // =============================================
  app.post("/api/github", controller.webHookHandler);
  // 👉 Endpoint POST que GitHub llamará automáticamente
  //    Debe coincidir exactamente con la URL configurada en GitHub
  //    Procesará todos los tipos de eventos configurados

  // Levantamos el servidor en el puerto definido en las variables de entorno
  app.listen(envs.PORT, () => {
    console.log(`App Running on PORT ${envs.PORT}`);
  });
}

/* 
*📌 Explicación: Función anónima auto-invocada (IIFE)
Una IIFE es un patrón en JavaScript/TypeScript que nos permite ejecutar una 
función inmediatamente después de definirla.
Ejemplo básico: 
*/

/* (() => {
  console.log("Soy una IIFE 🚀");
})(); */

/* 
Función anónima: porque no tiene nombre.
Auto-invocada: porque se ejecuta al momento de definirse.
Se usa mucho en entornos backend para encapsular código y evitar variables globales.
En tu caso, encapsula la llamada a main(), manteniendo el flujo de inicialización
 limpio y organizado.

 Una función anónima autoinvocada, también conocida 
 como IIFE (Expresión de función ejecutada inmediatamente), 
 es un patrón de diseño en JavaScript que consiste en una 
 función anónima que se ejecuta tan pronto como se define.
 Este patrón se compone de dos partes principales: la primera 
 es la función anónima encerrada entre paréntesis, lo que la 
 convierte en una expresión de función, y la segunda es el
  paréntesis adicional que sigue inmediatamente, que ejecuta dicha función.
 La sintaxis básica es (function() { /* código *
  */
