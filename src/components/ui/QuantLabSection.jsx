// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { getSb } from '@/lib/supabaseClient';
import { noEmDash } from '@/lib/noEmDash';
import { useReaderRoute, useScrollLock } from '@/lib/useReaderRoute';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Backend config lives in env vars, see .env.local.example. Reads use the
// public anon key (Supabase RLS gates what it can touch); writes go through
// /api/editor/* server routes backed by the service role key instead, see
// src/lib/editorSession.ts and src/lib/supabaseAdmin.ts. No password lives
// in this file.

const RESEARCH_NOTES = [
  {
    slug: 'tail-risk', num: '01', title: 'Tail Risk & the Failure of Gaussian VaR',
    subtitle: 'Hill estimator tail-index estimation on twenty years of simulated fat-tailed returns',
    tags: ['Python', 'NumPy', 'SciPy', 'EVT'],
    summary: "Fitting the Hill estimator to daily returns to show exactly how badly a Gaussian 99% VaR misjudges real tail risk, and why the breach count isn't even the right thing to look at.",
    relatedProjects: [{ name: 'Stratum', url: 'https://github.com/KAANSSAR/Stratum' }],
    slides: [
      {
        kicker: 'Context', headline: 'Why "1% VaR" is the number every risk desk quotes',
        body: [
          "Value-at-Risk (VaR) is the standard way a desk sizes downside risk: the 99% daily VaR is the loss level you'd only expect to breach on the worst 1% of trading days, roughly 2–3 times a year. Most VaR implementations get that threshold by assuming returns are normally distributed, because a Gaussian is easy to calibrate and easy to explain to a risk committee.",
          "Real returns aren't Gaussian. Large moves happen more often, and more sharply, than a bell curve predicts. That's called a fat tail. Extreme Value Theory (EVT) gives a principled way to measure exactly how fat a given tail is, using only the most extreme observations rather than the whole distribution. That measurement is the tail exponent α: the smaller it is, the fatter the tail, and the more a Gaussian VaR is underestimating real risk. This note estimates it, then checks whether the underestimate actually shows up where you'd expect.",
        ],
      },
      {
        kicker: 'Method', headline: 'Fit a power law to the far left tail',
        body: [
          'Twenty years of daily returns, sorted by loss, fit with a power law over the k largest order statistics. The Hill estimator reads the tail exponent directly off those k losses: the smaller the exponent, the fatter the tail.',
          'The real work is choosing k. The estimate swings depending on where you decide the tail starts, so I plot α̂ against k across the full range and read off the region where the curve goes flat, rather than picking one k and hoping.',
        ],
        equation: '\\hat\\alpha_k=\\left[\\frac{1}{k}\\sum_{i=1}^{k}\\ln\\frac{X_{(i)}}{X_{(k+1)}}\\right]^{-1}',
        code: { lang: 'python', content: 'lx = np.log(np.sort(losses)[::-1])\nk = np.arange(1, kmax + 1)\nalpha = k / (np.cumsum(lx[:kmax]) - k * lx[1:kmax + 1])' },
        image: { src: '/research/tail-risk/hill-plot.png', alt: 'Hill plot of the tail exponent estimate against k', caption: 'Hill tail exponent α̂(k) as more order statistics are included. The curve is noisy for small k and flattens around k≈200, and that flat region, not any single k, is the actual estimate: α̂≈2.90.' },
      },
      {
        kicker: 'Finding', headline: "The breach count isn't the tell, the clustering is",
        body: [
          'Across three simulated assets (two equity-index-like series at Student-t df=4 and df=3, one FX-like series at df=6, each with GARCH-style volatility clustering layered on top) the raw 99% VaR breach counts actually landed close to the ~50 a Gaussian model expects over 20 years: 62, 34, and 78 respectively. On the numbers alone, Gaussian VaR looks almost fine.',
          "It isn't. Breaches cluster far more tightly in time than a model that treats each day as independent would ever predict. Up to a third of breaches in the df=3 series land within 5 trading days of another breach. A Kupiec-style unconditional-coverage test, which only checks the count, would pass; a Christoffersen independence test, which checks the timing, would fail hard. The count is fine. The timing is the actual risk, and it's exactly what the tail exponent from the previous slide predicts: a fat tail doesn't just mean bigger losses, it means losses that arrive in bursts.",
        ],
        stat: { value: '2.9–3.2', label: 'estimated Hill tail exponent α̂ across three simulated assets (finite 4th-moment boundary is α=4)' },
        image: { src: '/research/tail-risk/breaches.png', alt: 'Bar chart comparing Gaussian-expected vs actually observed 99% VaR breaches', caption: 'Grey: the ~50 breaches a Gaussian model expects over 20 years at a 1% daily probability. Gold: what actually happened. The bar heights are close. The clustering in time, not visible here, is where the real gap is.' },
      },
    ],
  },
  {
    slug: 'hawkes-order-flow', num: '02', title: 'Order Flow Self-Excitation',
    subtitle: "Fitting a Hawkes process to simulated trade arrivals via MLE, validated with Ogata's residual test",
    tags: ['Python', 'SciPy', 'MLE', 'Point Processes'],
    summary: 'Simulating and refitting a self-exciting point process to show that market orders trigger their own aftershocks, and catching a real bug in the validation test along the way.',
    slides: [
      {
        kicker: 'Context', headline: "Trades don't arrive independently. They cluster",
        body: [
          'The simplest model of order arrival treats every trade as independent, landing at some constant average rate (a Poisson process). Real markets don\u2019t behave that way: a large sell order or a stop-loss cascade measurably raises the odds of another trade following soon after. Volume arrives in bursts, not a steady drip. Anyone who has watched a order book during a fast move has seen this directly.',
          "A Hawkes process is the standard way to model that formally: a self-exciting point process where every arrival temporarily raises the intensity (the instantaneous rate) of future arrivals, with that excitement decaying over time. Fitting one to trade timestamps and reading off the branching ratio (the fraction of trades caused by other trades, rather than by genuinely new information) is a direct, quantitative answer to how much of order flow is order flow feeding itself.",
        ],
      },
      {
        kicker: 'Method', headline: 'Every arrival lifts the odds of the next one',
        body: [
          'Ground truth: μ=0.30, α=1.60, β=2.00 (branching ratio n=α/β=0.80), simulated via Ogata\u2019s thinning algorithm over T=2000, producing 2,962 events. The model assumes every arrival raises the intensity of the next one, with the excitement decaying exponentially at a rate estimated from the data rather than assumed upfront.',
          'The likelihood looks like it needs a double loop over every pair of events, O(N²). There\u2019s an O(N) recursion that collapses it to a single pass: each event\u2019s contribution to the running intensity is the last event\u2019s contribution, decayed, plus one.',
        ],
        equation: '\\lambda(t)=\\mu+\\sum_{t_i<t}\\alpha\\,e^{-\\beta(t-t_i)}',
        code: { lang: 'python', content: 'A = np.zeros(n)\nfor i in range(1, n):\n    A[i] = np.exp(-beta * (t[i]-t[i-1])) * (1 + A[i-1])\nlam = mu + alpha * A' },
        image: { src: '/research/hawkes-order-flow/intensity.png', alt: 'Fitted Hawkes intensity path over the first 100 time units', caption: 'Fitted intensity λ(t) over the first 100 time units (orange ticks mark actual arrivals). Each arrival kicks the intensity up; it decays until the next one. Visually, this is what "self-exciting" means.' },
      },
      {
        kicker: 'Finding', headline: "Validate with Ogata's residual test, and actually trust it",
        body: [
          'Maximum likelihood (Nelder-Mead on the negative log-likelihood) recovered μ=0.281, α=1.560, β=1.925, a branching ratio of 0.810 against the true 0.800, about 1% off. Splitting the sample in half and refitting each independently gave 0.826 and 0.792, bracketing the true value on either side.',
          "A close branching ratio isn't enough on its own. Time-change the events by the fitted intensity, and the inter-arrival gaps should be plain Exp(1) if the model actually fits (Ogata's residual test). First run failed hard, KS p≈0. The compensator recursion was silently dropping each event's own self-excitation term when decaying into the next interval. Fixed, the residuals passed cleanly at p=0.86. The fit isn't just close on the headline number, it's actually valid.",
        ],
        stat: { value: '0.81 vs 0.80', label: 'fitted vs true branching ratio (Ogata KS residual test: p=0.86)' },
        image: { src: '/research/hawkes-order-flow/qq.png', alt: 'QQ plot of time-changed inter-arrival residuals against the Exp(1) distribution', caption: 'Time-changed inter-arrival gaps plotted against the Exp(1) distribution they should follow if the model is correctly specified. Points hugging the diagonal (shown) is what a passing fit looks like. This is what failed, silently, before the compensator bug was fixed.' },
      },
    ],
  },
  {
    slug: 'autodiff-greeks', num: '03', title: 'Monte Carlo Greeks by Autodiff',
    subtitle: 'Differentiating a JAX Monte Carlo pricer directly, instead of bumping spot and repricing',
    tags: ['Python', 'JAX', 'Monte Carlo'],
    summary: 'Differentiating a Monte Carlo option pricer with JAX instead of the classical bump-and-reprice approach, and hitting a real, well-known limitation of autodiff for second-order Greeks.',
    relatedProjects: [{ name: 'Options Pricing Engine', url: 'https://github.com/KAANSSAR/Options-Pricing-Engine' }],
    slides: [
      {
        kicker: 'Context', headline: 'A price is one number; a hedge needs its derivatives',
        body: [
          "Pricing an option with Monte Carlo is the easy part: simulate enough random price paths, average the discounted payoff, done. What a desk actually needs to hedge a position are the Greeks: delta (sensitivity to the underlying price), gamma (sensitivity of delta itself), vega (sensitivity to volatility). These are the derivatives of that price with respect to its inputs.",
          "The textbook way to get them from a Monte Carlo pricer is to bump an input by a small amount, reprice, and divide by the bump size: finite differences. It works, but every Greek costs at least one extra full simulation, and the result is noisy, because Monte Carlo error doesn't cancel between two separate simulations run at slightly different inputs. Automatic differentiation (autodiff) offers a different route entirely: differentiate the pricer itself, directly, through the exact same simulation you already ran.",
        ],
      },
      {
        kicker: 'Method', headline: 'Differentiate the estimator, not the spot',
        body: [
          'European call, S0=K=100, T=1y, r=3%, σ=20%, 200,000 paths. Write the Monte Carlo pricer in JAX (simulate terminal prices, discount the payoff, average), then call jax.grad on the pricer itself instead of rerunning the whole simulation at S0 and S0+h.',
          'Same random draws feed both the price and its derivative, so pathwise noise cancels instead of compounding across two separate simulations. Delta came out at 0.5987 against the closed-form Black-Scholes value of 0.5987, matched to four decimal places, with a standard deviation across 200 independent reruns of just 0.00136.',
        ],
        equation: '\\frac{\\partial}{\\partial S_0}\\mathbb{E}[f(S_T)]=\\mathbb{E}\\!\\left[\\frac{\\partial f}{\\partial S_T}\\frac{\\partial S_T}{\\partial S_0}\\right]',
        code: { lang: 'python', content: 'def price(S0, sigma, Z):\n    ST = S0 * jnp.exp((r-0.5*sigma**2)*T + sigma*jnp.sqrt(T)*Z)\n    return jnp.exp(-r*T) * jnp.mean(jnp.maximum(ST-K, 0.0))\n\ndelta = grad(price, 0)(S0, sigma, Z)' },
        image: { src: '/research/autodiff-greeks/delta-error.png', alt: 'Histogram of log relative error for delta: autodiff vs bump-and-reprice', caption: 'Distribution of delta error across 200 independent reruns, each using the same 200,000-path budget. Autodiff (teal) sits tightest around zero error; bump estimates (bump h=1.0/0.5/0.1) spread out further as the step size shrinks.' },
      },
      {
        kicker: 'Finding', headline: 'Gamma via naive autodiff is a real trap, not a bug',
        body: [
          'A finite-difference bump at h=0.1 with fresh random draws on each side gave a delta standard deviation of 0.230, roughly 169x noisier than autodiff\u2019s 0.00136, from the same 200,000-path budget. Reusing the same random draws on both sides of the bump (common random numbers) closes almost the entire gap, which is itself the tell: the noise was never about the estimator, it was about throwing away shared randomness.',
          'Gamma is the sharper lesson. jax.hessian on the raw payoff returns essentially zero. The payoff is piecewise linear in spot (S_T is directly proportional to S0), so its true second derivative is a Dirac delta at the money, and differentiation doesn\u2019t commute with expectation there. No amount of rerunning fixes that. The fix is the same one production desks use: smooth the kink with a Gaussian-convolved payoff and differentiate that instead, which recovers gamma to within a fraction of a percent of the closed-form 0.0193.',
        ],
        stat: { value: '169×', label: 'lower standard deviation for autodiff delta vs bump (h=0.1, fresh random draws), same path budget' },
        image: { src: '/research/autodiff-greeks/gamma-compare.png', alt: 'Box plots comparing gamma estimates: bump, naive autodiff, smoothed-payoff autodiff', caption: 'Gamma estimates across four approaches. Bump-and-reprice is noisy but roughly centered on the true value (dashed line); naive autodiff on the raw payoff collapses to zero; smoothing the payoff before differentiating recovers the correct value tightly.' },
      },
    ],
  },
  {
    slug: 'american-put-boundary', num: '04', title: 'The American Put Free Boundary',
    subtitle: 'Crank-Nicolson + projected SOR on the linear complementarity problem',
    tags: ['Python', 'NumPy', 'PDE', 'PSOR'],
    summary: 'Solving for the early-exercise boundary by discretising Black-Scholes and enforcing the exercise constraint at every grid node, and finding a sign error that was zeroing out the entire solution.',
    relatedProjects: [{ name: 'Options Pricing Engine', url: 'https://github.com/KAANSSAR/Options-Pricing-Engine' }],
    slides: [
      {
        kicker: 'Context', headline: "An American option's hardest question: exercise now, or wait?",
        body: [
          'A European option can only be exercised at maturity, so pricing it is a closed-form calculation (Black-Scholes) or a straightforward backward sweep on a grid. An American option can be exercised at any time before maturity, which means at every point in time, there\u2019s a spot price below which exercising immediately is worth strictly more than continuing to hold the option.',
          'That threshold is the early-exercise boundary, and it isn\u2019t known in advance. It has to be solved for jointly with the option\u2019s value, because the two determine each other. That turns pricing from a single equation into a free-boundary problem: a linear complementarity problem (LCP), solved here by discretising Black-Scholes with Crank-Nicolson and enforcing the exercise constraint at every grid node with projected SOR.',
        ],
      },
      {
        kicker: 'Method', headline: 'A linear complementarity problem, not a tridiagonal solve',
        body: [
          'K=100, r=6%, σ=30%, T=1y. Discretise the Black-Scholes PDE on a 200-node spot grid and 400 time steps, stepping backwards from the payoff with Crank-Nicolson. A European option makes each step a plain tridiagonal solve; an American one doesn\u2019t, because at every node you have to check whether waiting beats exercising immediately.',
          'Projected SOR handles it: iterate the tridiagonal system to convergence, then clamp every value up to the payoff after each sweep. Where the clamp actually binds is the early-exercise boundary, the one thing the equation can\u2019t tell you in advance, because the boundary and the solution determine each other.',
        ],
        equation: '\\left(\\frac{\\partial V}{\\partial \\tau}-\\mathcal{L}V\\right)(V-g)=0,\\quad \\frac{\\partial V}{\\partial \\tau}\\ge \\mathcal{L}V,\\quad V\\ge g',
        code: { lang: 'python', content: 'z = (rhs[k] + a[k]*Vnew[idx-1] + c[k]*Vnew[idx+1]) / (1 - b[k])\nz_sor = Vnew[idx] + omega * (z - Vnew[idx])\nVnew[idx] = max(z_sor, payoff[idx])   # projection' },
        image: { src: '/research/american-put-boundary/boundary.png', alt: 'American put value against spot compared to European, boundary at S=70.5', caption: 'American put value (gold) against the European equivalent (dashed) at t=0. The two curves diverge below the exercise boundary at S*≈70.5. Below that spot, holding the option is never worth more than exercising it immediately.' },
      },
      {
        kicker: 'Finding', headline: 'The boundary and the solution determine each other',
        body: [
          'First pass returned exactly zero everywhere. A sign error in the PSOR update was subtracting the neighbouring-node contributions instead of adding them, which made the iteration converge to a degenerate fixed point instead of the actual solution. Fixed, the American put prices at 9.33 against 8.71 for the equivalent European put: a 0.62 early-exercise premium, with the boundary at t=0 sitting at S*=70.50, comfortably above the perpetual-put asymptote of about 57, exactly where a finite one-year maturity should put it.',
          'A convergence study refining the grid from 50×100 up to 400×800 shows the price converging at roughly first order as the grid halves, not the second order Crank-Nicolson gets on smooth problems. That\u2019s not a mistake in the scheme. It\u2019s a known, real consequence of the non-smooth free boundary, and the kind of thing that only shows up if you actually run the convergence study instead of trusting one grid resolution.',
        ],
        stat: { value: '9.33 vs 8.71', label: 'American vs European put value at S=100 (0.62 early-exercise premium)' },
        image: { src: '/research/american-put-boundary/convergence.png', alt: 'American put value at S=100 across four grid resolutions, converging at roughly first order', caption: 'American put value at S=100 as the grid is refined from 50×100 to 400×800 nodes. The price is converging, but roughly halving its error each refinement (first order) rather than quartering it (second order), the signature of a non-smooth free boundary.' },
      },
    ],
  },
];

