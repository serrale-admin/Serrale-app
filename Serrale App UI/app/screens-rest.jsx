// SERRALE — Proposals, Messages, Chat, Profile
const { PhoneShell: PS3, PrimaryButton: PB3, SecondaryButton: SB3,
  AppHeader: AH3, BottomNav: BN3, StatusBadge: SBg3, Photo: Ph3 } = window.SerraleUI;
const SI3 = window.SerraleIcons;
const SC3 = window.SERRALE.colors;
const SH3 = window.SERRALE.shadows;
const SF3 = window.SERRALE.font;
const { PROPOSALS: PP3, MESSAGES: MS3, CHAT: CH3, PROVIDER: PR3 } = window.SerraleData;

// ─── PROPOSALS ─────────────────────────────────────────
function ProposalsScreen({ onNav = () => {} }) {
  const [filter, setFilter] = React.useState('All');
  const filters = ['All', 'Pending', 'Viewed', 'Shortlisted', 'Won'];
  const stats = [
    { label: 'Active', value: 4, color: SC3.blue },
    { label: 'Viewed', value: 7, color: SC3.successGreen },
    { label: 'Shortlist', value: 2, color: SC3.purple },
    { label: 'Won', value: 12, color: SC3.successGreen },
  ];
  return (
    <PS3>
      <div style={{ paddingTop: 54, padding: '54px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 50 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: SC3.navy, letterSpacing: -0.6 }}>Proposals</div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
        {/* Stats grid */}
        <div style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 16, padding: '12px 8px',
              boxShadow: SH3.card, textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, letterSpacing: -0.4 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: SC3.muted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div style={{ padding: '14px 20px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {filters.map(f => {
            const a = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 999,
                border: a ? 'none' : `1.5px solid ${SC3.border}`,
                background: a ? SC3.blue : '#fff',
                color: a ? '#fff' : SC3.body,
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: SF3,
              }}>{f}</button>
            );
          })}
        </div>

        {/* Proposal list */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...PP3, ...PP3].map((p, i) => <ProposalCard key={i} proposal={p} />)}
        </div>
      </div>
      <BN3 active="proposals" onChange={onNav} />
    </PS3>
  );
}

function ProposalCard({ proposal }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 22, padding: 16, boxShadow: SH3.card,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: SC3.navy, lineHeight: 1.3 }}>
            {proposal.project}
          </div>
          <div style={{ fontSize: 12, color: SC3.muted, marginTop: 4 }}>
            {proposal.client}
          </div>
        </div>
        <SBg3 status={proposal.status} />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 8, paddingTop: 12, borderTop: `1px solid ${SC3.border}`,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: SC3.blue }}>{proposal.budget}</div>
          <div style={{ fontSize: 11, color: SC3.muted, marginTop: 2 }}>Submitted {proposal.submitted}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            padding: '8px 12px', borderRadius: 10, border: `1px solid ${SC3.border}`,
            background: '#fff', color: SC3.blue, fontSize: 12, fontWeight: 800, cursor: 'pointer',
          }}>Message</button>
          <button style={{
            padding: '8px 14px', borderRadius: 10, border: 'none',
            background: SC3.blue, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer',
          }}>View</button>
        </div>
      </div>
      <div style={{ fontSize: 11, color: SC3.body, marginTop: 8, fontStyle: 'italic' }}>
        {proposal.update}
      </div>
    </div>
  );
}

