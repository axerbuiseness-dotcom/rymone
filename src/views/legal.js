// Textos legales (aviso legal, privacidad y cookies). Borrador redactado para una web personal en España
// (LSSI-CE, RGPD y LOPDGDD). Los datos marcados como pendientes (nombre completo, NIF, domicilio) los tiene
// que completar Rymone en `titular` antes de publicar, y conviene que alguien de confianza lo revise.
import { html, toNode } from '../dom.js';
import { config } from '../config.js';
import { footer } from './shared.js';

const titular = {
  nombre: null,      // Nombre y apellidos
  nif: null,         // NIF/DNI
  domicilio: null,   // Dirección postal
};
const dato = (v) => v ?? html`<span class="pending">Pendiente</span>`;
const ACTUALIZADO = '5 de octubre de 2026';

export function legalView(_params, url) {
  const node = toNode(html`
    <article class="legal wrap" aria-labelledby="legal-h">
      <p class="label">Información legal · actualizado el ${ACTUALIZADO}</p>
      <h1 id="legal-h" class="section__title section__title--xxl" data-focus>Legal</h1>
      <nav class="legal__nav" aria-label="Apartados">
        <a href="#aviso-legal">Aviso legal</a><a href="#privacidad">Privacidad</a><a href="#cookies">Cookies</a>
      </nav>

      <section id="aviso-legal" class="legal__block">
        <h2>Aviso legal</h2>
        <p>En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa de los datos del titular de esta web:</p>
        <dl class="facts legal__facts">
          <dt class="label">Titular</dt><dd>${dato(titular.nombre)} («Rymone»)</dd>
          <dt class="label">NIF</dt><dd>${dato(titular.nif)}</dd>
          <dt class="label">Domicilio</dt><dd>${dato(titular.domicilio)}</dd>
          <dt class="label">Email</dt><dd>${config.email ?? html`<span class="pending">Pendiente</span>`}</dd>
        </dl>
        <h3>Objeto</h3>
        <p>Esta web muestra la obra artística y musical de Rymone (también como «One» en la música) y permite contactar para consultas, encargos y compra de obras.</p>
        <h3>Propiedad intelectual</h3>
        <p>Las obras, fotografías, ilustraciones, firmas, logotipos, canciones y demás contenidos de esta web pertenecen a su titular o se usan con autorización. Rymone® es una marca registrada. No está permitido reproducirlos, distribuirlos, transformarlos ni comunicarlos públicamente sin permiso expreso, salvo los usos que permita la ley.</p>
        <h3>Responsabilidad</h3>
        <p>El titular procura que la información de la web sea correcta, pero no garantiza la ausencia de errores ni la disponibilidad continua del sitio. Los enlaces a webs de terceros, como Instagram, se ofrecen solo por comodidad: el titular no responde de su contenido.</p>
        <h3>Legislación aplicable</h3>
        <p>Estas condiciones se rigen por la legislación española.</p>
      </section>

      <section id="privacidad" class="legal__block">
        <h2>Política de privacidad</h2>
        <p>Se aplica el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).</p>
        <h3>Responsable</h3>
        <p>${dato(titular.nombre)} («Rymone»). Contacto: ${config.email ?? 'pendiente'}.</p>
        <h3>Qué datos se recogen</h3>
        <p>Solo los que tú facilitas al escribir, desde el formulario de contacto o por email: nombre, dirección de correo, el motivo de la consulta, la obra que te interesa y tu mensaje. La web no te pide registrarte ni recoge datos de navegación con fines de análisis o publicidad.</p>
        <h3>Para qué se usan</h3>
        <p>Para responder a tu consulta y, si quieres comprar una obra o hacer un encargo, para gestionar esa relación. No se envían comunicaciones comerciales que no hayas pedido.</p>
        <h3>Base legal</h3>
        <p>Tu consentimiento al escribir y, en el caso de compras o encargos, la aplicación de medidas precontractuales o del contrato que solicites (art. 6.1.a y 6.1.b del RGPD).</p>
        <h3>Cuánto tiempo se guardan</h3>
        <p>El tiempo necesario para atender tu consulta. Si se formaliza una venta, durante los plazos que exija la ley (por ejemplo, los fiscales).</p>
        <h3>Quién más puede tratarlos</h3>
        <p>Nadie más, salvo obligación legal. Para que la web funcione se usan proveedores que pueden tratar datos técnicos por cuenta del titular: el servicio de alojamiento de la web y, cuando se conecte, el servicio que envía los mensajes del formulario al correo de Rymone. Si alguno de estos proveedores está fuera del Espacio Económico Europeo, la transferencia se ampara en las garantías del RGPD, como las cláusulas contractuales tipo de la Comisión Europea.</p>
        <h3>Tus derechos</h3>
        <p>Puedes pedir acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad de tus datos escribiendo a ${config.email ?? 'la dirección de contacto'}. Si consideras que no se han atendido correctamente, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener">aepd.es</a>).</p>
      </section>

      <section id="cookies" class="legal__block">
        <h2>Política de cookies</h2>
        <p>Esta web <strong>no usa cookies</strong>: ni propias ni de terceros, ni de análisis ni de publicidad. Las fuentes tipográficas, imágenes y canciones se sirven desde el propio servidor de la web, sin servicios externos que rastreen tu visita. Por eso no aparece ningún aviso de cookies.</p>
        <p>Si en el futuro se añaden estadísticas de visitas u otros servicios que usen cookies no necesarias, se pedirá tu consentimiento antes de activarlas y se actualizará esta política.</p>
      </section>
    </article>
    ${footer()}
  `);
  return {
    node,
    mounted() {
      const target = url.hash && document.querySelector(url.hash);
      if (target) target.scrollIntoView();
    },
  };
}
