// SERRALE — Home, Jobs, Job Detail screens
const { PhoneShell: PhS, PrimaryButton: PB, SecondaryButton: SB, SoftButton: SfB,
  AppHeader: AH, BottomNav: BN, MatchBadge: MB, StatusBadge: SBg, Photo: Ph, SerraleMark: SM } = window.SerraleUI;
const SI = window.SerraleIcons;
const SC = window.SERRALE.colors;
const SH = window.SERRALE.shadows;
const SF = window.SERRALE.font;
const { PROVIDER: PR, JOBS: JB, PROPOSALS: PP } = window.SerraleData;

function fmtETB(min, max) {
  return `ETB ${min.toLocaleString()} – ${max.toLocaleString()}`;
}

// ─── HOME ─────────────────────────────────────────────────
function HomeScreen({ onNav = () => {}, onJob = () => {} }) {
  const [available, setAvailable] = React.useState(true);
  return (
    <PhS>
      <div style={{ paddingTop: 54 }}>
        <AH unread={2} avatarUrl={PR.avatar} />
      </div>
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
        {/* Greeting */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: SC.navy, letterSpacing: -0.6, lineHeight: 1.1 }}>
            Welcome back, {PR.firstName}
          </div>
          <div style={{ fontSize: 14, color: SC.body, marginTop: 6, lineHeight: 1.5 }}>
            Find opportunities, manage proposals, and grow your work.
          </div>
        </div>

        {/* Availability card */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: 16,
            display: 'flex', alignItems: 'center', gap: 14, boxShadow: SH.card,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: available ? SC.successSoft : SC.warningSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 12, height: 12, borderRadius: 6,
                background: available ? SC.successGreen : SC.warningOrange }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: SC.navy }}>
                {available ? 'Available for work' : 'Busy'}
              </div>
              <div style={{ fontSize: 12, color: SC.muted, marginTop: 2 }}>
                {available ? 'You are visible to potential clients.' : 'Clients can still view your profile.'}
              </div>
            </div>
            {/* toggle */}
            <button onClick={() => setAvailable(!available)} style={{
              width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
              background: available ? SC.blue : '#CBD5E1',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: available ? 23 : 3,
                width: 22, height: 22, borderRadius: 11, background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 20px 0', display: 'flex', gap: 10 }}>
          <div style={{
            flex: 1, height: 52, borderRadius: 16, background: '#fff',
            border: `1px solid ${SC.border}`, display: 'flex', alignItems: 'center',
            padding: '0 16px', gap: 10, boxShadow: SH.card,
          }}>
            <SI.IconSearch size={18} color={SC.muted} />
            <span style={{ fontSize: 14, color: SC.muted, flex: 1 }}>Search jobs, skills or services…</span>
          </div>
          <button style={{
            width: 52, height: 52, borderRadius: 16, background: '#fff',
            border: `1px solid ${SC.border}`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: SH.card,
          }}>
            <SI.IconFilter size={20} color={SC.title} />
          </button>
        </div>

        {/* Hero banner */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            height: 180, borderRadius: 26, overflow: 'hidden', position: 'relative',
            boxShadow: SH.elevated,
          }}>
            <Ph
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80&auto=format&fit=crop"
              style={{ position: 'absolute', inset: 0 }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(110deg, rgba(7,29,60,0.85) 0%, rgba(23,105,242,0.55) 60%, rgba(23,105,242,0.2) 100%)',
            }} />
            <div style={{ position: 'absolute', top: 22, left: 22, right: 22, color: '#fff' }}>
              <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.85, letterSpacing: 1.5 }}>
                COMMUNITY
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6, lineHeight: 1.15, letterSpacing: -0.4, maxWidth: 240 }}>
                Grow with Ethiopia's service community
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.92, marginTop: 6, maxWidth: 220 }}>
                Connect. Grow. Succeed together.
              </div>
            </div>
            <button onClick={() => onNav('jobs')} style={{
              position: 'absolute', bottom: 22, left: 22,
              padding: '12px 18px', borderRadius: 14, border: 'none',
              background: '#fff', color: SC.blue, fontSize: 14, fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            }}>
              Explore Jobs <SI.IconArrowRight size={16} color={SC.blue} />
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <SummaryCard icon={<SI.IconBriefcase size={20} color={SC.blue} />} bg={SC.sky}
            number="12" label="New Jobs" hint="Matching your skills" />
          <SummaryCard icon={<SI.IconDoc size={20} color={SC.purple} />} bg={SC.purpleSoft}
            number="4" label="Active Proposals" hint="In progress" />
          <SummaryCard icon={<SI.IconChat size={20} color={SC.successGreen} />} bg={SC.successSoft}
            number="3" label="Messages" hint="Unread" />
          <SummaryCard icon={<SI.IconRocket size={20} color={SC.warningOrange} />} bg={SC.warningSoft}
            number="80%" label="Profile" hint="Almost there" />
        </div>

        {/* Recommended Jobs */}
        <SectionHeader title="Recommended Jobs" actionLabel="View All" onAction={() => onNav('jobs')} />
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {JB.slice(0, 3).map(j => <JobCardSmall key={j.id} job={j} onOpen={() => onJob(j.id)} />)}
        </div>

        {/* Recent Proposals */}
        <SectionHeader title="Recent Proposals" actionLabel="View All" onAction={() => onNav('proposals')} />
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PP.slice(0, 2).map(p => <ProposalCardSmall key={p.id} proposal={p} />)}
        </div>

        {/* Profile tip */}
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{
            background: `linear-gradient(135deg, ${SC.blue} 0%, ${SC.blueDark} 100%)`,
            borderRadius: 24, padding: 20, color: '#fff', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -30, right: -30, width: 140, height: 140,
              borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
            }} />
            <div style={{
              position: 'absolute', top: 30, right: 20, width: 60, height: 60,
              borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SI.IconRocket size={28} color="#fff" />
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.85, letterSpacing: 1.2 }}>
              PROFILE COMPLETION · 80%
            </div>
            <div style={{ fontSize: 19, fontWeight: 900, marginTop: 8, lineHeight: 1.2, letterSpacing: -0.4, maxWidth: 230 }}>
              Complete your profile to get more visibility
            </div>
            <div style={{ fontSize: 13, opacity: 0.92, marginTop: 6, maxWidth: 240, lineHeight: 1.45 }}>
              Add portfolio items, services, and pricing to increase trust.
            </div>
            <button style={{
              marginTop: 16, padding: '11px 18px', borderRadius: 12, border: 'none',
              background: '#fff', color: SC.blue, fontSize: 14, fontWeight: 800, cursor: 'pointer',
            }}>Improve Profile</button>
          </div>
        </div>
      </div>
      <BN active="home" onChange={onNav} />
    </PhS>
  );
}

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <div style={{
      padding: '24px 20px 14px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ fontSize: 18, fontWeight: 900, color: SC.navy, letterSpacing: -0.3 }}>{title}</div>
      {actionLabel && (
        <button onClick={onAction} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 800, color: SC.blue,
        }}>{actionLabel}</button>
      )}
    </div>
  );
}