// ─── MESSAGES LIST ─────────────────────────────────────
function MessagesScreen({ onNav = () => {}, onChat = () => {} }) {
  return (
    <PS3>
      <div style={{ paddingTop: 54, padding: '54px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 50 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: SC3.navy, letterSpacing: -0.6 }}>Messages</div>
          <button style={{
            width: 42, height: 42, borderRadius: 12, border: `1px solid ${SC3.border}`,
            background: '#fff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <SI3.IconSearch size={18} color={SC3.title} />
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
        <div style={{ padding: '14px 20px 0', display: 'flex', gap: 8 }}>
          {['All', 'Unread', 'Active'].map((f, i) => (
            <button key={f} style={{
              padding: '8px 14px', borderRadius: 999,
              border: i === 0 ? 'none' : `1.5px solid ${SC3.border}`,
              background: i === 0 ? SC3.blue : '#fff',
              color: i === 0 ? '#fff' : SC3.body,
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: SF3,
            }}>{f}</button>
          ))}
        </div>
        <div style={{ padding: '14px 0 0' }}>
          {MS3.map(m => (
            <button key={m.id} onClick={() => onChat(m.id)} style={{
              width: '100%', padding: '14px 20px', display: 'flex', gap: 12,
              border: 'none', background: 'transparent', cursor: 'pointer',
              alignItems: 'flex-start', textAlign: 'left',
              borderBottom: `1px solid ${SC3.border}`,
              fontFamily: SF3,
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: 25, background: m.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: m.fg, fontSize: 15, fontWeight: 900, flexShrink: 0,
              }}>{m.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: SC3.navy }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: SC3.muted, fontWeight: 600, flexShrink: 0 }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: SC3.blue, marginTop: 2 }}>{m.project}</div>
                <div style={{
                  fontSize: 13, color: SC3.body, marginTop: 4,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontWeight: m.unread > 0 ? 700 : 400,
                }}>{m.last}</div>
              </div>
              {m.unread > 0 && (
                <div style={{
                  width: 22, height: 22, borderRadius: 11, background: SC3.blue,
                  color: '#fff', fontSize: 11, fontWeight: 800, marginTop: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{m.unread}</div>
              )}
            </button>
          ))}
        </div>
      </div>
      <BN3 active="messages" onChange={onNav} />
    </PS3>
  );
}

// ─── CHAT ──────────────────────────────────────────────
function ChatScreen({ chatId = 'm1', onBack = () => {} }) {
  const m = MS3.find(x => x.id === chatId) || MS3[0];
  const [text, setText] = React.useState('');
  return (
    <PS3>
      {/* Header */}
      <div style={{
        paddingTop: 54, padding: '54px 16px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#fff', borderBottom: `1px solid ${SC3.border}`,
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 12, border: 'none', background: 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SI3.IconChevronLeft size={20} color={SC3.title} />
        </button>
        <div style={{
          width: 38, height: 38, borderRadius: 19, background: m.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: m.fg, fontSize: 13, fontWeight: 900,
        }}>{m.initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: SC3.navy }}>{m.name}</div>
          <div style={{ fontSize: 11, color: SC3.successGreen, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: SC3.successGreen }} />
            Online
          </div>
        </div>
      </div>

      {/* Project context card */}
      <div style={{ padding: '12px 16px 0', background: '#fff' }}>
        <div style={{
          background: SC3.softCard, borderRadius: 14, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <SI3.IconBriefcase size={16} color={SC3.blue} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: SC3.muted }}>PROJECT</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: SC3.navy }}>{m.project}</div>
          </div>
          <SI3.IconChevronRight size={16} color={SC3.muted} />
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 16px',
        display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ textAlign: 'center', fontSize: 11, color: SC3.muted, fontWeight: 600, marginBottom: 4 }}>
          Today
        </div>
        {CH3.map(c => (
          <div key={c.id} style={{
            display: 'flex', justifyContent: c.from === 'me' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{ maxWidth: '78%' }}>
              <div style={{
                padding: '10px 14px',
                borderRadius: c.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: c.from === 'me' ? SC3.blue : '#fff',
                color: c.from === 'me' ? '#fff' : SC3.title,
                fontSize: 14, lineHeight: 1.4,
                boxShadow: c.from === 'me' ? 'none' : SH3.card,
              }}>{c.text}</div>
              <div style={{
                fontSize: 10, color: SC3.muted, marginTop: 4,
                textAlign: c.from === 'me' ? 'right' : 'left',
              }}>{c.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 14px 30px', background: '#fff',
        borderTop: `1px solid ${SC3.border}`, display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <button style={{
          width: 40, height: 40, borderRadius: 20, border: 'none',
          background: SC3.softCard, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SI3.IconPaperclip size={18} color={SC3.blue} />
        </button>
        <div style={{
          flex: 1, height: 44, borderRadius: 22, background: SC3.softCard,
          display: 'flex', alignItems: 'center', padding: '0 16px',
        }}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 14, color: SC3.title, fontFamily: SF3,
            }} />
        </div>
        <button style={{
          width: 44, height: 44, borderRadius: 22, border: 'none',
          background: SC3.blue, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: SH3.button,
        }}>
          <SI3.IconSend size={18} color="#fff" />
        </button>
      </div>
    </PS3>
  );
}

// ─── PROFILE ───────────────────────────────────────────
function ProfileScreen({ onNav = () => {} }) {
  const stats = [
    { label: 'Jobs', value: PR3.jobsCompleted },
    { label: 'Reviews', value: PR3.reviews },
    { label: 'Success', value: `${PR3.successRate}%` },
    { label: 'Earnings', value: PR3.earnings },
  ];
  const menu = [
    { Icon: SI3.IconBriefcase, label: 'Business Profile', sub: 'Public details, bio, services', color: SC3.blue, bg: SC3.sky },
    { Icon: SI3.IconImage, label: 'Portfolio', sub: '8 items · last edit 3d ago', color: SC3.purple, bg: SC3.purpleSoft },
    { Icon: SI3.IconTools, label: 'Services & Skills', sub: '12 skills · 5 services', color: SC3.successGreen, bg: SC3.successSoft },
    { Icon: SI3.IconCalendar, label: 'Availability', sub: 'Open weekdays', color: SC3.warningOrange, bg: SC3.warningSoft },
    { Icon: SI3.IconWallet, label: 'Pricing & Payouts', sub: 'Bank · Telebirr', color: SC3.teal, bg: SC3.tealSoft },
    { Icon: SI3.IconBell, label: 'Notifications', color: SC3.muted, bg: SC3.softCard },
    { Icon: SI3.IconShield, label: 'Security', color: SC3.muted, bg: SC3.softCard },
    { Icon: SI3.IconHelp, label: 'Help & Support', color: SC3.muted, bg: SC3.softCard },
    { Icon: SI3.IconSettings, label: 'App Preferences', color: SC3.muted, bg: SC3.softCard },
    { Icon: SI3.IconLogout, label: 'Log Out', color: SC3.dangerRed, bg: SC3.dangerSoft, danger: true },
  ];

  return (
    <PS3>
      <div style={{ paddingTop: 54, padding: '54px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 50 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: SC3.navy, letterSpacing: -0.6 }}>Profile</div>
          <button style={{
            width: 42, height: 42, borderRadius: 12, border: `1px solid ${SC3.border}`,
            background: '#fff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <SI3.IconSettings size={18} color={SC3.title} />
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
        {/* Profile header card */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{
            background: '#fff', borderRadius: 24, padding: 18, boxShadow: SH3.card,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: 140, height: 140,
              background: `radial-gradient(circle at top right, ${SC3.sky} 0%, transparent 70%)`,
            }} />
            <div style={{ display: 'flex', gap: 14, position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <Ph3 src={PR3.avatar} style={{
                  width: 78, height: 78, borderRadius: 24, border: `3px solid #fff`,
                  boxShadow: SH3.card,
                }} />
                <div style={{
                  position: 'absolute', bottom: 0, right: 0, width: 22, height: 22,
                  borderRadius: 11, background: SC3.successGreen, border: '3px solid #fff',
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 17, fontWeight: 900, color: SC3.navy }}>{PR3.name}</span>
                  <SI3.IconShieldCheck size={16} color={SC3.successGreen} />
                </div>
                <div style={{ fontSize: 12, color: SC3.body, marginTop: 2, fontWeight: 600 }}>
                  {PR3.specialty}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <SI3.IconStarFilled size={14} color={SC3.warningOrange} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: SC3.navy }}>{PR3.rating}</span>
                    <span style={{ fontSize: 11, color: SC3.muted }}>({PR3.reviews})</span>
                  </span>
                  <span style={{ fontSize: 11, color: SC3.muted, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <SI3.IconMapPin size={11} color={SC3.muted} />
                    {PR3.location}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8, paddingTop: 14, borderTop: `1px solid ${SC3.border}`,
            }}>
              {stats.map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: SC3.navy, letterSpacing: -0.3 }}>{s.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: SC3.muted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile completion */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{
            background: '#fff', borderRadius: 18, padding: 14, boxShadow: SH3.card,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ position: 'relative', width: 48, height: 48 }}>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke={SC3.sky} strokeWidth="4" />
                <circle cx="24" cy="24" r="20" fill="none" stroke={SC3.blue} strokeWidth="4"
                  strokeDasharray={`${PR3.profileCompletion * 1.256} 200`} strokeLinecap="round"
                  transform="rotate(-90 24 24)" />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 900, color: SC3.blue,
              }}>{PR3.profileCompletion}%</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: SC3.navy }}>Profile completion</div>
              <div style={{ fontSize: 12, color: SC3.muted, marginTop: 2 }}>Add 2 more skills to reach 100%</div>
            </div>
            <button style={{
              padding: '8px 14px', borderRadius: 10, border: 'none',
              background: SC3.blue, color: '#fff', fontSize: 12, fontWeight: 800,
              cursor: 'pointer',
            }}>Improve</button>
          </div>
        </div>

        {/* Menu */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: SH3.card,
          }}>
            {menu.map((m, i) => (
              <button key={m.label} style={{
                width: '100%', padding: '14px 16px', display: 'flex',
                alignItems: 'center', gap: 12, border: 'none',
                background: 'transparent', cursor: 'pointer', textAlign: 'left',
                borderBottom: i < menu.length - 1 ? `1px solid ${SC3.border}` : 'none',
                fontFamily: SF3,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: m.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <m.Icon size={18} color={m.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: m.danger ? SC3.dangerRed : SC3.navy }}>
                    {m.label}
                  </div>
                  {m.sub && <div style={{ fontSize: 11, color: SC3.muted, marginTop: 2 }}>{m.sub}</div>}
                </div>
                {!m.danger && <SI3.IconChevronRight size={16} color={SC3.light} />}
              </button>
            ))}
          </div>
        </div>
      </div>
      <BN3 active="profile" onChange={onNav} />
    </PS3>
  );
}

window.SerraleScreens = { ProposalsScreen, MessagesScreen, ChatScreen, ProfileScreen };
