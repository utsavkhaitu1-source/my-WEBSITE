(() => {
  'use strict';

  /* ---------------------------------------------------------
   * Utsav Forecasts — calendar with weather
   * Data: Open-Meteo (free, no API key)
   * --------------------------------------------------------- */

  const WEATHER_CODES = {
    0: ['☀️', 'Clear sky'],
    1: ['🌤️', 'Mainly clear'],
    2: ['⛅', 'Partly cloudy'],
    3: ['☁️', 'Overcast'],
    45: ['🌫️', 'Fog'],
    48: ['🌫️', 'Freezing fog'],
    51: ['🌦️', 'Light drizzle'],
    53: ['🌦️', 'Drizzle'],
    55: ['🌧️', 'Heavy drizzle'],
    56: ['🌧️', 'Freezing drizzle'],
    57: ['🌧️', 'Heavy freezing drizzle'],
    61: ['🌧️', 'Light rain'],
    63: ['🌧️', 'Rain'],
    65: ['🌧️', 'Heavy rain'],
    66: ['🌧️', 'Freezing rain'],
    67: ['🌧️', 'Heavy freezing rain'],
    71: ['🌨️', 'Light snow'],
    73: ['🌨️', 'Snow'],
    75: ['❄️', 'Heavy snow'],
    77: ['🌨️', 'Snow grains'],
    80: ['🌦️', 'Light showers'],
    81: ['🌧️', 'Showers'],
    82: ['⛈️', 'Violent showers'],
    85: ['🌨️', 'Snow showers'],
    86: ['❄️', 'Heavy snow showers'],
    95: ['⛈️', 'Thunderstorm'],
    96: ['⛈️', 'Thunderstorm with hail'],
    99: ['⛈️', 'Severe thunderstorm with hail']
  };

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                  'August', 'September', 'October', 'November', 'December'];
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const DEFAULT_LOCATION = { name: 'Kathmandu, Nepal', lat: 27.7172, lon: 85.324 };

  /* ---------- Small helpers ---------- */
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const wx = (code) => WEATHER_CODES[code] || ['🌡️', 'Unknown'];

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
    }
  };

  /* ---------- State ---------- */
  const today = new Date();
  const state = {
    location: store.get('utsav-location', DEFAULT_LOCATION),
    unit: store.get('utsav-unit', 'c'),
    notes: store.get('utsav-notes', {}),
    viewYear: today.getFullYear(),
    viewMonth: today.getMonth(),
    selected: dateKey(today),
    daily: {},     // { 'YYYY-MM-DD': {...} }
    hourly: {},    // { 'YYYY-MM-DD': [{time, temp, code, pop}] }
    current: null,
    loading: false
  };

  /* ---------- Unit formatting ---------- */
  const temp = (c) => c == null ? '–' : `${Math.round(state.unit === 'c' ? c : c * 9 / 5 + 32)}°`;
  const speed = (kmh) => kmh == null ? '–'
    : state.unit === 'c' ? `${Math.round(kmh)} km/h` : `${Math.round(kmh * 0.621371)} mph`;
  const rain = (mm) => mm == null ? '–'
    : state.unit === 'c' ? `${mm.toFixed(1)} mm` : `${(mm / 25.4).toFixed(2)} in`;
  const clock = (iso) => iso ? iso.slice(11, 16) : '–';

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3500);
  }

  /* ---------- Weather fetching ---------- */
  async function loadWeather() {
    state.loading = true;
    renderNow();
    const { lat, lon } = state.location;
    const url = 'https://api.open-meteo.com/v1/forecast'
      + `?latitude=${lat}&longitude=${lon}`
      + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day'
      + '&hourly=temperature_2m,weather_code,precipitation_probability'
      + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,'
      + 'precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,uv_index_max'
      + '&timezone=auto&past_days=7&forecast_days=16';

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      state.daily = {};
      data.daily.time.forEach((day, i) => {
        state.daily[day] = {
          code: data.daily.weather_code[i],
          max: data.daily.temperature_2m_max[i],
          min: data.daily.temperature_2m_min[i],
          precip: data.daily.precipitation_sum[i],
          pop: data.daily.precipitation_probability_max[i],
          wind: data.daily.wind_speed_10m_max[i],
          sunrise: data.daily.sunrise[i],
          sunset: data.daily.sunset[i],
          uv: data.daily.uv_index_max[i]
        };
      });

      state.hourly = {};
      data.hourly.time.forEach((t, i) => {
        const day = t.slice(0, 10);
        (state.hourly[day] = state.hourly[day] || []).push({
          time: t,
          temp: data.hourly.temperature_2m[i],
          code: data.hourly.weather_code[i],
          pop: data.hourly.precipitation_probability[i]
        });
      });

      state.current = {
        temp: data.current.temperature_2m,
        feels: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        code: data.current.weather_code,
        wind: data.current.wind_speed_10m,
        time: data.current.time
      };
    } catch (err) {
      console.error(err);
      state.daily = {};
      state.hourly = {};
      state.current = null;
      toast('Could not load weather. Check your connection and try again.');
    } finally {
      state.loading = false;
      renderAll();
    }
  }

  /* ---------- Rendering: current conditions ---------- */
  function renderNow() {
    const el = $('now');
    if (state.loading) {
      el.innerHTML = '<div class="skeleton">Loading weather…</div>';
      return;
    }
    const c = state.current;
    if (!c) {
      el.innerHTML = `<div class="skeleton">Weather unavailable for ${escapeHtml(state.location.name)}.</div>`;
      return;
    }
    const [icon, label] = wx(c.code);
    el.innerHTML = `
      <div class="now-inner">
        <div class="now-main">
          <div class="now-icon" aria-hidden="true">${icon}</div>
          <div>
            <div class="now-temp">${temp(c.temp)}<small>${state.unit === 'c' ? 'C' : 'F'}</small></div>
            <div class="now-place">${escapeHtml(state.location.name)}</div>
            <div class="now-cond">${label} · local time ${clock(c.time)}</div>
          </div>
        </div>
        <div class="now-stats">
          <div class="stat"><span>Feels like</span><strong>${temp(c.feels)}</strong></div>
          <div class="stat"><span>Humidity</span><strong>${c.humidity}%</strong></div>
          <div class="stat"><span>Wind</span><strong>${speed(c.wind)}</strong></div>
        </div>
      </div>`;
  }

  /* ---------- Rendering: calendar ---------- */
  function renderCalendar() {
    const { viewYear: y, viewMonth: m } = state;
    $('month-title').textContent = `${MONTHS[m]} ${y}`;

    const first = new Date(y, m, 1);
    const start = new Date(y, m, 1 - first.getDay()); // week starts on Sunday
    const todayKey = dateKey(today);
    const frag = document.createDocumentFragment();

    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      // Skip a trailing row that is entirely the next month
      if (i >= 35 && d.getMonth() !== m) break;

      const key = dateKey(d);
      const w = state.daily[key];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day'
        + (d.getMonth() !== m ? ' other' : '')
        + (d.getDay() === 6 ? ' sat' : '')
        + (key === todayKey ? ' today' : '')
        + (key < todayKey ? ' past' : '')
        + (key === state.selected ? ' selected' : '');
      btn.dataset.date = key;
      btn.setAttribute('aria-label',
        `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}` +
        (w ? `, ${wx(w.code)[1]}, high ${temp(w.max)}, low ${temp(w.min)}` : ''));
      if (key === state.selected) btn.setAttribute('aria-pressed', 'true');

      btn.innerHTML = `
        <span class="num">${d.getDate()}</span>
        ${(state.notes[key] || []).length ? '<span class="has-notes"></span>' : ''}
        <span class="wx" aria-hidden="true">${w ? wx(w.code)[0] : ''}</span>
        <span class="temps">${w ? `<b>${temp(w.max)}</b> / ${temp(w.min)}` : ''}</span>`;
      frag.appendChild(btn);
    }
    $('grid').replaceChildren(frag);
  }

  /* ---------- Rendering: selected day ---------- */
  function relativeLabel(key) {
    const diff = Math.round((parseKey(key) - parseKey(dateKey(today))) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    return diff > 0 ? `${diff} days from now` : `${-diff} days ago`;
  }

  function renderDetail() {
    const key = state.selected;
    const d = parseKey(key);
    $('d-date').textContent = `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    $('d-sub').textContent = `${relativeLabel(key)} · ${state.location.name}`;

    const w = state.daily[key];
    const box = $('d-weather');

    if (!w) {
      box.innerHTML = `<p class="muted" style="margin-top:14px">No forecast for this date. Weather is available from 7 days ago up to 15 days ahead.</p>`;
    } else {
      const [icon, label] = wx(w.code);
      box.innerHTML = `
        <div class="d-hero">
          <div class="icon" aria-hidden="true">${icon}</div>
          <div>
            <div class="cond">${label}</div>
            <div class="range">High <b>${temp(w.max)}</b> · Low <b>${temp(w.min)}</b></div>
          </div>
        </div>
        <div class="stat-grid">
          <div class="stat"><span>Chance of rain</span><strong>${w.pop == null ? '–' : w.pop + '%'}</strong></div>
          <div class="stat"><span>Precipitation</span><strong>${rain(w.precip)}</strong></div>
          <div class="stat"><span>Max wind</span><strong>${speed(w.wind)}</strong></div>
          <div class="stat"><span>UV index</span><strong>${w.uv == null ? '–' : w.uv.toFixed(1)}</strong></div>
          <div class="stat"><span>Sunrise</span><strong>🌅 ${clock(w.sunrise)}</strong></div>
          <div class="stat"><span>Sunset</span><strong>🌇 ${clock(w.sunset)}</strong></div>
        </div>`;
    }

    renderHourly(key);
    renderNotes(key);
  }

  function renderHourly(key) {
    const wrap = $('d-hourly');
    const hours = state.hourly[key];
    if (!hours) {
      wrap.innerHTML = '<p class="muted">No hourly data for this date.</p>';
      return;
    }
    const nowKey = state.current ? state.current.time.slice(0, 13) : null; // YYYY-MM-DDTHH
    wrap.replaceChildren(...hours.map((h) => {
      const el = document.createElement('div');
      const isNow = nowKey && h.time.slice(0, 13) === nowKey;
      el.className = 'hour' + (isNow ? ' current' : '');
      el.innerHTML = `
        <div class="t">${clock(h.time)}</div>
        <div class="e" aria-hidden="true">${wx(h.code)[0]}</div>
        <div><b>${temp(h.temp)}</b></div>
        <div class="p">${h.pop ? h.pop + '%' : ''}</div>`;
      el.title = `${clock(h.time)} — ${wx(h.code)[1]}`;
      return el;
    }));
    const current = wrap.querySelector('.current');
    if (current) {
      wrap.scrollLeft = current.offsetLeft - wrap.offsetLeft - 20;
    } else {
      wrap.scrollLeft = (wrap.scrollWidth / 24) * 7; // start near morning
    }
  }

  /* ---------- Notes ---------- */
  function renderNotes(key) {
    const list = $('notes');
    const items = state.notes[key] || [];
    if (!items.length) {
      const li = document.createElement('li');
      li.className = 'none';
      li.textContent = 'No notes for this day.';
      list.replaceChildren(li);
      return;
    }
    list.replaceChildren(...items.map((text, i) => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = text;
      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = '×';
      del.setAttribute('aria-label', `Delete note: ${text}`);
      del.addEventListener('click', () => {
        state.notes[key].splice(i, 1);
        if (!state.notes[key].length) delete state.notes[key];
        store.set('utsav-notes', state.notes);
        renderCalendar();
        renderNotes(key);
      });
      li.append(span, del);
      return li;
    }));
  }

  /* ---------- Misc ---------- */
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function renderAll() {
    renderNow();
    renderCalendar();
    renderDetail();
  }

  function selectDate(key) {
    state.selected = key;
    const d = parseKey(key);
    state.viewYear = d.getFullYear();
    state.viewMonth = d.getMonth();
    renderCalendar();
    renderDetail();
  }

  function shiftMonth(delta) {
    const d = new Date(state.viewYear, state.viewMonth + delta, 1);
    state.viewYear = d.getFullYear();
    state.viewMonth = d.getMonth();
    renderCalendar();
  }

  function setLocation(loc) {
    state.location = loc;
    store.set('utsav-location', loc);
    $('search-input').value = '';
    hideResults();
    loadWeather();
  }

  function applyUnit() {
    document.querySelectorAll('.seg button').forEach((b) =>
      b.classList.toggle('active', b.dataset.unit === state.unit));
  }

  /* ---------- City search ---------- */
  const resultsEl = $('results');
  let searchTimer;
  let searchToken = 0;

  function hideResults() { resultsEl.hidden = true; resultsEl.replaceChildren(); }

  async function searchCities(query) {
    const token = ++searchToken;
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (token !== searchToken) return; // a newer search replaced this one

      const items = (data.results || []).map((r) => {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        const sub = [r.admin1, r.country].filter(Boolean).join(', ');
        b.innerHTML = `${escapeHtml(r.name)} <small>${escapeHtml(sub)}</small>`;
        b.addEventListener('click', () =>
          setLocation({ name: sub ? `${r.name}, ${sub}` : r.name, lat: r.latitude, lon: r.longitude }));
        li.appendChild(b);
        return li;
      });

      if (!items.length) {
        const li = document.createElement('li');
        li.className = 'empty';
        li.textContent = 'No places found.';
        items.push(li);
      }
      resultsEl.replaceChildren(...items);
      resultsEl.hidden = false;
    } catch (err) {
      console.error(err);
      toast('City search failed. Please try again.');
    }
  }

  /* ---------- Events ---------- */
  function bindEvents() {
    $('grid').addEventListener('click', (e) => {
      const btn = e.target.closest('.day');
      if (btn) selectDate(btn.dataset.date);
    });

    $('prev').addEventListener('click', () => shiftMonth(-1));
    $('next').addEventListener('click', () => shiftMonth(1));
    $('today-btn').addEventListener('click', () => selectDate(dateKey(new Date())));

    document.querySelectorAll('.seg button').forEach((b) =>
      b.addEventListener('click', () => {
        state.unit = b.dataset.unit;
        store.set('utsav-unit', state.unit);
        applyUnit();
        renderAll();
      }));

    $('search-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = $('search-input').value.trim();
      if (q.length >= 2) searchCities(q);
    });

    $('search-input').addEventListener('input', (e) => {
      const q = e.target.value.trim();
      clearTimeout(searchTimer);
      if (q.length < 2) { hideResults(); return; }
      searchTimer = setTimeout(() => searchCities(q), 400);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#search-form')) hideResults();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideResults();
    });

    $('locate-btn').addEventListener('click', () => {
      if (!navigator.geolocation) { toast('Geolocation is not supported in this browser.'); return; }
      toast('Finding your location…');
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({
          name: 'My location',
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4))
        }),
        () => toast('Could not get your location. Please allow access or search for a city.'),
        { timeout: 10000 });
    });

    $('note-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('note-input');
      const text = input.value.trim();
      if (!text) return;
      const key = state.selected;
      (state.notes[key] = state.notes[key] || []).push(text);
      store.set('utsav-notes', state.notes);
      input.value = '';
      renderCalendar();
      renderNotes(key);
    });
  }

  /* ---------- Init ---------- */
  applyUnit();
  bindEvents();
  renderCalendar();
  renderDetail();
  loadWeather();
})();
