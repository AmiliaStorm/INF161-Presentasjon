const labels = [
  'BCE', '0–999', '1000–1499', '1500–1799',
  '1800–1899', '1900–1949', '1950–1999'
];

const counts = [663, 705, 987, 1410, 2083, 2488, 664];
const liveN = [663, 705, 987, 1410, 2082, 2487, 664];
const god = [85, 100, 100, 95, 70, 50, 50];
const live = [34.54, 22.9787, 12.9686, 7.8014, 4.0346, 5.1066, 3.1627];

const ns = 'http://www.w3.org/2000/svg';

function el(tag, attrs, parent) {
  const node = document.createElementNS(ns, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });
  parent.appendChild(node);
  return node;
}

function base(svg, max, ticks) {
  svg.setAttribute('viewBox', '0 0 850 410');

  const left = 63;
  const top = 22;
  const bottom = 316;
  const right = 827;

  for (let i = 0; i <= ticks; i++) {
    const value = max * i / ticks;
    const y = bottom - (bottom - top) * i / ticks;

    el('line', {
      x1: left,
      y1: y,
      x2: right,
      y2: y,
      stroke: '#34405e',
      'stroke-dasharray': '3 6'
    }, svg);

    const tick = el('text', {
      x: left - 12,
      y: y + 4,
      fill: '#aebbd5',
      'font-size': '12',
      'text-anchor': 'end'
    }, svg);

    tick.textContent = Math.round(value) + '%';
  }

  labels.forEach((label, i) => {
    const text = el('text', {
      x: left + 54 + i * 105,
      y: 345,
      fill: '#c5d0eb',
      'font-size': '11',
      'text-anchor': 'middle'
    }, svg);

    text.textContent = label;
  });

  return { left, top, bottom };
}

function bars(id, values, max, color, tipId, samples) {
  const svg = document.getElementById(id);
  const chart = base(svg, max, 4);

  values.forEach((value, i) => {
    const height = value / max * (chart.bottom - chart.top);
    const x = chart.left + 22 + i * 105;
    const y = chart.bottom - height;

    const bar = el('rect', {
      class: 'bar',
      x,
      y,
      width: 64,
      height,
      rx: 8,
      fill: color,
      'aria-label': `${labels[i]}: ${value.toFixed(1)} percent`
    }, svg);

    const message =
      `${labels[i]} · ${value.toFixed(1)}% · n = ${samples[i].toLocaleString()}`;

    bar.addEventListener('mouseenter', () => {
      document.getElementById(tipId).textContent = message;
    });

    bar.addEventListener('focus', () => {
      document.getElementById(tipId).textContent = message;
    });

    bar.setAttribute('tabindex', '0');

    const text = el('text', {
      x: x + 32,
      y: y - 9,
      fill: '#f4f4ff',
      'font-size': '13',
      'text-anchor': 'middle'
    }, svg);

    text.textContent = value.toFixed(value === 100 ? 0 : 1) + '%';
  });
}

bars('god-chart', god, 100, '#aa8bff', 'god-tip', counts);
bars('surprise-chart', live, 40, '#ff87b2', 'surprise-tip', liveN);

const historySvg = document.getElementById('history-chart');
const historyBase = base(historySvg, 40, 4);

const points = live.map((value, i) => [
  historyBase.left + 54 + i * 105,
  historyBase.bottom - value / 40 *
    (historyBase.bottom - historyBase.top)
]);

el('polyline', {
  points: points.map(point => point.join(',')).join(' '),
  fill: 'none',
  stroke: '#69e8e7',
  'stroke-width': '4',
  'stroke-linejoin': 'round'
}, historySvg);

points.forEach(([x, y], i) => {
  const point = el('circle', {
    class: 'bar',
    cx: x,
    cy: y,
    r: 9,
    fill: '#69e8e7',
    stroke: '#080b17',
    'stroke-width': 3,
    tabindex: 0
  }, historySvg);

  const message =
    `${labels[i]} · ${live[i].toFixed(1)}% · n = ${liveN[i].toLocaleString()}`;

  point.addEventListener('mouseenter', () => {
    document.getElementById('history-tip').textContent = message;
  });

  point.addEventListener('focus', () => {
    document.getElementById('history-tip').textContent = message;
  });

  const text = el('text', {
    x,
    y: y - 18,
    fill: '#f4f4ff',
    'font-size': '13',
    'text-anchor': 'middle'
  }, historySvg);

  text.textContent = live[i].toFixed(1) + '%';
});

