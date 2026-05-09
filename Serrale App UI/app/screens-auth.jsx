// SERRALE — Auth & Loading screens
const { PhoneShell, SerraleMark, SerraleWordmark, PrimaryButton, SecondaryButton, Photo } = window.SerraleUI;
const { IconMail, IconLock, IconEye, IconGoogle, IconUser, IconPhone, IconTools, IconCheck, IconChevronLeft } = window.SerraleIcons;
const _S = window.SERRALE;

// ─── LOADING ──────────────────────────────────────────────
function LoadingScreen() {
  return (
    <PhoneShell bg={_S.colors.appBg}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        {/* radial glow */}
        <div style={{
          position: 'absolute', width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, #EAF3FF 0%, rgba(234,243,255,0) 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -55%)',
        }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <SerraleMark size={72} />
          <div style={{ fontSize: 26, fontWeight: 900, color: _S.colors.navy, letterSpacing: 4 }}>SERRALE</div>
          {/* spinner */}
          <div style={{ marginTop: 16 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" style={{ animation: 'sr-spin 1s linear infinite' }}>
              <circle cx="14" cy="14" r="11" stroke={_S.colors.sky} strokeWidth="3" fill="none" />
              <path d="M14 3 a11 11 0 0 1 11 11" stroke={_S.colors.blue} strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
            <style>{`@keyframes sr-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
        <div style={{
          position: 'absolute', bottom: 70, fontSize: 13, fontWeight: 600,
          color: _S.colors.muted, letterSpacing: 0.4,
        }}>Preparing your workspace…</div>
      </div>
    </PhoneShell>
  );
}

// ─── LOGIN ──────────────────────────────────────────────
function LoginScreen({ onLogin = () => {}, onSignup = () => {} }) {
  const [showPwd, setShowPwd] = React.useState(false);
  const [email, setEmail] = React.useState('samuel.d@example.et');
  const [pwd, setPwd] = React.useState('••••••••');
  return (
    <PhoneShell>
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 40 }}>
        {/* hero photo card */}
        <div style={{
          margin: '54px 16px 0', height: 280, borderRadius: 28, overflow: 'hidden',
          position: 'relative', boxShadow: _S.shadows.elevated,
        }}>
          <Photo
            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80&auto=format&fit=crop"
            style={{ position: 'absolute', inset: 0 }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(11,42,91,0) 30%, rgba(11,42,91,0.85) 100%)',
          }} />
          <div style={{
            position: 'absolute', top: 18, left: 18,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.95)', padding: '8px 14px', borderRadius: 12,
            backdropFilter: 'blur(8px)',
          }}>
            <SerraleMark size={20} />
            <span style={{ fontSize: 13, fontWeight: 900, color: _S.colors.navy, letterSpacing: 1 }}>SERRALE</span>
          </div>
          <div style={{ position: 'absolute', bottom: 22, left: 22, right: 22, color: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, letterSpacing: 1.5 }}>FOR PROVIDERS</div>
            <div style={{ fontSize: 26, fontWeight: 900, marginTop: 6, lineHeight: 1.15, letterSpacing: -0.6 }}>
              Welcome back
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.92, marginTop: 6 }}>
              Find work, manage proposals, and grow your profile.
            </div>
          </div>
        </div>

        {/* form */}
        <div style={{ padding: '24px 20px 0' }}>
          <FormField icon={<IconMail size={18} color={_S.colors.muted} />} label="Email">
            <input value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle} placeholder="you@email.com" />
          </FormField>
          <FormField icon={<IconLock size={18} color={_S.colors.muted} />} label="Password" trailing={
            <button onClick={() => setShowPwd(s => !s)} style={trailingBtn}>
              <IconEye size={18} color={_S.colors.muted} />
            </button>
          }>
            <input type={showPwd ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)}
              style={inputStyle} placeholder="••••••••" />
          </FormField>
          <div style={{ textAlign: 'right', marginTop: -4, marginBottom: 18 }}>
            <button style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, color: _S.colors.blue,
            }}>Forgot password?</button>
          </div>
          <PrimaryButton onClick={onLogin}>Log In</PrimaryButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: _S.colors.border }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: _S.colors.muted }}>OR</span>
            <div style={{ flex: 1, height: 1, background: _S.colors.border }} />
          </div>
          <SecondaryButton icon={<IconGoogle size={18} />}>Continue with Google</SecondaryButton>
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: _S.colors.body }}>
            New to SERRALE?{' '}
            <button onClick={onSignup} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 800, color: _S.colors.blue, padding: 0,
            }}>Register as a Provider</button>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

function FormField({ icon, label, children, trailing }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: _S.colors.muted, marginBottom: 6, letterSpacing: 0.3 }}>
        {label.toUpperCase()}
      </div>
      <div style={{
        height: 54, borderRadius: 14, background: '#fff',
        border: `1.5px solid ${_S.colors.border}`,
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
      }}>
        {icon}
        {children}
        {trailing}
      </div>
    </div>
  );
}

const inputStyle = {
  flex: 1, border: 'none', outline: 'none', background: 'transparent',
  fontSize: 15, fontWeight: 600, color: _S.colors.title, fontFamily: _S.font,
};
const trailingBtn = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

// ─── SIGNUP ──────────────────────────────────────────────
function SignupScreen({ onBack = () => {}, onSubmit = () => {} }) {
  return (
    <PhoneShell>
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 40 }}>
        <div style={{ padding: '54px 20px 0' }}>
          <button onClick={onBack} style={{
            width: 42, height: 42, borderRadius: 14, border: `1px solid ${_S.colors.border}`,
            background: '#fff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}>
            <IconChevronLeft size={20} color={_S.colors.title} />
          </button>
          <SerraleMark size={48} />
          <div style={{ fontSize: 28, fontWeight: 900, color: _S.colors.navy, marginTop: 16, letterSpacing: -0.6, lineHeight: 1.15 }}>
            Start growing<br/>with SERRALE
          </div>
          <div style={{ fontSize: 14, color: _S.colors.body, marginTop: 8, lineHeight: 1.5 }}>
            Create your provider profile and get discovered by clients across Ethiopia.
          </div>
        </div>
        <div style={{ padding: '24px 20px 0' }}>
          <FormField icon={<IconUser size={18} color={_S.colors.muted} />} label="Full name">
            <input style={inputStyle} placeholder="Samuel Desta" defaultValue="Samuel Desta" />
          </FormField>
          <FormField icon={<IconPhone size={18} color={_S.colors.muted} />} label="Phone number">
            <input style={inputStyle} placeholder="+251 …" defaultValue="+251 911 234 567" />
          </FormField>
          <FormField icon={<IconMail size={18} color={_S.colors.muted} />} label="Email">
            <input style={inputStyle} placeholder="you@email.com" defaultValue="samuel.d@example.et" />
          </FormField>
          <FormField icon={<IconTools size={18} color={_S.colors.muted} />} label="Primary service">
            <input style={inputStyle} placeholder="e.g. Brand designer" defaultValue="Brand designer & photographer" />
          </FormField>
          <FormField icon={<IconLock size={18} color={_S.colors.muted} />} label="Password">
            <input type="password" style={inputStyle} defaultValue="••••••••" />
          </FormField>

          <div style={{
            background: _S.colors.softCard, borderRadius: 14, padding: 14, marginBottom: 18,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6, background: _S.colors.blue,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
            }}>
              <IconCheck size={14} color="#fff" strokeWidth={3} />
            </div>
            <div style={{ fontSize: 12, color: _S.colors.body, lineHeight: 1.5 }}>
              I agree to SERRALE's <span style={{ color: _S.colors.blue, fontWeight: 700 }}>Terms</span> and <span style={{ color: _S.colors.blue, fontWeight: 700 }}>Privacy Policy</span>.
            </div>
          </div>

          <PrimaryButton onClick={onSubmit}>Register as a Provider</PrimaryButton>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: _S.colors.body }}>
            Already have an account?{' '}
            <button onClick={onBack} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 800, color: _S.colors.blue, padding: 0,
            }}>Log In</button>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

window.SerraleAuth = { LoadingScreen, LoginScreen, SignupScreen };
