# 📌 Webhooks en Node.js

## 🔹 ¿Qué son los Webhooks?
Los **webhooks** son una forma de comunicación entre aplicaciones que permiten **recibir notificaciones en tiempo real** cuando ocurre un evento específico en un servicio externo.

En lugar de que nuestra aplicación consulte constantemente a una API para verificar si algo ha cambiado (lo que se conoce como *polling*), el servicio externo se encarga de **enviar una petición HTTP (normalmente `POST`) a una URL que nosotros definimos** cada vez que ocurre un evento.

👉 En pocas palabras:  
Un webhook es un **“disparador”** que se activa en un servicio externo y que envía información a tu servidor cuando algo sucede.

---

## 🔹 ¿Cómo funcionan los Webhooks?
1. **Registro del webhook:**  
   - Nuestra aplicación debe exponer una URL pública accesible desde internet.  
   - En el servicio externo (ejemplo: **GitHub** o **Stripe**), configuramos esa URL como destino para el webhook.  

2. **Evento en el servicio externo:**  
   - Cada vez que ocurre un evento (ejemplo: alguien hace un **push** en GitHub), el servicio externo crea una notificación.  

3. **Envío de la notificación:**  
   - El servicio externo envía una **petición HTTP POST** a la URL configurada con un payload en formato **JSON**.  

4. **Procesamiento en nuestro servidor:**  
   - Nuestra aplicación recibe el JSON, lo interpreta y ejecuta la acción necesaria (ejemplo: enviar un mensaje a **Discord** o actualizar una base de datos).  

---

## 🔹 Ejemplo visual del flujo
GitHub (push, PR, etc) -----> [POST request con JSON] -----> Nuestro servidor Node.js -----> Discord / BD / Logs

![Flujo de Webhooks](https://miro.medium.com/v2/resize:fit:1400/1*F1pQhmu2Vf5TnI2dXJ1NWw.png)

---

## 🔹 Ventajas de los Webhooks
✅ **Eficiencia:** no necesitas consultar constantemente la API.  
✅ **Tiempo real:** la información llega inmediatamente cuando ocurre el evento.  
✅ **Integración sencilla:** funcionan con simples solicitudes HTTP.  

---

## 🔹 Casos de uso comunes
- **GitHub** → Notificar a un servidor cuando alguien hace un commit o un pull request.  
- **Stripe / PayPal** → Confirmar pagos en tiempo real.  
- **Discord / Slack** → Recibir notificaciones automáticas de eventos.  
- **Zapier / IFTTT** → Conectar aplicaciones sin necesidad de código.  

---

## 🔹 Seguridad en los Webhooks
- Usar **tokens o firmas secretas** para validar que la petición realmente proviene del servicio externo.  
- Usar **HTTPS** para asegurar la comunicación.  
- Verificar los **headers** que envía el proveedor (ejemplo: `X-GitHub-Signature`).  

---

## 🔹 Resumen
Un **webhook** es:
- Una URL que escucha peticiones.  
- Activada automáticamente por un evento externo.  
- Una herramienta clave para conectar servicios en **tiempo real**.  

En este curso conectaremos **GitHub** con **Discord** mediante un servidor en **Node.js** que recibirá los webhooks de GitHub y enviará mensajes automáticamente a un canal de Discord 🚀.
