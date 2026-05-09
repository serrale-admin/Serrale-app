// SERRALE shared components
const { IconHome, IconBriefcase, IconDoc, IconChat, IconUser, IconBell, IconSearch, IconFilter,
  IconShieldCheck, IconStar, IconStarFilled, IconMapPin, IconClock, IconWallet, IconImage,
  IconSettings, IconLogout, IconChevronRight, IconChevronLeft, IconBookmark, IconBookmarkFilled,
  IconPlus, IconPaperclip, IconSend, IconArrowRight, IconCheck, IconEye, IconEyeOff, IconGoogle,
  IconRocket, IconSparkles, IconLock, IconMail, IconPhone, IconTools, IconCalendar, IconHelp,
  IconGlobe, IconShield } = window.SerraleIcons;
const S = window.SERRALE;

// Phone shell — mimics iPhone safe area, no real iOS chrome (this is the SERRALE app, not iOS UI)
function PhoneShell({ children, bg = S.colors.appBg, statusBarDark = false, hideHomeIndicator = false }) {
  return (
    <div style={{
      width: 390, height: 844, borderRadius: 44, overflow: 'hidden', position: 'relative',
      background: bg, fontFamily: S.font, color: S.colors.title,
      boxShadow: '0 30px 80px rgba(11,42,91,0.18), 0 0 0 1px rgba(0,0,0,0.08)',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <PhoneStatusBar dark={statusBarDark} />
      <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 35, borderRadius: 22, background: '#000', zIndex: 50 }} />
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      {!hideHomeIndicator && (
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
          width: 134, height: 5, borderRadius: 3, background: 'rgba(7,29,60,0.4)', zIndex: 60 }} />
      )}
    </div>
  );
}

function PhoneStatusBar({ dark }) {
  const c = dark ? '#fff' : S.colors.title;
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 54,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 32px 0', zIndex: 30, pointerEvents: 'none',
    }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: c, letterSpacing: -0.3 }}>9:41</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="0.6" fill={c}/><rect x="4.5" y="5" width="3" height="6" rx="0.6" fill={c}/><rect x="9" y="2.5" width="3" height="8.5" rx="0.6" fill={c}/><rect x="13.5" y="0" width="3" height="11" rx="0.6" fill={c}/></svg>
        <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 3a6.6 6.6 0 0 1 4.6 1.9l1-1A8 8 0 0 0 7.5 1.5a8 8 0 0 0-5.6 2.4l1 1A6.6 6.6 0 0 1 7.5 3z" fill={c}/><path d="M7.5 6c1.2 0 2.3.5 3.1 1.3l1-1a5.5 5.5 0 0 0-8.2 0l1 1A4.4 4.4 0 0 1 7.5 6z" fill={c}/><circle cx="7.5" cy="9.5" r="1.3" fill={c}/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke={c} strokeOpacity="0.4"/><rect x="2" y="2" width="18" height="8" rx="1.8" fill={c}/><rect x="22.5" y="4" width="1.5" height="4" rx="0.6" fill={c} fillOpacity="0.5"/></svg>
      </div>
    </div>
  );
}

// SERRALE Logo mark (the shield icon) — drawn from the brand
function SerraleMark({ size = 40 }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 50 70">
      <defs>
        <clipPath id="srPill"><rect x="2" y="2" width="46" height="66" rx="23"/></clipPath>
      </defs>
      <rect x="2" y="2" width="46" height="66" rx="23" fill="none" stroke={S.colors.navy} strokeWidth="3"/>
      <g clipPath="url(#srPill)">
        {/* sun */}
        <circle cx="25" cy="22" r="7" fill="#5A8AB5"/>
        {[0,30,60,90,120,150].map(a => {
          const rad = a * Math.PI / 180;
          const x1 = 25 + Math.cos(rad) * 9, y1 = 22 + Math.sin(rad) * 9;
          const x2 = 25 + Math.cos(rad) * 14, y2 = 22 + Math.sin(rad) * 14;
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5A8AB5" strokeWidth="2.5"/>;
        })}
        {/* hills */}
        <path d="M 0 50 Q 25 30, 50 55 L 50 70 L 0 70 Z" fill={S.colors.navy}/>
        <path d="M 0 58 Q 18 42, 35 60 L 50 60 L 50 70 L 0 70 Z" fill={S.colors.navy}/>
        {/* highlight stripes */}
        <path d="M 5 45 Q 25 32, 48 50" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M 8 52 Q 25 40, 45 56" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.4"/>
      </g>
    </svg>
  );
}

function SerraleWordmark({ size = 22, dark = true }) {
  const c = dark ? S.colors.navy : '#fff';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <SerraleMark size={size * 1.4} />
      <span style={{
        fontSize: size, fontWeight: 900, color: c, letterSpacing: 1.2,
        fontFamily: S.font,
      }}>SERRALE</span>
    </div>
  );
}

