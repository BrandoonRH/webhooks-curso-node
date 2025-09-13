import { NextFunction, Request, Response } from 'express';
import { envs } from '../../config/envs';

/**
 * 🛡️ Middleware para verificar firmas SHA-256 de GitHub Webhooks
 * 
 * Esta clase proporciona funcionalidades para validar la autenticidad
 * de las solicitudes entrantes de GitHub mediante verificación criptográfica
 */
export class GithubSha256Middleware {
  // 📊 Codificador de texto para conversiones byte-string
  private static encoder = new TextEncoder();

  /**
   * 🔍 Middleware principal para verificación de firma GitHub
   * 
   * @param req - Objeto de solicitud Express
   * @param res - Objeto de respuesta Express
   * @param next - Función para pasar al siguiente middleware
   */
  static async verifyGithubSignature(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // 📨 Extraer la firma del encabezado de la solicitud
    const xHubSignature = `${req.headers['x-hub-signature-256']}`;
    
    // 📦 Convertir el cuerpo a string para su procesamiento
    const body = JSON.stringify(req.body);
    
    // 🔑 Obtener el token secreto desde las variables de entorno
    const secret = envs.SECRET_TOKEN;

    // ✅ Verificar la validez de la firma
    const isValid = await GithubSha256Middleware.verifySignature(
      secret,
      xHubSignature,
      body
    );

    if (isValid) {
      // 🟢 Firma válida - Continuar con el procesamiento
      next();
    } else {
      // 🔴 Firma inválida - Responder con error de autenticación
      res.status(401).json({ error: 'Invalid signature' });
    }
  }

  /**
   * 🔐 Verificación criptográfica de la firma HMAC-SHA256
   * 
   * @param secret - Token secreto para la verificación
   * @param header - Encabezado 'x-hub-signature-256' de GitHub
   * @param payload - Cuerpo de la solicitud en formato string
   * @returns Promise<boolean> - True si la firma es válida, False en caso contrario
   */
  private static async verifySignature(
    secret: string,
    header: string,
    payload: string
  ) {
    try {
      // 🧩 Dividir el encabezado para extraer la firma hexadecimal
      let parts = header.split('=');
      let sigHex = parts[1];

      // ⚙️ Configurar el algoritmo criptográfico (HMAC con SHA-256)
      let algorithm = { name: 'HMAC', hash: { name: 'SHA-256' } };

      // 🔄 Convertir el secreto a bytes
      let keyBytes = GithubSha256Middleware.encoder.encode(secret);
      let extractable = false;
      
      // 📋 Importar la clave para las operaciones criptográficas
      let key = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        algorithm,
        extractable,
        ['sign', 'verify']
      );

      // 🔢 Convertir la firma hexadecimal a bytes
      let sigBytes = GithubSha256Middleware.hexToBytes(sigHex);
      
      // 🔢 Convertir el payload a bytes
      let dataBytes = GithubSha256Middleware.encoder.encode(payload);
      
      // ✅ Verificar si la firma coincide
      let equal = await crypto.subtle.verify(
        algorithm.name,
        key,
        sigBytes,
        dataBytes
      );

      return equal;
    } catch (error) {
      // ❗ Registrar cualquier error en la verificación
      console.error(error);
      return false;
    }
  }

  /**
   * 🔄 Conversión de hexadecimal a array de bytes
   * 
   * @param hex - String hexadecimal a convertir
   * @returns Uint8Array - Array de bytes correspondiente
   */
  private static hexToBytes(hex: string) {
    let len = hex.length / 2;
    let bytes = new Uint8Array(len);

    let index = 0;
    // 🔁 Procesar el string hexadecimal de 2 en 2 caracteres
    for (let i = 0; i < hex.length; i += 2) {
      let c = hex.slice(i, i + 2);
      let b = parseInt(c, 16);
      bytes[index] = b;
      index += 1;
    }

    return bytes;
  }
}


/* 
!🎯 Propósito
Este middleware verifica que las solicitudes webhook de GitHub sean auténticas y no hayan sido alteradas, mediante la validación de firmas HMAC-SHA256.

?⚙️ Configuración Necesaria
Debes configurar un SECRET_TOKEN en tus variables de entorno

En GitHub, configurar el mismo secreto en la configuración del webhook */