const PY_KEYWORDS = ['def', 'for', 'in', 'if', 'else', 'elif', 'return', 'import', 'as', 'while', 'lambda', 'not', 'and', 'or', 'class', 'with'];
function highlightPython(code) {
  const lines = code.split('\n');
  return lines.map((line, li) => {
    const tokens = [];
    let rest = line;
    let key = 0;
    const re = /(#.*$)|('[^']*'|"[^"]*")|(\b\d+\.?\d*\b)|(\b(?:def|for|in|if|else|elif|return|import|as|while|lambda|not|and|or|class|with)\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|(.)/g;
    let m;
    while ((m = re.exec(rest))) {
      if (m[1]) tokens.push(<span key={key++} style={{ color: '#6B7280' }}>{m[1]}</span>);
      else if (m[2]) tokens.push(<span key={key++} style={{ color: '#5FD068' }}>{m[2]}</span>);
      else if (m[3]) tokens.push(<span key={key++} style={{ color: '#FF8C42' }}>{m[3]}</span>);
      else if (m[4]) tokens.push(<span key={key++} style={{ color: '#A78BFA', fontWeight: 700 }}>{m[4]}</span>);
      else if (m[5]) tokens.push(<span key={key++} style={{ color: '#E8E4DC' }}>{m[5]}</span>);
      else tokens.push(<span key={key++} style={{ color: '#E8E4DC' }}>{m[0]}</span>);
    }
    return <div key={li}>{tokens.length ? tokens : '\u00A0'}</div>;
  });
}

function TagPicker({ value, allTags, onChange, accentColor }) {
  const [newTag, setNewTag] = useState('');
  const selected = value.split(',').map(t => t.trim()).filter(Boolean);
  const toggle = (t) => {
    const next = selected.includes(t) ? selected.filter(x => x !== t) : selected.concat(t);
    onChange(next.join(', '));
  };
  const addNew = () => {
    const t = newTag.trim();
    if (!t || selected.includes(t)) { setNewTag(''); return; }
    onChange(selected.concat(t).join(', '));
    setNewTag('');
  };
  const unseen = allTags.filter(t => !selected.includes(t));
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {selected.map(t => (
          <span key={t} onClick={() => toggle(t)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 3, border: `1px solid ${accentColor}`, background: accentColor, color: '#0A0A0A' }}>{t} ×</span>
        ))}
        {unseen.map(t => (
          <span key={t} onClick={() => toggle(t)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#8C8676' }}>{t}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="New tag" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNew()}
          style={{ flex: 1, padding: '8px 10px', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, background: 'transparent', color: '#E8E4DC', outline: 'none' }} />
        <button onClick={addNew} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#E8E4DC', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', cursor: 'pointer' }}>Add</button>
      </div>
    </div>
  );
}

function Equation({ tex }) {
  return (
    <div style={{ color: '#F5C518', overflowX: 'auto', padding: '12px 0' }}>
      <BlockMath math={tex} errorColor="#F5C518" />
    </div>
  );
}

function Slide({ slide }) {
  return (
    <div className="slide-2col" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'start' }}>
      <div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#F5C518', marginBottom: 14 }}>{slide.kicker}</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(22px,2.6vw,32px)', lineHeight: 1.2, color: '#F2EEE6', margin: '0 0 20px' }}>{slide.headline}</h3>
        {slide.body.map((p, i) => <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem', lineHeight: 1.7, color: '#B8B2A5', margin: '0 0 14px' }}>{p}</p>)}
        {slide.stat && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 20, paddingTop: 16 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.8rem', color: '#F5C518' }}>{slide.stat.value}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#8C8676', marginTop: 4 }}>{slide.stat.label}</div>
          </div>
        )}
        {slide.equation && <Equation tex={slide.equation} />}
      </div>
      <div>
        {slide.image && (
          <React.Fragment>
            <img src={slide.image.src} alt={slide.image.alt} style={{ width: '100%', borderRadius: 8, marginBottom: slide.image.caption ? 8 : 16, background: '#111' }} />
            {slide.image.caption && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontStyle: 'italic', color: '#7A7468', lineHeight: 1.5, margin: '0 0 16px' }}>{slide.image.caption}</p>}
          </React.Fragment>
        )}
        {slide.code && (
          <div style={{ background: '#0D0D0D', borderRadius: 8, padding: '16px 18px', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', lineHeight: 1.6, overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)' }}>
            {highlightPython(slide.code.content)}
          </div>
        )}
      </div>
    </div>
  );
}

