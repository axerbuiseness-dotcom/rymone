// Títulos que se "inflan" letra a letra, como letras pompa. Los lectores de pantalla leen el texto completo.
// Respeta los <span> internos (por ejemplo una palabra en la otra fuente) y les reparte las letras.
export function splitTitles(root) {
  root.querySelectorAll('[data-split]').forEach((el) => {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    let i = 0;
    const splitText = (text) => {
      const frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(document.createTextNode(' ')); return; }
        const word = document.createElement('span');
        word.className = 'split__word';
        for (const ch of part) {
          const c = document.createElement('span');
          c.className = 'split__char';
          c.style.setProperty('--i', i++);
          c.textContent = ch;
          word.append(c);
        }
        frag.append(word);
      });
      return frag;
    };
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) child.replaceWith(splitText(child.textContent));
        else if (child.nodeType === Node.ELEMENT_NODE) walk(child);
      });
    };
    walk(el);
    [...el.children].forEach((c) => c.setAttribute('aria-hidden', 'true'));
  });
}