function SummaryCard({ icon, bg, number, label, hint }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 22, padding: 14,
      boxShadow: SH.card, display: 'flex', flexDirection: 'column', gap: 8,
      minHeight: 118,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 11, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: SC.navy, letterSpacing: -0.6, marginTop: 2 }}>
        {number}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: SC.title }}>{label}</div>
        <div style={{ fontSize: 11, color: SC.muted, marginTop: 1 }}>{hint}</div>
      </div>
    </div>
  );
}

function JobCardSmall({ job, onOpen }) {
  const [saved, setSaved] = React.useState(false);
  return (
    <div style={{
      background: '#fff', borderRadius: 22, padding: 16,
      boxShadow: SH.card, position: 'relative',
    }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: job.catBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <CategoryIcon cat={job.category} color={job.catColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 800, color: SC.navy, lineHeight: 1.3,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{job.title}</div>
          <div style={{ fontSize: 12, color: SC.body, marginTop: 4, fontWeight: 600 }}>
            {job.client}
            {job.clientVerified && (
              <SI.IconShieldCheck size={12} color={SC.successGreen} style={{ marginLeft: 4, verticalAlign: 'text-top' }} />
            )}
            <span style={{ color: SC.light, margin: '0 6px' }}>·</span>
            <span style={{ color: job.catColor }}>{job.category}</span>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setSaved(s => !s); }} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        }}>
          {saved ? <SI.IconBookmarkFilled size={18} color={SC.blue} /> : <SI.IconBookmark size={18} color={SC.muted} />}
        </button>
      </div>

      <div style={{ fontSize: 15, fontWeight: 800, color: SC.blue, letterSpacing: -0.2 }}>
        {fmtETB(job.budgetMin, job.budgetMax)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
        <span style={{ fontSize: 12, color: SC.muted, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <SI.IconMapPin size={13} color={SC.muted} />
          {job.location}
        </span>
        <span style={{ fontSize: 12, color: SC.muted, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <SI.IconClock size={13} color={SC.muted} />
          {job.posted}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <MB pct={job.match} />
        <button onClick={onOpen} style={{
          padding: '10px 16px', borderRadius: 12, border: 'none',
          background: SC.blue, color: '#fff', fontSize: 13, fontWeight: 800,
          cursor: 'pointer', boxShadow: SH.button,
        }}>View Job</button>
      </div>
    </div>
  );
}

function CategoryIcon({ cat, color }) {
  if (cat === 'Design') return <SI.IconImage size={20} color={color} />;
  if (cat === 'Photography') return <SI.IconImage size={20} color={color} />;
  if (cat === 'Development') return <SI.IconTools size={20} color={color} />;
  return <SI.IconBriefcase size={20} color={color} />;
}

function ProposalCardSmall({ proposal }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 22, padding: 16, boxShadow: SH.card,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: SC.navy, lineHeight: 1.35, flex: 1 }}>
          {proposal.project}
        </div>
        <SBg status={proposal.status} />
      </div>
      <div style={{ fontSize: 12, color: SC.muted, marginBottom: 4 }}>
        {proposal.client} · {proposal.budget}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: 12, color: SC.body }}>{proposal.update}</span>
        <span style={{ fontSize: 11, color: SC.light, fontWeight: 600 }}>{proposal.submitted}</span>
      </div>
    </div>
  );
}

window.SerraleHome = { HomeScreen, JobCardSmall, ProposalCardSmall, SummaryCard, SectionHeader, CategoryIcon, fmtETB };
