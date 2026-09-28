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
    ].forEach(text => {
      const cell = document.createElement('td');
      cell.textContent = text;
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
