// Workshop one-pager — main app
// Loaded as text/babel after React + tweaks-panel.

const { useState, useEffect, useMemo } = React;

/* ─────────────────────────────────────────────
   Schedule definition — all times in event timezone (Eastern)
   Event: Saturday May 23, 2026, 10:00 AM – 12:00 PM
───────────────────────────────────────────── */
const EVENT_DATE_LABEL = "Sat, May 23, 2026";
// Each row: minutes-from-start range, time label, title, where
const SCHEDULE = [
  { start:   0, end:  50, time: "10:00", end_label: "10:50am", title: "Talks",                  what: "Short stories from real people using AI in their everyday lives.", where: "Main room (here)" },
  { start:  50, end:  60, time: "10:50", end_label: "11:00am", title: "Show of hands",          what: "Quick poll — which hands-on room will you join?",                  where: "Main room" },
  { start:  60, end: 120, time: "11:00", end_label: "12:00pm", title: "Hands-on hour",          what: "Split into two rooms — pick one below.",                            where: "Room A or Room B" },
  { start: 120, end: 130, time: "12:00", end_label: "12:10pm", title: "Survey + farewell",     what: "5 minutes of honest feedback. Then we send you off.",               where: "Wherever you ended up" },
];

/* ─────────────────────────────────────────────
   Compute which row is active, and a "now status"
───────────────────────────────────────────── */
function getEventMinutes(simulatedMin) {
  // simulatedMin === null  → use real clock, mapped to event minutes
  // simulatedMin === number → use that as event minute (-30 = pre-event, etc)
  if (simulatedMin !== null && simulatedMin !== undefined) return simulatedMin;

  // Real Cleveland time. We compute minutes-from-10am-Eastern.
  const now = new Date();
  // Get current time in Eastern via Intl
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: false
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  const year = +parts.year, month = +parts.month, day = +parts.day;
  const hour = +parts.hour, minute = +parts.minute;
  // Event date: 2026-05-23
  const isEventDay = (year === 2026 && month === 5 && day === 23);
  const minutesIntoDay = hour * 60 + minute;
  const eventStart = 10 * 60;
  if (!isEventDay) {
    // Before event day → very negative; after → very positive
    const eventTs = Date.UTC(2026, 4, 23, 14, 0, 0); // 10am EDT = 14:00 UTC
    const diffMin = Math.floor((now.getTime() - eventTs) / 60000);
    return diffMin;
  }
  return minutesIntoDay - eventStart;
}

function findActiveRow(eventMin) {
  for (let i = 0; i < SCHEDULE.length; i++) {
    const r = SCHEDULE[i];
    if (eventMin >= r.start && eventMin < r.end) return i;
  }
  return -1;
}

function formatCountdown(mins) {
  const abs = Math.abs(mins);
  const d = Math.floor(abs / (60 * 24));
  const h = Math.floor((abs % (60 * 24)) / 60);
  const m = abs % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ─────────────────────────────────────────────
   Icons — inline 24px lucide-style (1.75 stroke)
───────────────────────────────────────────── */
const Icon = {
  wifi: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>
  ),
  sparkle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  laptop: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="2"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  pin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  arrow: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="13 6 19 12 13 18"/>
    </svg>
  ),
  download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
};

/* ─────────────────────────────────────────────
   Now card — pinned status banner
───────────────────────────────────────────── */
function NowCard({ eventMin }) {
  const active = findActiveRow(eventMin);
  let eyebrow = "Up next";
  let title = "Talks";
  let sub = "We start at 10:00. Use this time to get set up.";
  let extra = null;
  let isLive = false;

  if (eventMin < 0) {
    // Pre-event
    eyebrow = "Doors open soon";
    title = "Welcome — get yourself set up";
    sub = "We kick off at 10:00 sharp. WiFi + ChatGPT setup is Step 1 below.";
    extra = `Starts in ${formatCountdown(-eventMin)}`;
  } else if (active === -1 && eventMin >= 130) {
    eyebrow = "All wrapped";
    title = "Thanks for spending the morning with us";
    sub = "Don't forget the 5-minute survey before you go.";
    isLive = false;
  } else if (active >= 0) {
    const row = SCHEDULE[active];
    eyebrow = "Right now";
    title = row.title;
    sub = `${row.what} · ${row.where}`;
    const minsLeft = row.end - eventMin;
    extra = `Wraps at ${row.end_label} · ${minsLeft} min left`;
    isLive = true;
  }

  return (
    <aside className={`now ${isLive ? 'is-live' : ''}`}>
      <div className="now-eyebrow"><span className="now-dot"/> {eyebrow}</div>
      <h2 className="now-title">{title}</h2>
      <p className="now-sub">{sub}</p>
      {extra && <div className="now-countdown">{extra}</div>}
    </aside>
  );
}

