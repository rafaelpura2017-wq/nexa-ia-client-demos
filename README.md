# NEXA IA

Sitio comercial para vender paginas web, chatbots, optimizacion y marketing digital a negocios locales.

## Links publicados

Repo:

```text
https://github.com/rafaelpura2017-wq/nexa-ia-client-demos
```

Pagina publica:

```text
https://rafaelpura2017-wq.github.io/nexa-ia-client-demos/
```

Modo admin:

```text
https://rafaelpura2017-wq.github.io/nexa-ia-client-demos/?admin=1
```

## Como usar la pagina

1. Abre la version publica para clientes.
2. Abre el modo admin con `?admin=1` para crear demos personalizadas.
3. En la demo cambia el nombre del negocio, barrio, telefono, direccion, horario y promocion.
4. Copia el `Link personalizado` o el `Mensaje con link`.
5. Envia ese link al cliente por WhatsApp, llamada o correo.

Ejemplo local:

```text
http://127.0.0.1:5500/index.html?admin=1
```

Ejemplo de link demo:

```text
https://tudominio.com/?cliente=Barberia%20Estilo%20Fino&ciudad=Centro#demo
```

Importante: un link `127.0.0.1` solo funciona en tu computador. Para compartir con clientes hay que subir esta carpeta a un hosting como Netlify, GitHub Pages, Firebase Hosting o Vercel.

## Productos iniciales

```text
Chatbot IA: Desde US$99 + US$29/mes
AinaWeb pagina oficial: Desde US$149
Optimizacion de sitio: Desde US$79
Marketing digital local: Desde US$99/mes
Paquete lanzamiento: Desde US$249
```

## Flyers

Los flyers estan en:

```text
assets/flyers/
```

Piezas incluidas:

```text
flyer-chatbot.svg
flyer-ainaweb.svg
flyer-optimizacion.svg
flyer-marketing.svg
flyer-paquete.svg
flyer-demo-gratis.svg
```

## Forma recomendada de vender

No empieces diciendo el precio. Empieza ofreciendo una demo personalizada:

```text
Hola, vi tu negocio en Google Maps. Soy de NEXA IA y estoy preparando demos gratis para negocios que quieren responder mas rapido por WhatsApp y verse mas profesionales en internet. Te puedo mostrar una demo con el nombre de tu negocio?
```

Cuando respondan, personaliza la demo y muestra:

```text
1. Como responde precios.
2. Como responde horarios y ubicacion.
3. Como separa una cita.
4. Como entrega un resumen del cliente interesado.
```

## Configurar WhatsApp de NEXA IA

En `app.js`, cambia este valor por tu numero real en formato internacional, sin `+`, espacios ni guiones:

```js
const company = {
  whatsapp: "573000000000"
};
```
