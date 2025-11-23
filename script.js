'use strict';

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let LINE_H = 22;
const ROWS = 28;

function measureLineHeight() {
  const t = document.createElement("p");
  t.style.visibility = "hidden";
  t.textContent = "A";
  document.body.appendChild(t);
  const h = t.getBoundingClientRect().height;
  document.body.removeChild(t);
  return h;
}

function createStrip(isFixed = false, shift = 0, index = null) {
  const wrap = document.createElement("div");
  wrap.className = "streifen";
  wrap.dataset.index = index;
  wrap.dataset.offset = shift;

  const up = document.createElement("div");
  up.className = "control";
  up.textContent = isFixed ? "" : "▲";

  const inner = document.createElement("div");
  inner.className = "alphabet";

  const down = document.createElement("div");
  down.className = "control";
  down.textContent = isFixed ? "" : "▼";

  const letters = [];
  for (let i = 0; i < 26; i++) {
    const p = document.createElement("p");
    letters.push(p);
    inner.appendChild(p);
  }

  function fill(offset) {
    for (let i = 0; i < 26; i++) {
      letters[i].textContent = ALPHA[(offset + i) % 26];
    }
  }

  let offset = shift;
  fill(offset);

  function upFn() {
    offset = (offset - 1 + 26) % 26;
    wrap.dataset.offset = offset;
    fill(offset);
    updateKeyField();
  }

  function downFn() {
    offset = (offset + 1) % 26;
    wrap.dataset.offset = offset;
    fill(offset);
    updateKeyField();
  }

  if (!isFixed) {
    up.onclick = upFn;
    down.onclick = downFn;

    let startY = 0;
    inner.onmousedown = e => {
      e.preventDefault();
      startY = e.clientY;

      document.onmousemove = ev => {
        const dy = ev.clientY - startY;
        if (Math.abs(dy) >= LINE_H) {
          dy > 0 ? downFn() : upFn();
          startY = ev.clientY;
        }
      };

      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  }

  wrap.appendChild(up);
  wrap.appendChild(inner);
  wrap.appendChild(down);

  return wrap;
}

function highlightRow(i) {
  document.querySelectorAll('.highlight').forEach(e => e.classList.remove('highlight'));
  document.querySelectorAll('.keyletter').forEach(e => e.classList.remove('keyletter'));

  document.querySelectorAll('.streifen').forEach(st => {
    const p = st.querySelectorAll('.alphabet p')[i];
    if (p) p.classList.add('highlight');
  });

  document.querySelectorAll('.streifen:not(:first-child)').forEach(st => {
    const p = st.querySelectorAll('.alphabet p')[0];
    if (p) p.classList.add('keyletter');
  });
}

function updateKeyField() {
  const keyField = document.getElementById("key");
  const strips = document.querySelectorAll('.streifen');
  const newKey = [];

  strips.forEach(s => {
    if (s.dataset.index !== "null" && s.dataset.index !== undefined) {
      const off = parseInt(s.dataset.offset);
      if (!isNaN(off)) newKey.push(ALPHA[off]);
    }
  });

  keyField.value = newKey.join("");
}

function applyKey() {
  const keyField = document.getElementById("key");
  let key = keyField.value.toUpperCase().replace(/[^A-Z]/g, "");
  if (key.length > 20) key = key.substring(0, 20);
  keyField.value = key;

  const c = document.getElementById("container");
  c.innerHTML = "";

  c.appendChild(createStrip(true, 0, null));

  for (let i = 0; i < key.length; i++) {
    const shift = ALPHA.indexOf(key[i]);
    c.appendChild(createStrip(false, shift, i));
  }

  document.getElementById("count").value = key.length;
  wireHighlightClicks();
  highlightRow(0);
}

function applyCount() {
  let count = parseInt(document.getElementById("count").value) || 1;
  if (count < 1) count = 1;
  if (count > 20) count = 20;
  document.getElementById("count").value = count;

  const keyField = document.getElementById("key");
  let key = keyField.value.toUpperCase().replace(/[^A-Z]/g, "");
  if (key.length > 20) key = key.substring(0, 20);

  if (key.length > count) key = key.substring(0, count);
  if (key.length < count) key = key + "A".repeat(count - key.length);

  keyField.value = key;

  const c = document.getElementById("container");
  c.innerHTML = "";

  c.appendChild(createStrip(true, 0, null));
  for (let i = 0; i < count; i++) {
    c.appendChild(createStrip(false, ALPHA.indexOf(key[i]), i));
  }

  wireHighlightClicks();
  highlightRow(0);
}

function wireHighlightClicks() {
  const firstStrip = document.querySelector('.streifen:first-child');
  if (!firstStrip) return;
  const ps = firstStrip.querySelectorAll('.alphabet p');
  ps.forEach((p, idx) => {
    p.onclick = () => highlightRow(idx);
  });
}

window.onload = () => {
  LINE_H = measureLineHeight();
  applyKey();
};
