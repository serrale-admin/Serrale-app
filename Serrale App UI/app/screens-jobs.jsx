// SERRALE — Jobs list, Job Detail, Send Proposal
const { PhoneShell: PhS2, PrimaryButton: PB2, SecondaryButton: SB2,
  AppHeader: AH2, BottomNav: BN2, MatchBadge: MB2, Photo: Ph2 } = window.SerraleUI;
const SI2 = window.SerraleIcons;
const SC2 = window.SERRALE.colors;
const SH2 = window.SERRALE.shadows;
const { JOBS: JB2 } = window.SerraleData;
const { JobCardSmall: JCS, fmtETB: fmtETB2 } = window.SerraleHome;

// ─── JOBS LIST ─────────────────────────────────────────
function JobsScreen({ onNav = () => {}, onJob = () => {} }) {
  const [filter, setFilter] = React.useState('Best Match');
  const filters = ['All', 'Best Match', 'Nearby', 'Remote', 'New', 'High Budget'];
  return (
    <PhS2>
      <div style={{ paddingTop: 54, padding: '54px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 50 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: SC2.navy, letterSpacing: -0.6 }}>Jobs</div>
          <button style={{
            width: 42, height: 42, borderRadius: 12, border: `1px solid ${SC2.border}`,
            background: '#fff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <SI2.IconBell size={18} color={SC2.title} />
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
        <div style={{ padding: '14px 20px 0', display: 'flex', gap: 10 }}>
          <div style={{
            flex: 1, height: 48, borderRadius: 14, background: '#fff',
            border: `1px solid ${SC2.border}`, display: 'flex', alignItems: 'center',
            padding: '0 14px', gap: 10,
          }}>
            <SI2.IconSearch size={18} color={SC2.muted} />
            <span style={{ fontSize: 14, color: SC2.muted }}>Search jobs…</span>
          </div>
          <button style={{
            width: 48, height: 48, borderRadius: 14, background: '#fff',
            border: `1px solid ${SC2.border}`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SI2.IconFilter size={18} color={SC2.title} />
          </button>
        </div>

        {/* Filter chips */}
        <div style={{
          padding: '14px 20px', display: 'flex', gap: 8, overflowX: 'auto', flexWrap: 'nowrap',
        }}>
          {filters.map(f => {
            const a = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                flexShrink: 0, padding: '9px 16px', borderRadius: 999,
                border: a ? 'none' : `1.5px solid ${SC2.border}`,
                background: a ? SC2.blue : '#fff',
                color: a ? '#fff' : SC2.body,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: window.SERRALE.font,
              }}>{f}</button>
            );
          })}
        </div>

        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: SC2.muted, marginBottom: -2 }}>
            {JB2.length * 4} jobs available
          </div>
          {[...JB2, ...JB2].map((j, i) => <JCS key={i} job={j} onOpen={() => onJob(j.id)} />)}
        </div>
      </div>
      <BN2 active="jobs" onChange={onNav} />
    </PhS2>
  );
}

// ─── JOB DETAIL ────────────────────────────────────────
function JobDetailScreen({ jobId = 'j1', onBack = () => {}, onApply = () => {} }) {
  const job = JB2.find(j => j.id === jobId) || JB2[0];
  const [saved, setSaved] = React.useState(false);
  return (
    <PhS2>
      <div style={{
        position: 'absolute', top: 54, left: 20, right: 20, zIndex: 20,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{
          width: 42, height: 42, borderRadius: 14, border: `1px solid ${SC2.border}`,
          background: '#fff', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', boxShadow: SH2.card,
        }}>
          <SI2.IconChevronLeft size={20} color={SC2.title} />
        </button>
        <button onClick={() => setSaved(s => !s)} style={{
          width: 42, height: 42, borderRadius: 14, border: `1px solid ${SC2.border}`,
          background: '#fff', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', boxShadow: SH2.card,
        }}>
          {saved ? <SI2.IconBookmarkFilled size={18} color={SC2.blue} /> : <SI2.IconBookmark size={18} color={SC2.title} />}
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', paddingTop: 110, paddingBottom: 110 }}>
        <div style={{ padding: '0 20px' }}>
          {/* Match strip */}
          <MB2 pct={job.match} />
          <div style={{
            fontSize: 24, fontWeight: 900, color: SC2.navy, letterSpacing: -0.5,
            lineHeight: 1.2, marginTop: 12,
          }}>{job.title}</div>

          {/* Client */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: job.catBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, color: job.catColor, fontSize: 14,
            }}>{job.client.slice(0, 2).toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: SC2.navy, display: 'flex', alignItems: 'center', gap: 6 }}>
                {job.client}
                {job.clientVerified && <SI2.IconShieldCheck size={14} color={SC2.successGreen} />}
              </div>
              <div style={{ fontSize: 12, color: SC2.muted }}>Verified client · {job.location}</div>
            </div>
          </div>

          {/* Stat row */}
          <div style={{
            marginTop: 18, background: '#fff', borderRadius: 20, padding: 16,
            boxShadow: SH2.card, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
          }}>
            <Stat icon={<SI2.IconWallet size={16} color={SC2.blue} />} label="Budget" value={`ETB ${(job.budgetMin/1000)}–${(job.budgetMax/1000)}k`} />
            <Stat icon={<SI2.IconCalendar size={16} color={SC2.purple} />} label="Timeline" value={job.timeline} />
            <Stat icon={<SI2.IconDoc size={16} color={SC2.warningOrange} />} label="Proposals" value={`${job.proposals} sent`} />
          </div>

          <Section title="Project Overview">
            <div style={{ fontSize: 14, color: SC2.body, lineHeight: 1.6 }}>
              {job.description}
            </div>
          </Section>

          <Section title="Skills Needed">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {job.skills.map(s => (
                <span key={s} style={{
                  padding: '8px 14px', borderRadius: 999,
                  background: SC2.softCard, color: SC2.blue,
                  fontSize: 12, fontWeight: 700,
                }}>{s}</span>
              ))}
            </div>
          </Section>

          <Section title="Requirements">
            <ul style={{
              fontSize: 14, color: SC2.body, lineHeight: 1.7,
              paddingLeft: 0, margin: 0, listStyle: 'none',
            }}>
              {[
                'Portfolio of recent brand work',
                'Available to start within 1 week',
                '2+ rounds of revisions included',
                'Provide source files (.ai / .fig)',
              ].map((r, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <SI2.IconCheck size={16} color={SC2.successGreen} strokeWidth={2.5} style={{ marginTop: 4, flexShrink: 0 }} />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="About the client">
            <div style={{ fontSize: 14, color: SC2.body, lineHeight: 1.6 }}>
              Buna House is a new specialty coffee concept based in Bole, opening 3 locations in 2026. The team values local craftsmanship and modern design.
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 12, color: SC2.muted }}>
              <span>★ 4.8 rating</span>
              <span>· 6 hires</span>
              <span>· Member since 2024</span>
            </div>
          </Section>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${SC2.border}`, padding: '14px 20px 28px',
        display: 'flex', gap: 10, zIndex: 50,
      }}>
        <SB2 full={false} style={{ flex: 0, padding: '0 18px' }}>Save</SB2>
        <PB2 onClick={onApply} style={{ flex: 1 }}>Send Proposal</PB2>
      </div>
    </PhS2>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 700, color: SC2.muted, letterSpacing: 0.2 }}>{label.toUpperCase()}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: SC2.navy }}>{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontSize: 16, fontWeight: 900, color: SC2.navy, marginBottom: 10, letterSpacing: -0.2 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── SEND PROPOSAL ─────────────────────────────────────
function SendProposalScreen({ jobId = 'j1', onBack = () => {}, onSent = () => {} }) {
  const job = JB2.find(j => j.id === jobId) || JB2[0];
  const [msg, setMsg] = React.useState("Hello Buna House team,\n\nI'd love to bring your coffee brand to life. I've worked on hospitality identities for Tomoca and Garden of Coffee, focusing on warmth and Ethiopian heritage.\n\nMy proposal includes:\n· Logo system + 2 concepts\n· Color & typography guide\n· Packaging mockups\n\nLooking forward to chatting,\nSamuel");
  const [price, setPrice] = React.useState('10000');
  const [days, setDays] = React.useState('14');

  return (
    <PhS2>
      <div style={{ paddingTop: 54, padding: '54px 20px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${SC2.border}`, background: '#fff',
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 12, border: `1px solid ${SC2.border}`,
          background: '#fff', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <SI2.IconChevronLeft size={18} color={SC2.title} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: SC2.navy, letterSpacing: -0.3 }}>Send Proposal</div>
          <div style={{ fontSize: 12, color: SC2.muted }}>Tell the client why you're the right fit</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
        {/* Project mini card */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{
            background: SC2.softCard, borderRadius: 18, padding: 14,
            border: `1px solid ${SC2.border}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: SC2.muted, letterSpacing: 0.5 }}>APPLYING TO</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: SC2.navy, marginTop: 4, lineHeight: 1.3 }}>
              {job.title}
            </div>
            <div style={{ fontSize: 12, color: SC2.body, marginTop: 4 }}>
              {job.client} · {fmtETB2(job.budgetMin, job.budgetMax)}
            </div>
          </div>
        </div>

        {/* Cover message */}
        <div style={{ padding: '20px 20px 0' }}>
          <FieldLabel>Cover Message</FieldLabel>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} style={{
            width: '100%', minHeight: 180, padding: 14, borderRadius: 14,
            border: `1.5px solid ${SC2.border}`, background: '#fff',
            fontSize: 14, color: SC2.title, lineHeight: 1.5, resize: 'none',
            fontFamily: window.SERRALE.font, outline: 'none',
            boxSizing: 'border-box',
          }} />
          <div style={{ fontSize: 11, color: SC2.muted, marginTop: 4, textAlign: 'right' }}>
            {msg.length} / 1000
          </div>
        </div>

        {/* Price + days */}
        <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <FieldLabel>Your Price (ETB)</FieldLabel>
            <div style={fieldBox}>
              <SI2.IconWallet size={16} color={SC2.muted} />
              <input value={price} onChange={e => setPrice(e.target.value)} style={fieldInput} />
            </div>
          </div>
          <div>
            <FieldLabel>Delivery (days)</FieldLabel>
            <div style={fieldBox}>
              <SI2.IconClock size={16} color={SC2.muted} />
              <input value={days} onChange={e => setDays(e.target.value)} style={fieldInput} />
            </div>
          </div>
        </div>

        {/* Attachment */}
        <div style={{ padding: '20px 20px 0' }}>
          <FieldLabel>Attachments (optional)</FieldLabel>
          <button style={{
            width: '100%', padding: 16, borderRadius: 14,
            border: `1.5px dashed ${SC2.border}`, background: SC2.softCard,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: 'pointer', fontFamily: window.SERRALE.font,
          }}>
            <SI2.IconPaperclip size={18} color={SC2.blue} />
            <span style={{ fontSize: 13, fontWeight: 700, color: SC2.blue }}>
              Attach portfolio samples or brief
            </span>
          </button>
        </div>

        {/* Tips */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            background: SC2.successSoft, borderRadius: 16, padding: 14,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <SI2.IconSparkles size={18} color={SC2.successGreen} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: SC2.successGreen }}>Pro tip</div>
              <div style={{ fontSize: 12, color: SC2.body, marginTop: 2, lineHeight: 1.45 }}>
                Mention 1–2 similar projects you've completed to build instant trust.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${SC2.border}`, padding: '14px 20px 28px',
        display: 'flex', gap: 10,
      }}>
        <SB2 full={false} style={{ flex: 0, padding: '0 16px' }}>Review</SB2>
        <PB2 onClick={onSent} icon={<SI2.IconSend size={16} color="#fff" />} style={{ flex: 1 }}>
          Send Proposal
        </PB2>
      </div>
    </PhS2>
  );
}

function FieldLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 800, color: SC2.muted,
      letterSpacing: 0.4, marginBottom: 6,
    }}>{children.toUpperCase ? children.toUpperCase() : children}</div>
  );
}

const fieldBox = {
  height: 50, borderRadius: 14, background: '#fff',
  border: `1.5px solid ${SC2.border}`, display: 'flex', alignItems: 'center',
  padding: '0 14px', gap: 10,
};
const fieldInput = {
  flex: 1, border: 'none', outline: 'none', background: 'transparent',
  fontSize: 15, fontWeight: 700, color: SC2.title, fontFamily: window.SERRALE.font,
  width: '100%',
};

window.SerraleJobs = { JobsScreen, JobDetailScreen, SendProposalScreen };