/* ─────────────────────────────────────────────
   Top bar
───────────────────────────────────────────── */
function TopBar({ eventMin }) {
  const [clock, setClock] = useState(() => liveClockString());
  useEffect(() => {
    const id = setInterval(() => setClock(liveClockString()), 1000 * 30);
    return () => clearInterval(id);
  }, []);
  return (
    <header className="topbar">
      <div className="topbar-emblem" aria-hidden="true"/>
      <div className="topbar-text">
        <div className="topbar-where">Cleveland Public Library</div>
        <div className="topbar-branch">Martin Luther King Jr. Branch</div>
      </div>
      <div className="topbar-time">{clock}</div>
    </header>
  );
}
function liveClockString() {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }).format(new Date());
  } catch { return ''; }
}

/* ─────────────────────────────────────────────
   Hero
───────────────────────────────────────────── */
function Hero() {
  return (
    <section className="hero">
      <div className="hero-eyebrow">A Workshop · {EVENT_DATE_LABEL}</div>
      <h1 className="hero-title">Cleveland uses AI.<br/><em>So can you.</em></h1>
      <div className="hero-meta">
        <div><strong>Saturday, May 23 · 10:00am – 12:00pm</strong></div>
        <div>MLK Jr. Branch · Main room</div>
      </div>
      <p className="hero-welcome">
        Welcome! Glad you're here. This page is your map for the next two hours. Take 5–10 minutes now to get set up, then settle in.
      </p>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Step 1 — Get Set Up
───────────────────────────────────────────── */
function Step1() {
  return (
    <section className="step">
      <div className="step-label">
        <div className="step-num">1</div>
        <div>
          <div className="step-kicker">Do this now</div>
          <div className="step-title">Get set up</div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="card-icon is-denim"><Icon.wifi/></div>
          <h3 className="card-title">Connect to WiFi</h3>
        </div>
        <div className="wifi-row">
          <div className="wifi-label">Network</div>
          <div className="wifi-value">CPL-MLK</div>
          <div className="wifi-label">Password</div>
          <div className="wifi-value is-empty">none — just connect</div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="card-icon"><Icon.sparkle/></div>
          <h3 className="card-title">Create a free ChatGPT account</h3>
        </div>
        <p>You'll use this in the hands-on hour. Two ways:</p>

        <div className="cta-stack">
          <a className="cta" href="https://apps.apple.com/app/chatgpt/id6448311069" target="_blank" rel="noopener">
            <span className="cta-icon"><Icon.download/></span>
            <span className="cta-text">
              Install ChatGPT — iPhone
              <span className="cta-small">App Store → tap Sign Up</span>
            </span>
            <span className="cta-arrow"><Icon.arrow/></span>
          </a>
          <a className="cta" href="https://play.google.com/store/apps/details?id=com.openai.chatgpt" target="_blank" rel="noopener">
            <span className="cta-icon"><Icon.download/></span>
            <span className="cta-text">
              Install ChatGPT — Android
              <span className="cta-small">Google Play → tap Sign Up</span>
            </span>
            <span className="cta-arrow"><Icon.arrow/></span>
          </a>
          <a className="cta is-secondary" href="https://chat.openai.com" target="_blank" rel="noopener">
            <span className="cta-text">
              Use it in your browser instead
              <span className="cta-small" style={{opacity: 0.7}}>chat.openai.com</span>
            </span>
            <span className="cta-arrow"><Icon.arrow/></span>
          </a>
        </div>

        <p style={{marginTop: 14, fontSize: 14, color: 'var(--fg-2)'}}>
          Use an email you can check today — you'll need to confirm a verification link. <strong style={{color: 'var(--cpl-navy-ink)'}}>Already have an account?</strong> You're done — just sign in.
        </p>

        <div className="fallback">
          <h4 className="fallback-h">No email, or stuck setting it up?</h4>
          <p><strong>Buddy up with the person next to you</strong> and share their screen during the hands-on portion. We may also have a shared library account — ask Jungu or any volunteer.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div className="card-icon is-plum"><Icon.laptop/></div>
          <h3 className="card-title">A note on devices</h3>
        </div>
        <p>
          We have <strong>10–20 Chromebooks</strong> for patrons who'd rather not use their phone. With ~40 of you here, expect to share between 2–3 people.
        </p>
        <p style={{fontStyle: 'italic', fontFamily: 'var(--font-serif)', color: 'var(--fg-2)', fontSize: 15}}>
          Bring a friendly attitude — half the fun is figuring it out together.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Schedule
───────────────────────────────────────────── */
function Schedule({ eventMin }) {
  const active = findActiveRow(eventMin);

  return (
    <section className="step bg-paper" style={{marginTop: 12, paddingTop: 36, paddingBottom: 28}}>
      <div className="step-label">
        <div className="step-num" style={{color: 'var(--cpl-marigold)'}}>2</div>
        <div>
          <div className="step-kicker">Today</div>
          <div className="step-title">The schedule</div>
        </div>
      </div>

      <div className="schedule">
        {SCHEDULE.map((row, i) => {
          const cls = i === active ? 'is-now' : (eventMin >= row.end ? 'is-done' : '');
          return (
            <div key={i} className={`sched-row ${cls}`}>
              <div className="sched-time">
                {row.time}
                <small>→ {row.end_label}</small>
              </div>
              <div className="sched-what">
                <strong>{row.title}</strong>
                <div>{row.what}</div>
                <div className="sched-where"><Icon.pin/>{row.where}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="concierge">
        <div className="concierge-avatar">J</div>
        <p><strong>Jungu</strong> will be your concierge between sessions — follow him to your room at <strong>11:00</strong>.</p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Step 3 — Pick a room (numbered 3 to match the document flow)
───────────────────────────────────────────── */
function Rooms() {
  return (
    <section className="step">
      <div className="step-label">
        <div className="step-num" style={{color: 'var(--cpl-coral)'}}>3</div>
        <div>
          <div className="step-kicker">Hands-on hour · 11:00 – 12:00</div>
          <div className="step-title">Pick your room</div>
        </div>
      </div>

      <p className="rooms-intro">
        Both rooms are friendly to beginners. Pick the one that pulls you in. We'll do a show of hands at <strong>10:50</strong> — first come, first served if a room fills up.
      </p>

      <article className="room room-a">
        <div className="room-banner">
          <span className="room-letter" aria-hidden="true">A</span>
          <div className="room-eyebrow">Room A</div>
          <h3 className="room-name">Prompt Engineering Fundamentals</h3>
          <div className="room-leads">Led by Don & Sara</div>
        </div>
        <div className="room-best">
          <strong>Best for</strong>
          People brand new to AI who want practical prompt skills they can carry into work and life.
        </div>
        <div className="room-body">
          <h4>What we'll cover</h4>
          <ul>
            <li>How LLMs actually work — the <strong>probabilistic side</strong>, in plain English</li>
            <li>Account setup help (Claude or ChatGPT) if you're still getting started</li>
            <li>A simple <strong>prompt framework</strong> — we show, you try, share if you want</li>
            <li><span className="room-feature">"Let AI interview you"</span> — turn the questions around for once</li>
            <li>Q&amp;A and bonus topics if time allows</li>
          </ul>
        </div>
      </article>

      <article className="room room-b">
        <div className="room-banner">
          <span className="room-letter" aria-hidden="true">B</span>
          <div className="room-eyebrow">Room B</div>
          <h3 className="room-name">Everyday AI for Real Life</h3>
          <div className="room-leads">Led by Jason</div>
        </div>
        <div className="room-best">
          <strong>Best for</strong>
          People who want to see AI applied across household, family, work, and creative tasks.
        </div>
        <div className="room-body">
          <h4>Foundations &amp; safety</h4>
          <ul>
            <li>What AI is, what it isn't, hallucinations</li>
            <li>The <strong>golden privacy rule</strong> — never paste passwords or sensitive financial / medical info</li>
          </ul>

          <h4>Managing the household</h4>
          <ul>
            <li><span className="room-feature">"Magic Fridge"</span> — photo your ingredients, get meal ideas</li>
            <li>Aisle-by-aisle grocery lists; a family weekend planner</li>
          </ul>

          <h4>Clarity &amp; communication</h4>
          <ul>
            <li><span className="room-feature">Jargon Buster</span> for legal &amp; insurance docs</li>
            <li><span className="room-feature">Polite Reply Writer</span> for tricky emails</li>
            <li><span className="room-feature">Socratic Study Buddy</span> for kids</li>
          </ul>

          <h4>Career advancement</h4>
          <ul>
            <li>Resume vs. job-description gap analysis</li>
            <li>Mock interviews; AI headshots</li>
          </ul>

          <h4>Creativity &amp; visuals</h4>
          <ul>
            <li>Build a lo-fi YouTube track from scratch (Nano Banana + Suno)</li>
            <li>Peek at next-gen AI web interfaces</li>
          </ul>

          <h4>Open lab</h4>
          <ul>
            <li>Q&amp;A; test your favorite prompt of the day</li>
          </ul>
        </div>
      </article>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Survey
───────────────────────────────────────────── */
function Survey() {
  return (
    <section className="step">
      <div className="step-label">
        <div className="step-num" style={{color: 'var(--cpl-ivy)'}}>4</div>
        <div>
          <div className="step-kicker">One last thing</div>
          <div className="step-title">5 minutes of honest feedback</div>
        </div>
      </div>

      <div className="survey">
        <h3 className="survey-h">Take the 5-minute exit survey</h3>
        <p>It directly shapes the next CPL AI workshop — and tells us whether to bring this to more branches.</p>
        <a
          className="cta is-gold"
          href="https://forms.office.com/Pages/ResponsePage.aspx?id=4GIkiTBmW02jEbkA_x5DN__S0NiQKcxDpxk8bO4FzDdUNjA0MDBISldaMVFBRjNKUk9FVEg1WTcxRC4u"
          target="_blank"
          rel="noopener"
          style={{marginTop: 14}}
        >
          <span className="cta-text">
            Open the survey
            <span className="cta-small">forms.office.com · ~5 minutes</span>
          </span>
          <span className="cta-arrow"><Icon.arrow/></span>
        </a>
        <p style={{marginTop: 14}}><strong>Thank you</strong> for spending your Saturday morning here. — The MLK Branch team</p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Footer
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-emblem"/>
      <p className="footer-name">Cleveland Public Library</p>
      <div className="footer-tag">The People's University</div>
      <address className="footer-addr">
        Martin Luther King Jr. Branch<br/>
        1962 Stokes Boulevard · Cleveland, OH 44106
      </address>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   Tweaks
───────────────────────────────────────────── */
const SIMULATE_OPTIONS = [
  { label: 'Live (real time)',         value: 'live' },
  { label: 'Before event',             value: -30 },
  { label: '10:15 — Talks',            value: 15 },
  { label: '10:55 — Show of hands',    value: 55 },
  { label: '11:30 — Hands-on hour',    value: 90 },
  { label: '12:05 — Survey + farewell', value: 125 },
  { label: 'After event',              value: 140 },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "textScale": 1.0,
  "theme": "default",
  "simulate": "live"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply text scale + theme to document
  useEffect(() => {
    document.documentElement.style.setProperty('--base-fs', `${17 * t.textScale}px`);
  }, [t.textScale]);
  useEffect(() => {
    document.body.className = `theme-${t.theme}`;
  }, [t.theme]);

  // Compute event minutes; re-tick every 30s on live mode
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (t.simulate !== 'live') return;
    const id = setInterval(() => setTick(x => x + 1), 30000);
    return () => clearInterval(id);
  }, [t.simulate]);

  const eventMin = useMemo(() => {
    if (t.simulate === 'live') return getEventMinutes(null);
    return getEventMinutes(t.simulate);
  }, [t.simulate, tick]);

  return (
    <div className="page">
      <TopBar/>
      <Hero/>
      <NowCard eventMin={eventMin}/>
      <Step1/>
      <Schedule eventMin={eventMin}/>
      <Rooms/>
      <Survey/>
      <Footer/>

      <TweaksPanel>
        <TweakSection label="Accessibility"/>
        <TweakRadio
          label="Text size"
          value={t.textScale}
          options={[
            { value: 1.0,  label: 'Default' },
            { value: 1.15, label: 'Large' },
            { value: 1.3,  label: 'X-Large' },
          ]}
          onChange={(v) => setTweak('textScale', v)}
        />
        <TweakSection label="Theme"/>
        <TweakRadio
          label="Hero style"
          value={t.theme}
          options={[
            { value: 'default', label: 'Parchment' },
            { value: 'butter',  label: 'Butter' },
            { value: 'quiet',   label: 'Quiet' },
          ]}
          onChange={(v) => setTweak('theme', v)}
        />
        <TweakSection label="Preview event time"/>
        <TweakSelect
          label="Simulate"
          value={t.simulate}
          options={SIMULATE_OPTIONS}
          onChange={(v) => setTweak('simulate', v === 'live' ? 'live' : Number(v))}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