function ResearchCaseStudy({ slug, onClose, note, authed, onEdit }) {
  if (!note) return null;
  if (note.format === 'simple') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 320, background: '#151210', overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <div className="reader-body" style={{ maxWidth: 780, margin: '0 auto', padding: '64px 48px 100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <span onClick={onClose} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8C8676' }}>← Back to Quant Lab</span>
            {authed && <span onClick={onEdit} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F5C518' }}>Edit</span>}
          </div>
          {note.tags && note.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {note.tags.map((t, ti) => <span key={ti} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 9px', border: '0.5px solid #F5C518', borderRadius: 2, color: '#F5C518' }}>{t}</span>)}
            </div>
          )}
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(28px,3.6vw,44px)', color: '#F2EEE6', margin: '0 0 8px' }}>{note.title}</h1>
          {note.subtitle && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: '#8C8676', marginBottom: 32 }}>{note.subtitle}</div>}
          {note.cover_image && <img src={note.cover_image} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 40 }} />}
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.05rem', lineHeight: 1.75, color: '#E8E4DC' }} dangerouslySetInnerHTML={{ __html: note.body_html || '' }} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 320, background: '#151210', overflowY: 'auto', overscrollBehavior: 'contain' }}>
      <div className="reader-body" style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 48px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <span onClick={onClose} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8C8676' }}>← Back to Quant Lab</span>
          {authed && <span onClick={onEdit} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F5C518' }}>Edit</span>}
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          {note.tags.map((t, i) => <span key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 9px', border: '0.5px solid #F5C518', borderRadius: 2, color: '#F5C518' }}>{t}</span>)}
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(28px,3.6vw,44px)', color: '#F2EEE6', margin: '0 0 8px' }}>{note.title}</h1>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: '#8C8676', marginBottom: 44 }}>{note.subtitle}</div>

        {note.slides.map((s, i) => (
          <div key={i} style={{ paddingBottom: 56, marginBottom: 56, borderBottom: i < note.slides.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
            <Slide slide={s} />
          </div>
        ))}

        {note.relatedProjects && (
          <div style={{ marginTop: 8, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8C8676' }}>Related:</span>
            {note.relatedProjects.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" data-cursor-hover="true" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: '#F5C518', textDecoration: 'none' }}>{p.name} →</a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NoteCard({ n, accentColor, onClick, editMode, onEditCard }) {
  return (
    <div onClick={editMode ? onEditCard : onClick} data-cursor-hover="true" style={{ position: 'relative', flex: '0 0 300px', borderRadius: 10, overflow: 'hidden', border: editMode ? `1px dashed ${accentColor}` : '1px solid rgba(255,255,255,0.1)', background: '#141210', cursor: 'pointer' }}>
      <div style={{ background: accentColor, padding: '9px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.05em', color: '#0A0A0A' }}>Note {n.num}</span>
        <span style={{ display: 'flex', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(10,10,10,0.4)' }} />
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(10,10,10,0.4)' }} />
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(10,10,10,0.4)' }} />
        </span>
      </div>
      <div style={{ padding: '26px 20px 24px' }}>
        <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18M7 14l4-5 3 3 5-7" /></svg>
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.05rem', color: '#F2EEE6', marginBottom: 10, lineHeight: 1.25 }}>{n.title}</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#8C8676', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.summary}</div>
      </div>
    </div>
  );
}

function CardCarousel({ items, accentColor, onOpen, editMode, onEditCard }) {
  const scrollRef = useRef(null);
  const scrollBy = dir => { if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 324, behavior: 'smooth' }); };
  return (
    <div style={{ position: 'relative' }}>
      <span onClick={() => scrollBy(-1)} data-cursor-hover="true" className="carousel-arrow" style={{ position: 'absolute', left: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 2, cursor: 'pointer', fontSize: '1.6rem', color: accentColor, background: '#141210', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>‹</span>
      <div ref={scrollRef} className="carousel-track" style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '4px 2px 12px', scrollbarWidth: 'none' }}>
        {items.map((n, i) => <div key={i} className="carousel-card" style={{ scrollSnapAlign: 'start' }}><NoteCard n={n} accentColor={accentColor} onClick={() => onOpen(n)} editMode={editMode} onEditCard={() => onEditCard(n)} /></div>)}
      </div>
      <span onClick={() => scrollBy(1)} data-cursor-hover="true" className="carousel-arrow" style={{ position: 'absolute', right: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 2, cursor: 'pointer', fontSize: '1.6rem', color: accentColor, background: '#141210', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>›</span>
    </div>
  );
}

function QuantLabSection({ ink = '#0A0A0A', inkFaint = '#8C8C8C', inkMuted = '#4D4D4D', line = 'rgba(10,10,10,0.12)', accentColor = '#F5C518', labelColor = accentColor }) {
  const [openSlug, setOpenSlug] = useState(null);
  const closeNote = useReaderRoute('research', openSlug, setOpenSlug);
  const [overrides, setOverrides] = useState({});
  const [ready, setReady] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [pwPrompt, setPwPrompt] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [editingSlug, setEditingSlug] = useState(null);
  const [jsonDraft, setJsonDraft] = useState('');
  const [saveError, setSaveError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [newChoice, setNewChoice] = useState(false);
  const [simpleEditing, setSimpleEditing] = useState(null);
  useScrollLock(!!(openSlug || editingSlug || simpleEditing));
  const [simpleForm, setSimpleForm] = useState({ title: '', subtitle: '', summary: '', tags: '', cover_image: '' });
  const simpleBodyRef = useRef(null);
  const simpleFileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    if (!ready) return;
    const sb = getSb();
    if (!sb) return;
    sb.from('quant_overrides').select('*').then(({ data, error }) => {
      if (!error && data) {
        const map = {};
        data.forEach(row => { map[row.slug] = noEmDash(row.data); });
        setOverrides(map);
      }
    });
  }, [ready]);

  const notes = RESEARCH_NOTES.map(n => (overrides[n.slug] ? { ...n, ...overrides[n.slug] } : n))
    .concat(Object.keys(overrides).filter(slug => !RESEARCH_NOTES.some(n => n.slug === slug)).map(slug => overrides[slug]));
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));
  const filteredNotes = activeTag ? notes.filter(n => (n.tags || []).includes(activeTag)) : notes;

  useEffect(() => {
    document.body.dataset.fullscreenOverlay = (openSlug || editingSlug || simpleEditing) ? '1' : '';
    return () => { document.body.dataset.fullscreenOverlay = ''; };
  }, [openSlug, editingSlug, simpleEditing]);

  // Restore editor auth state from the httpOnly session cookie set by
  // /api/editor/login, shared across Quant Lab and Blog on this page.
  useEffect(() => {
    fetch('/api/editor/status').then(r => r.json()).then(d => setAuthed(!!d.authed)).catch(() => {});
  }, []);

  const submitPassword = () => {
    fetch('/api/editor/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwInput }),
    })
      .then(r => r.json())
      .then(d => { if (d.ok) { setAuthed(true); setPwPrompt(false); } setPwInput(''); })
      .catch(() => setPwInput(''));
  };
  const lockEditor = () => {
    setAuthed(false);
    fetch('/api/editor/logout', { method: 'POST' }).catch(() => {});
  };
  const startNew = () => {
    if (!authed) { setPwPrompt(true); return; }
    setNewChoice(true);
  };
  const startNewStructured = () => {
    setNewChoice(false);
    const slug = 'note-' + Date.now();
    const template = { slug, num: String(notes.length + 1).padStart(2, '0'), title: 'New Research Note', subtitle: '', tags: [], summary: '', slides: [{ kicker: 'Context', headline: '', body: [''] }] };
    setJsonDraft(JSON.stringify(template, null, 2));
    setSaveError('');
    setEditingSlug(slug);
  };
  const startNewSimple = () => {
    setNewChoice(false);
    setSimpleForm({ title: '', subtitle: '', summary: '', tags: '', cover_image: '' });
    setSimpleEditing('note-' + Date.now());
    setTimeout(() => { if (simpleBodyRef.current) simpleBodyRef.current.innerHTML = ''; }, 0);
  };
  const startEdit = (slug) => {
    if (!authed) { setPwPrompt(true); return; }
    const n = notes.find(x => x.slug === slug);
    if (n.format === 'simple') {
      setSimpleForm({ title: n.title || '', subtitle: n.subtitle || '', summary: n.summary || '', tags: (n.tags || []).join(', '), cover_image: n.cover_image || '' });
      setSimpleEditing(slug);
      setTimeout(() => { if (simpleBodyRef.current) simpleBodyRef.current.innerHTML = n.body_html || ''; }, 0);
      return;
    }
    setJsonDraft(JSON.stringify(n, null, 2));
    setSaveError('');
    setEditingSlug(slug);
  };
  const uploadImage = (file, cb) => {
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append('file', file);
    body.append('prefix', 'quant');
    fetch('/api/editor/upload', { method: 'POST', body })
      .then(r => r.json())
      .then(d => { setUploading(false); if (d.ok) cb(d.url); })
      .catch(() => setUploading(false));
  };
  const execSimple = (cmd, val) => { document.execCommand(cmd, false, val); simpleBodyRef.current && simpleBodyRef.current.focus(); };
  const insertSimpleCode = () => {
    const code = prompt('Paste code:');
    if (!code) return;
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    execSimple('insertHTML', `<pre style="background:#0D0D0D;color:#E8E4DC;border-radius:8px;padding:16px 18px;font-family:'DM Mono',monospace;font-size:0.8rem;line-height:1.6;overflow-x:auto;white-space:pre;">${escaped}</pre><p><br></p>`);
  };
  const saveSimple = () => {
    const parsed = {
      slug: simpleEditing, format: 'simple', num: String(notes.length + 1).padStart(2, '0'),
      title: simpleForm.title, subtitle: simpleForm.subtitle, summary: simpleForm.summary,
      tags: simpleForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      cover_image: simpleForm.cover_image, body_html: simpleBodyRef.current ? simpleBodyRef.current.innerHTML : '',
    };
    fetch('/api/editor/quant-overrides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: simpleEditing, data: parsed }),
    })
      .then(r => r.json())
      .then(d => {
        if (!d.ok) { setSaveError(d.error || 'Save failed.'); return; }
        setOverrides(prev => ({ ...prev, [simpleEditing]: parsed }));
        setSimpleEditing(null);
      })
      .catch(() => setSaveError('Save failed.'));
  };
  const saveEdit = () => {
    let parsed;
    try { parsed = JSON.parse(jsonDraft); } catch (e) { setSaveError('Invalid JSON: ' + e.message); return; }
    fetch('/api/editor/quant-overrides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: editingSlug, data: parsed }),
    })
      .then(r => r.json())
      .then(d => {
        if (!d.ok) { setSaveError(d.error || 'Save failed.'); return; }
        setOverrides(prev => ({ ...prev, [editingSlug]: parsed }));
        setEditingSlug(null);
      })
      .catch(() => setSaveError('Save failed.'));
  };

  return (
    <div>
      <div className="sec-label" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, color: inkFaint }}>
        <span style={{ color: labelColor }}>Quant Lab</span>
        <span style={{ flex: 1, height: 1, maxWidth: 80, background: labelColor, opacity: 0.4 }} />
        <span onClick={() => authed && setEditMode(m => !m)} data-cursor-hover="true" style={{ cursor: authed ? 'pointer' : 'default', color: editMode ? labelColor : inkFaint, opacity: authed ? 1 : 0.4 }}>Edit</span>
        <span onClick={startNew} data-cursor-hover="true" style={{ cursor: 'pointer', color: authed ? labelColor : inkFaint, opacity: authed ? 1 : 0.4 }}>New</span>
        <span onClick={() => authed ? lockEditor() : setPwPrompt(true)} data-cursor-hover="true" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title={authed ? 'Unlocked, click to lock' : 'Locked, click to unlock'}>
          {authed ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={labelColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 017.75-1.5" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0" /></svg>
          )}
        </span>
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em', fontSize: 'clamp(32px,4vw,52px)', margin: '0 0 12px', color: ink }}>Research Notes</h2>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.05em', color: inkFaint, margin: '0 0 20px' }}>Focused write-ups, not publications.</p>

      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          <span onClick={() => setActiveTag(null)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 3, border: `1px solid ${!activeTag ? accentColor : line}`, background: !activeTag ? accentColor : 'transparent', color: !activeTag ? '#0A0A0A' : inkFaint }}>All</span>
          {allTags.map(t => (
            <span key={t} onClick={() => setActiveTag(t)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 3, border: `1px solid ${activeTag === t ? accentColor : line}`, background: activeTag === t ? accentColor : 'transparent', color: activeTag === t ? '#0A0A0A' : inkFaint }}>{t}</span>
          ))}
        </div>
      )}

      <CardCarousel items={filteredNotes} accentColor={accentColor} editMode={editMode} onOpen={n => setOpenSlug(n.slug)} onEditCard={n => startEdit(n.slug)} />

      {openSlug && <ResearchCaseStudy slug={openSlug} note={notes.find(n => n.slug === openSlug)} onClose={closeNote} authed={authed} onEdit={() => startEdit(openSlug)} />}

      {pwPrompt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPwPrompt(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#141210', padding: 32, borderRadius: 12, width: 280 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8C8676', marginBottom: 12 }}>Editor password</div>
            <input type="password" value={pwInput} onChange={e => setPwInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitPassword()} autoFocus
              style={{ width: '100%', padding: '10px 12px', fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, background: 'transparent', color: '#F2EEE6', marginBottom: 12 }} />
            <button onClick={submitPassword} style={{ width: '100%', padding: '10px 0', borderRadius: 6, border: 'none', background: accentColor, color: '#0A0A0A', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Unlock</button>
          </div>
        </div>
      )}

      {newChoice && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setNewChoice(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#141210', padding: 32, borderRadius: 12, width: 320 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8C8676', marginBottom: 16 }}>New research note</div>
            <button onClick={startNewStructured} style={{ width: '100%', padding: '12px 0', marginBottom: 10, borderRadius: 6, border: `1px solid ${accentColor}`, background: 'transparent', color: accentColor, fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Structured (slides, equations, code)</button>
            <button onClick={startNewSimple} style={{ width: '100%', padding: '12px 0', borderRadius: 6, border: `1px solid ${accentColor}`, background: 'transparent', color: accentColor, fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Simple (rich text, like Blog)</button>
          </div>
        </div>
      )}

      {simpleEditing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 360, background: '#151210', overflowY: 'auto', overscrollBehavior: 'contain' }}>
          <div className="reader-body" style={{ maxWidth: 780, margin: '0 auto', padding: '60px 32px 120px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <span onClick={() => setSimpleEditing(null)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8C8676' }}>Cancel</span>
              <button onClick={saveSimple} style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: accentColor, color: '#0A0A0A', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Save & publish</button>
            </div>
            <input placeholder="Title" value={simpleForm.title} onChange={e => setSimpleForm({ ...simpleForm, title: e.target.value })}
              style={{ width: '100%', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'transparent', fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '2rem', color: '#F2EEE6', padding: '8px 0', marginBottom: 16, outline: 'none' }} />
            <input placeholder="Subtitle" value={simpleForm.subtitle} onChange={e => setSimpleForm({ ...simpleForm, subtitle: e.target.value })}
              style={{ width: '100%', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'transparent', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', color: '#8C8676', padding: '8px 0', marginBottom: 16, outline: 'none' }} />
            <textarea placeholder="One-line summary" value={simpleForm.summary} onChange={e => setSimpleForm({ ...simpleForm, summary: e.target.value })} rows={2}
              style={{ width: '100%', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, background: 'transparent', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#E8E4DC', padding: '10px 12px', marginBottom: 16, outline: 'none', resize: 'vertical' }} />
            <TagPicker value={simpleForm.tags} allTags={allTags} onChange={t => setSimpleForm({ ...simpleForm, tags: t })} accentColor={accentColor} />
            <div style={{ marginBottom: 16 }}>
              <input ref={simpleFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadImage(e.target.files[0], url => setSimpleForm(f => ({ ...f, cover_image: url })))} />
              <button onClick={() => simpleFileRef.current.click()} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#E8E4DC', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', cursor: 'pointer' }}>{uploading ? 'Uploading…' : simpleForm.cover_image ? 'Cover image ✓' : 'Upload cover image'}</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 8 }}>
              <button onClick={() => execSimple('bold')} style={{ padding: '6px 10px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#E8E4DC', cursor: 'pointer', borderRadius: 4 }}>B</button>
              <button onClick={() => execSimple('formatBlock', 'H2')} style={{ padding: '6px 10px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#E8E4DC', cursor: 'pointer', borderRadius: 4 }}>H2</button>
              <button onClick={() => { const url = prompt('Link URL:'); if (url) execSimple('createLink', url); }} style={{ padding: '6px 10px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#E8E4DC', cursor: 'pointer', borderRadius: 4 }}>Link</button>
              <button onClick={insertSimpleCode} style={{ padding: '6px 10px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#E8E4DC', cursor: 'pointer', borderRadius: 4, fontFamily: "'DM Mono', monospace" }}>{'</>'}</button>
              <button onClick={() => simpleFileRef.current.click() || (simpleFileRef.current.onchange = e => uploadImage(e.target.files[0], url => execSimple('insertImage', url)))} style={{ padding: '6px 10px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#E8E4DC', cursor: 'pointer', borderRadius: 4 }}>Image</button>
            </div>
            <div ref={simpleBodyRef} contentEditable suppressContentEditableWarning style={{ minHeight: 300, fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', lineHeight: 1.7, color: '#E8E4DC', outline: 'none' }} />
          </div>
        </div>
      )}

      {editingSlug && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 360, background: '#151210', overflowY: 'auto', overscrollBehavior: 'contain' }}>
          <div className="reader-body" style={{ maxWidth: 800, margin: '0 auto', padding: '60px 32px 100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span onClick={() => setEditingSlug(null)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8C8676' }}>Cancel</span>
              <button onClick={saveEdit} style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: accentColor, color: '#0A0A0A', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Save</button>
            </div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#8C8676', marginBottom: 12 }}>Edit the note's fields as JSON (title, subtitle, summary, tags, slides[]).</p>
            {saveError && <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#FF6B6B', marginBottom: 12 }}>{saveError}</p>}
            <textarea value={jsonDraft} onChange={e => setJsonDraft(e.target.value)} spellCheck={false}
              style={{ width: '100%', minHeight: 520, background: '#0D0D0D', color: '#E8E4DC', fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', lineHeight: 1.6, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 16, outline: 'none' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default QuantLabSection;
