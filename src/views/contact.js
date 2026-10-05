import { html, toNode, icons } from '../dom.js';
import { obras, tituloDe } from '../data/obras.js';
import { config } from '../config.js';
import { footer } from './shared.js';

const TIPOS = ['Compra de una obra', 'Encargo', 'Colaboración o exposición', 'Prensa', 'Otro'];

export function contactView(_params, url) {
  const pre = url.searchParams.get('obra');
  const preObra = obras.find((o) => o.slug === pre);

  const node = toNode(html`
    <section class="contact wrap" aria-labelledby="contact-h">
      <p class="label" data-reveal>Contacto</p>
      <h1 id="contact-h" class="contact__title" data-focus data-split>Hablemos</h1>
      <div class="contact__grid">
        <form class="form" novalidate data-form data-reveal style="--d:.1s">
          <div class="form__row">
            <div class="field">
              <label for="c-nombre">Nombre</label>
              <input id="c-nombre" name="nombre" autocomplete="name" required>
              <p class="field__error" id="c-nombre-err" hidden></p>
            </div>
            <div class="field">
              <label for="c-email">Email</label>
              <input id="c-email" name="email" type="email" autocomplete="email" required>
              <p class="field__error" id="c-email-err" hidden></p>
            </div>
          </div>
          <div class="form__row">
            <div class="field">
              <label for="c-tipo">Motivo</label>
              <select id="c-tipo" name="tipo">
                ${TIPOS.map((t, i) => html`<option ${(preObra ? i === 0 : i === 0) ? 'selected' : ''}>${t}</option>`)}
              </select>
            </div>
            <div class="field">
              <label for="c-obra">Obra</label>
              <select id="c-obra" name="obra">
                <option value="">Ninguna en concreto</option>
                ${obras.map((o) => html`<option value="${o.slug}" ${o === preObra ? 'selected' : ''}>${o.numero} · ${tituloDe(o)}</option>`)}
              </select>
            </div>
          </div>
          <div class="field">
            <label for="c-mensaje">Mensaje</label>
            <textarea id="c-mensaje" name="mensaje" required placeholder="${preObra ? `Hola, me interesa ${tituloDe(preObra)}. ¿Está disponible?` : 'Cuéntame qué te interesa'}"></textarea>
            <p class="field__error" id="c-mensaje-err" hidden></p>
          </div>
          <div><button class="btn" type="submit" data-submit>Enviar mensaje ${icons.arrow}</button></div>
          <div class="form__status" data-status role="status" hidden></div>
          <p class="form__privacy">Tus datos solo se usan para responderte. Más información en <a href="/legal#privacidad" data-link>Privacidad</a>.</p>
        </form>

        <aside class="channels" aria-label="Otras formas de contacto" data-reveal style="--d:.2s">
          <dl>
            <dt class="label">Email</dt>
            <dd>${config.email ? html`<a href="mailto:${config.email}">${config.email}</a>` : html`<span class="pending">Email pendiente</span>`}</dd>
            <dt class="label">Redes</dt>
            <dd>${config.social.length ? config.social.map((s) => html`<a href="${s.url}" rel="noopener" target="_blank">${s.label}</a> `) : html`<span class="pending">Redes pendientes</span>`}</dd>
          </dl>
          <p class="section__lede">Para consultas sobre una obra, indica cuál te interesa y Rymone te responderá con disponibilidad y precio.</p>
        </aside>
      </div>
    </section>
    ${footer()}
  `);

  const form = node.querySelector('[data-form]');
  const status = node.querySelector('[data-status]');
  const submit = node.querySelector('[data-submit]');

  const setError = (name, msg) => {
    const input = form.elements[name];
    const err = form.querySelector(`#c-${name}-err`);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) { input.setAttribute('aria-describedby', err.id); err.textContent = msg; err.hidden = false; }
    else { input.removeAttribute('aria-describedby'); err.hidden = true; }
    return !msg;
  };
  const validate = () => {
    const f = form.elements;
    const ok = [
      setError('nombre', f.nombre.value.trim() ? '' : 'Escribe tu nombre.'),
      setError('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()) ? '' : 'Escribe un email válido, por ejemplo nombre@dominio.com.'),
      setError('mensaje', f.mensaje.value.trim().length >= 5 ? '' : 'Escribe tu mensaje.'),
    ];
    const firstBad = ['nombre', 'email', 'mensaje'][ok.indexOf(false)];
    if (firstBad) f[firstBad].focus();
    return !firstBad;
  };
  const summary = () => {
    const f = form.elements;
    const obra = obras.find((o) => o.slug === f.obra.value);
    return `Nombre: ${f.nombre.value.trim()}\nEmail: ${f.email.value.trim()}\nMotivo: ${f.tipo.value}\nObra: ${obra ? tituloDe(obra) : 'Ninguna en concreto'}\n\n${f.mensaje.value.trim()}`;
  };
  const showStatus = (kind, content) => {
    status.dataset.kind = kind;
    status.replaceChildren(toNode(content));
    status.hidden = false;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!config.contactEndpoint) {
      // Sin servicio conectado: decirlo claro y no simular un envío.
      showStatus('warn', html`
        <strong>Tu mensaje no se ha enviado.</strong>
        <p>El formulario todavía no envía mensajes por sí solo. ${config.email ? html`Puedes mandarlo desde tu correo a <strong>${config.email}</strong>: el botón abre tu aplicación de correo con el mensaje ya escrito.` : 'Puedes copiar el mensaje y guardarlo para enviarlo más tarde.'}</p>
        <div class="form__status-actions">
          ${config.email ? html`<a class="btn" href="mailto:${config.email}?subject=${encodeURIComponent(`Consulta web: ${form.elements.tipo.value}`)}&body=${encodeURIComponent(summary())}">Enviar desde mi correo</a>` : ''}
          <button class="btn btn--ghost" type="button" data-copy>Copiar mensaje</button>
        </div>`);
      status.querySelector('[data-copy]').addEventListener('click', async (ev) => {
        const btn = ev.currentTarget;
        try { await navigator.clipboard.writeText(summary()); btn.textContent = 'Copiado'; }
        catch { btn.textContent = 'No se pudo copiar: selecciona el texto del formulario'; }
      });
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Enviando…';
    try {
      const res = await fetch(config.contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      showStatus('ok', html`<strong>Mensaje enviado.</strong><p>Rymone lo ha recibido y te responderá a tu email.</p>`);
    } catch {
      showStatus('warn', html`<strong>No se pudo enviar el mensaje.</strong><p>Revisa tu conexión e inténtalo de nuevo. Tu texto sigue en el formulario.</p>`);
    } finally {
      submit.disabled = false;
      submit.textContent = 'Enviar mensaje';
    }
  });

  return { node };
}