// Buttons
function PrimaryButton({ children, onClick, full = true, style = {}, icon, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: full ? '100%' : 'auto', height: 54, borderRadius: 16, border: 'none',
      background: disabled ? '#A8C2EC' : S.colors.blue, color: '#fff',
      fontSize: 16, fontWeight: 800, fontFamily: S.font, cursor: 'pointer',
      boxShadow: disabled ? 'none' : S.shadows.button, letterSpacing: -0.2,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...style,
    }}>
      {icon}
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, full = true, style = {}, icon }) {
  return (
    <button onClick={onClick} style={{
      width: full ? '100%' : 'auto', height: 50, borderRadius: 16,
      border: `1.5px solid ${S.colors.border}`, background: '#fff', color: S.colors.blue,
      fontSize: 15, fontWeight: 800, fontFamily: S.font, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      ...style,
    }}>
      {icon}
      {children}
    </button>
  );
}

function SoftButton({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      height: 44, padding: '0 18px', borderRadius: 14, border: 'none',
      background: S.colors.sky, color: S.colors.blue,
      fontSize: 14, fontWeight: 800, fontFamily: S.font, cursor: 'pointer',
      ...style,
    }}>{children}</button>
  );
}

// Bottom Navigation (Home, Jobs, Proposals, Messages, Profile)
function BottomNav({ active = 'home', onChange = () => {} }) {
  const items = [
    { id: 'home', label: 'Home', Icon: IconHome },
    { id: 'jobs', label: 'Jobs', Icon: IconBriefcase },
    { id: 'proposals', label: 'Proposals', Icon: IconDoc, badge: 4 },
    { id: 'messages', label: 'Messages', Icon: IconChat, badge: 3 },
    { id: 'profile', label: 'Profile', Icon: IconUser },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 86,
      background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${S.colors.border}`,
      display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start',
      paddingTop: 10, paddingBottom: 22, zIndex: 40,
    }}>
      {items.map(({ id, label, Icon, badge }) => {
        const isActive = active === id;
        const color = isActive ? S.colors.blue : '#8A99AD';
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            border: 'none', background: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '4px 6px', minWidth: 52, position: 'relative',
          }}>
            <div style={{ position: 'relative' }}>
              <Icon size={24} color={color} strokeWidth={isActive ? 2.4 : 2} />
              {badge && (
                <div style={{
                  position: 'absolute', top: -4, right: -8, minWidth: 16, height: 16,
                  borderRadius: 8, background: S.colors.dangerRed, color: '#fff',
                  fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: '0 4px',
                  border: '2px solid #fff',
                }}>{badge}</div>
              )}
            </div>
            <span style={{
              fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? S.colors.blue : S.colors.muted,
              letterSpacing: -0.1,
            }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// App header with logo + bell + avatar
function AppHeader({ unread = 2, avatarUrl }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 20px', height: 56,
    }}>
      <SerraleWordmark size={16} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{
          width: 42, height: 42, borderRadius: 14, border: `1px solid ${S.colors.border}`,
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
        }}>
          <IconBell size={20} color={S.colors.title} />
          {unread > 0 && (
            <div style={{
              position: 'absolute', top: 8, right: 8, width: 16, height: 16,
              borderRadius: 8, background: S.colors.dangerRed, color: '#fff',
              fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center',
              justifyContent: 'center', border: '2px solid #fff',
            }}>{unread}</div>
          )}
        </button>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 21, overflow: 'hidden',
            background: S.colors.sky, border: `2px solid #fff`, boxShadow: S.shadows.card,
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: S.colors.blue, fontWeight: 800,
          }}>{!avatarUrl && 'SD'}</div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0, width: 12, height: 12,
            borderRadius: 6, background: S.colors.successGreen, border: '2px solid #fff',
          }}/>
        </div>
      </div>
    </div>
  );
}

// Status badge (pill)
function StatusBadge({ status }) {
  const map = {
    Submitted: { bg: S.colors.sky, fg: S.colors.blue },
    Viewed: { bg: S.colors.successSoft, fg: S.colors.successGreen },
    Shortlisted: { bg: S.colors.purpleSoft, fg: S.colors.purple },
    Interview: { bg: S.colors.warningSoft, fg: S.colors.warningOrange },
    Won: { bg: S.colors.successSoft, fg: S.colors.successGreen },
    Rejected: { bg: S.colors.dangerSoft, fg: S.colors.dangerRed },
  };
  const c = map[status] || map.Submitted;
  return (
    <span style={{
      display: 'inline-block', padding: '5px 12px', borderRadius: 999,
      fontSize: 11, fontWeight: 800, background: c.bg, color: c.fg, letterSpacing: 0.2,
    }}>{status}</span>
  );
}

function MatchBadge({ pct }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '5px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 800,
      background: S.colors.successSoft, color: S.colors.successGreen,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: S.colors.successGreen }} />
      {pct}% Match
    </span>
  );
}

// Photo placeholder using an image URL or fallback gradient
function Photo({ src, alt = '', style }) {
  return (
    <div style={{
      backgroundImage: src ? `url(${src})` : 'linear-gradient(135deg, #1769F2, #0B2A5B)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      ...style,
    }} role="img" aria-label={alt} />
  );
}

window.SerraleUI = {
  PhoneShell, PhoneStatusBar, SerraleMark, SerraleWordmark,
  PrimaryButton, SecondaryButton, SoftButton,
  BottomNav, AppHeader, StatusBadge, MatchBadge, Photo,
};