let current = 0;
const pages = [...document.querySelectorAll('.page')];
const buttons = [...document.querySelectorAll('.nav')];

function show(index) {
  current = (index + 3) % 3;

  pages.forEach((page, i) => {
    page.classList.toggle('active', i === current);
  });

  buttons.forEach((button, i) => {
    button.classList.toggle('active', i === current);
    button.setAttribute(
      'aria-current',
      i === current ? 'page' : 'false'
    );
  });

  document.getElementById('counter').textContent =
    `0${current + 1} / 03`;

  history.replaceState(null, '', '#' + pages[current].id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

buttons.forEach((button, i) => {
  button.addEventListener('click', () => show(i));
});

document.getElementById('prev').addEventListener('click', () => {
  show(current - 1);
});

document.getElementById('next').addEventListener('click', () => {
  show(current + 1);
});

document.addEventListener('keydown', event => {
  if (event.target.tagName === 'BUTTON') return;
  if (event.key === 'ArrowRight') show(current + 1);
  if (event.key === 'ArrowLeft') show(current - 1);
});

document.querySelectorAll('.code-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const panel = button.nextElementSibling;
    const open = panel.classList.toggle('open');

    button.setAttribute('aria-expanded', String(open));
    button.textContent = open
      ? '⌘ Hide analysis code'
      : '⌘ Show analysis code';
  });
});

const initial = pages.findIndex(page => '#' + page.id === location.hash);
if (initial >= 0) show(initial);

const butterfly = document.getElementById('butterfly');
let mouseX = -100;
let mouseY = -100;
let flyX = -100;
let flyY = -100;

document.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch') return;

  mouseX = event.clientX + 18;
  mouseY = event.clientY - 32;

  butterfly.classList.add('visible');
  butterfly.classList.toggle(
    'glow',
    Boolean(event.target.closest('button,.bar,summary,a'))
  );
});

document.addEventListener('pointerleave', () => {
  butterfly.classList.remove('visible');
});

function follow() {
  flyX += (mouseX - flyX) * .13;
  flyY += (mouseY - flyY) * .13;
  butterfly.style.transform = `translate(${flyX}px,${flyY}px)`;
  requestAnimationFrame(follow);
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  follow();
} else {
  document.addEventListener('pointermove', () => {
    butterfly.style.transform = `translate(${mouseX}px,${mouseY}px)`;
  });
}

function populateTable(id, values, samples, metric) {
  const box = document.getElementById(id);
  const table = document.createElement('table');

  const caption = document.createElement('caption');
  caption.textContent = metric + ' by birth period';
  caption.style.cssText =
    'text-align:left;padding:10px 12px;color:#aebbd5';
  table.append(caption);

  const head = document.createElement('thead');
  head.innerHTML =
    '<tr><th scope="col">Birth period</th>' +
    '<th scope="col">Value</th>' +
    '<th scope="col">n</th></tr>';
  table.append(head);

  const body = document.createElement('tbody');

  values.forEach((value, i) => {
    const row = document.createElement('tr');

    [
      labels[i],
      value.toFixed(1) + '%',
      samples[i].toLocaleString()
    ].forEach(cellText => {
      const cell = document.createElement('td');
      cell.textContent = cellText;
      row.append(cell);
    });

    body.append(row);
  });

  table.append(body);
  box.append(table);
}

populateTable(
  'god-table',
  god,
  counts,
  'Median estimated probability that God exists'
);

populateTable(
  'surprise-table',
  live,
  liveN,
  'Want to live forever'
);

populateTable(
  'history-table',
  live,
  liveN,
  'Want to live forever'
);

document.querySelectorAll('.table-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const box = document.getElementById(button.dataset.table);
    const expanded = button.getAttribute('aria-expanded') === 'true';

    box.hidden = expanded;
    button.setAttribute('aria-expanded', String(!expanded));
    button.textContent = expanded ? 'Show numbers' : 'Hide numbers';
  });
});

const fullscreenButton = document.getElementById('fullscreen');

fullscreenButton.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch (error) {
    fullscreenButton.textContent = 'Fullscreen unavailable';
  }
});

document.addEventListener('fullscreenchange', () => {
  fullscreenButton.textContent = document.fullscreenElement
    ? '⛶ Exit fullscreen'
    : '⛶ Fullscreen';
});
