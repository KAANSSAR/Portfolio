// Case studies shown in the Quant Lab section. Generated from content.py and voice.py.
// Each has a short set of slides for most readers and an optional technical deep dive.
export const CASE_STUDIES = [
 {
  "slug": "case-cardinal",
  "caseStudy": true,
  "num": "CS",
  "cardTitle": "Cardinal: an equity research terminal",
  "title": "Cardinal",
  "subtitle": "An equity research terminal with valuation, signals and backtests, read by four AI analysts",
  "tags": [
   "Case Study",
   "Python",
   "LLM agents"
  ],
  "summary": "Cardinal values a stock, reads its market signals and backtests it, all on one screen. Four AI analysts then explain the results. Most of the work went into making sure they explain the numbers and do not invent them.",
  "relatedProjects": [
   {
    "name": "Cardinal on GitHub",
    "url": "https://github.com/KAANSSAR/Cardinal"
   }
  ],
  "slides": [
   {
    "kicker": "The problem",
    "headline": "Why I built it",
    "body": [
     "To form a view on a stock, you need a valuation, some market signals, a backtest and a way to bring them together. These usually sit in separate tools. The one product that has all of them, a Bloomberg Terminal, costs about US$24,000 a year.",
     "Cardinal puts them on one screen for any ticker in the US, India or Europe. It has a discounted cash flow (DCF) valuation with sliders, a comparison against similar companies, momentum and volatility signals, and two backtested strategies. Four AI analysts, named after Barça's midfield, read the results. Three of them each cover one part, and the fourth gives a BUY, HOLD or SELL call."
    ],
    "stat": {
     "value": "249",
     "label": "tests across 13 files, all passing"
    }
   },
   {
    "kicker": "How it works",
    "headline": "The code calculates and the model explains",
    "body": [
     "Every number in Cardinal is calculated in Python. The language model does not produce any of them. The engines first build a fixed snapshot of the data for the ticker, and only then do the analysts read it.",
     "Xavi reads the valuation, Iniesta reads the signals and Busquets reads the backtest. Messi reads their three reports and makes the call. The backend is FastAPI with 20 endpoints, and the frontend is React and TypeScript."
    ],
    "image": {
     "src": "/research/case-cardinal/architecture.png",
     "alt": "Cardinal architecture: market data feeds the core engines, which produce a frozen snapshot read by three analyst agents, whose memos feed the portfolio manager",
     "caption": "The analysts read the same fixed snapshot and never see the raw data. Only Messi reads the other three reports."
    }
   },
   {
    "kicker": "The main problem",
    "headline": "Keeping the analysts in line with the numbers",
    "body": [
     "The first versions read well but were often wrong. A DCF value far from both the market price and the comparison value was treated as a serious bear case. The valuation used one beta while Iniesta measured another. Running the same ticker twice could change the call.",
     "I fixed these with checks in the code, not with longer prompts. A DCF value more than 70% away from both the market price and the comparison value is flagged, and the analysts have to mention it. When both values exist, both are shown, and a gap of more than 50% is flagged. If the two betas differ by more than 10%, the valuation is shown with each. Messi runs at a low temperature, his call is cached for each set of inputs, and he has to keep any caution the other analysts gave."
    ],
    "stat": {
     "value": ">70%",
     "label": "gap from both the market price and the comparison value that flags a DCF result"
    }
   },
   {
    "kicker": "Results",
    "headline": "Faster, more consistent, and checked by people",
    "body": [
     "Before calling the model, each analyst checks two places: a database of answers people have approved, then a cache that lasts one hour. A full run that is already cached takes under a second instead of about 18.",
     "Readers can rate each report. Once an answer for the same ticker and inputs gets three positive ratings, it is marked as approved and returned straight away after that. An admin page shows the stored answers, how long each call took and where each answer came from."
    ],
    "stat": {
     "value": "~18s → <1s",
     "label": "for a full run with all four analysts, before and after caching"
    }
   },
   {
    "kicker": "What I learned",
    "headline": "Keep decisions out of the model",
    "body": [
     "Better prompts helped less than moving decisions into code. The signal, the warning flags and the call all have rules behind them now, and the model has to report them. The model is good at explaining a result. It should not be the only thing between the user and a wrong number.",
     "Next, I want the signal label to remember its last state so it changes less often (the technical section explains this), add slippage to the backtests, and put Cardinal online so anyone can try it."
    ]
   }
  ],
  "deepDive": [
   {
    "kicker": "Valuation",
    "headline": "The DCF engine",
    "body": [
     "The DCF is a pure function. It takes a fixed snapshot of the company and the slider settings, and returns the result. It does not fetch any data itself. The cost of equity comes from CAPM, the discount rate (WACC) uses the market value of equity and the after-tax cost of debt, cash flow grows at the chosen rate for 1 to 15 years, and a Gordon growth model gives the terminal value.",
     "The engine rejects any inputs where WACC is not above the terminal growth rate, because the formula does not work there. It also reports how much of the value comes from the terminal value, and shows cash flows before and after discounting, so that a falling discounted value is not read as a falling business."
    ],
    "equation": "\\text{WACC}=\\tfrac{E}{V}\\left(r_f+\\beta\\,\\text{MRP}\\right)+\\tfrac{D}{V}\\,r_d\\,(1-t),\\qquad TV=\\frac{FCF_n\\,(1+g)}{\\text{WACC}-g}",
    "code": {
     "lang": "python",
     "content": "wacc = compute_wacc(snapshot)\nif wacc <= assumptions.terminal_growth_rate:\n    raise ValueError('WACC must exceed g for Gordon growth to converge')\nfcf = project_free_cash_flows(snapshot.free_cash_flow_ttm, g, years)\npv = discount_to_present_value(fcf, wacc)\ntv = terminal_value_gordon_growth(fcf[-1], wacc, g_terminal)\nev = sum(pv) + tv / (1 + wacc) ** years\nper_share = (ev - snapshot.net_debt) / snapshot.shares_outstanding"
    }
   },
   {
    "kicker": "Signals",
    "headline": "How the signal label is scored",
    "body": [
     "Iniesta's label (BULLISH, NEUTRAL or BEARISH) is calculated in code. Each measure adds or removes points. The 252-day momentum counts for up to two points. The 60-day and 20-day momentum, the 252-day Sharpe ratio and extreme RSI values count for one each. A score of +3 or more is bullish, −3 or less is bearish, and anything in between is neutral.",
     "I described this as hysteresis in the README, but that is not quite right. Several measures have to agree before the label changes, so one noisy measure cannot change it. However, the function does not remember the previous label. Real hysteresis would keep the last label and need a larger move to leave it, for example +4 to become bullish but below +2 to stop being bullish. This is the next change."
    ],
    "code": {
     "lang": "python",
     "content": "score = 0\nif mom_252d > 0.5: score += 2\nelif mom_252d > 0.3: score += 1\nelif mom_252d < -0.5: score -= 2\nelif mom_252d < -0.3: score -= 1\nif mom_60d > 0.3: score += 1\nelif mom_60d < -0.3: score -= 1\nif sharpe_252d > 1.5: score += 1\nelif sharpe_252d < 0: score -= 1\nif rsi < 25: score += 1      # oversold\nelif rsi > 75: score -= 1    # overbought\nreturn 'BULLISH' if score >= 3 else 'BEARISH' if score <= -3 else 'NEUTRAL'"
    }
   },
   {
    "kicker": "Analysts",
    "headline": "Where each answer comes from",
    "body": [
     "Each request is identified by the analyst, the ticker and a hash of the inputs. The API first checks a SQLite database of approved answers. If there is no match, it checks a cache that lasts one hour, and only then calls Gemini Flash.",
     "All model calls go through one client. It retries only on 429 and 503 errors, up to four times, waiting between 2 and 15 seconds. Each call is logged with its source (database, cache or model) and how long it took, and the admin page charts this. When Messi is asked for a call, the other three analysts run in order first."
    ],
    "code": {
     "lang": "python",
     "content": "@retry(retry=retry_if_exception(_is_retryable),\n       wait=wait_exponential(multiplier=1, min=2, max=15),\n       stop=stop_after_attempt(4), reraise=True)\ndef generate(prompt, system_prompt, max_output_tokens=2048, temperature=0.4):\n    ...\n\n# per analyst request\nentry = gt_db.get_verified_entry('xavi', ticker, params_key)\nif entry: return entry          # human-verified, instant\n# then the 1h TTL cache, then generate(...)"
    }
   },
   {
    "kicker": "Backtests",
    "headline": "Two simple strategies",
    "body": [
     "The momentum test buys when the 50-day moving average crosses above the 200-day average and sells when it crosses back, with a 0.1% fee on each trade. It needs at least 210 trading days and returns an error if there are fewer. The second test is a mean reversion strategy on the same prices.",
     "Both report total return, a Sharpe ratio, maximum drawdown and an equity curve. They test one stock at a time and include fees but not slippage. This is why Busquets has to say when there are too few trades to trust the result, and why Messi cannot leave that out."
    ],
    "stat": {
     "value": "50 / 200",
     "label": "day moving averages in the momentum test, with a 0.1% fee per trade"
    }
   }
  ]
 },
 {
  "slug": "case-stratum",
  "caseStudy": true,
  "num": "CS",
  "cardTitle": "Stratum: momentum across the NSE 500",
  "title": "Stratum",
  "subtitle": "A momentum screener and backtester for the 500 stocks in the NIFTY 500 index",
  "tags": [
   "Case Study",
   "Python",
   "Momentum"
  ],
  "summary": "Stratum ranks the 500 stocks in India's NIFTY 500 index by momentum and backtests a monthly strategy. The ranking itself is short. Most of the work was getting reliable data out of the exchange's public files.",
  "relatedProjects": [
   {
    "name": "Stratum on GitHub",
    "url": "https://github.com/KAANSSAR/Stratum"
   }
  ],
  "slides": [
   {
    "kicker": "The problem",
    "headline": "Which of India's 500 largest stocks are trending?",
    "body": [
     "Momentum means buying stocks that have been rising, and it is one of the most studied effects in markets. Testing it on Indian stocks is harder than it sounds. There is no free, clean price feed, and the exchange (NSE) publishes its data as daily files that skip weekends, holidays and suspended stocks.",
     "Stratum reads the NIFTY 500 list of companies and the daily price files. It works out how each stock performed over a chosen period, from one week to a year, ranks them, and backtests a monthly momentum portfolio. A dashboard shows the results by sector, as a histogram of returns, and as a table that can be searched and exported."
    ],
    "stat": {
     "value": "500",
     "label": "stocks ranked on each request, from public NSE files"
    }
   },
   {
    "kicker": "How it works",
    "headline": "A data pipeline with a ranking engine on top",
    "body": [
     "A FastAPI backend does all the work that is specific to the exchange. It downloads the files, uses the previous trading day when a date has no data, fills gaps for suspended or new stocks, groups results by sector and calculates momentum. The Next.js frontend only displays what the backend returns.",
     "Everything downloaded is cached. A day's price file does not change once it is published, so it is saved to disk as a Parquet file and kept. The list of companies only changes when the index is updated, so it is refreshed every 12 hours."
    ],
    "image": {
     "src": "/research/case-stratum/architecture.png",
     "alt": "Stratum architecture: NSE archives feed a fetch layer with retries and trading-day fallback, then a cache, which feeds the momentum engine, the backtest loop and the dashboard",
     "caption": "The frontend never contacts the exchange. All of the fallback and caching logic is in one place on the backend."
    }
   },
   {
    "kicker": "The signal",
    "headline": "Both time periods have to agree",
    "body": [
     "A stock that jumped last month but has been flat for six months is not really trending, but a signal based on one period would rank it highly. Stratum only considers a stock if its 1-month and 6-month returns are both positive or both negative.",
     "The stocks that pass are ranked by a combined z-score over both periods, not by their raw returns. Six-month returns are usually larger than one-month returns, so each is standardised across the 500 stocks first. This stops the longer period from deciding the ranking on its own. The backtest buys the top 30 in equal amounts at the end of each month and holds them for a month."
    ],
    "stat": {
     "value": "1M + 6M",
     "label": "periods that must agree before a stock can be ranked (the defaults)"
    }
   },
   {
    "kicker": "Limitations",
    "headline": "What the backtest does not include",
    "body": [
     "A momentum backtest can easily look better than it should. Stratum lists what it leaves out at the top of the backtest code. It does not include trading costs or slippage. It uses today's list of companies for every past date, which makes older periods look better, because companies that collapsed are no longer on the list. It also does not adjust for stock splits or bonus issues.",
     "I would rather show where the results are too optimistic than hide it. All three can be fixed, and the first two would change the results the most."
    ]
   },
   {
    "kicker": "What I learned",
    "headline": "With market data, most of the work is in the data",
    "body": [
     "The momentum calculation is simple. The difficult cases were holidays, files missing for one day, companies that changed their symbol and stocks that stopped trading partway through a period. Handling these once, in the data layer, and caching the results made everything built on top of it simpler.",
     "Next, I want to use the historical list of companies to remove the survivorship bias, add trading costs, and add a risk module (VaR, CVaR and portfolio optimisation) on the same data."
    ]
   }
  ],
  "deepDive": [
   {
    "kicker": "Ranking",
    "headline": "The two-period check and the combined score",
    "body": [
     "For each period, the engine takes every stock's percentage return and standardises it against the other stocks: it subtracts the average and divides by the standard deviation. It then averages the two z-scores. A stock only counts if both of its returns have the same sign.",
     "With this check on, which is the default, the ranked list can have fewer stocks than requested when the market is weak. This is on purpose. Filling all 30 places when only 12 stocks qualify would turn it into a strategy that buys the stocks that fell least, which is not momentum."
    ],
    "equation": "z_i^{(w)}=\\frac{r_i^{(w)}-\\bar r^{(w)}}{\\sigma^{(w)}},\\qquad s_i=\\tfrac12\\left(z_i^{(1M)}+z_i^{(6M)}\\right),\\qquad \\text{eligible}\\iff \\operatorname{sign} r_i^{(1M)}=\\operatorname{sign} r_i^{(6M)}",
    "code": {
     "lang": "python",
     "content": "short_z, long_z = _zscore(short_returns), _zscore(long_returns)\nfor sym in symbols:\n    sr, lr = short_returns.get(sym), long_returns.get(sym)\n    if None in (sr, lr):\n        continue\n    composite = (short_z[sym] + long_z[sym]) / 2\n    confirmed = (sr > 0 and lr > 0) or (sr < 0 and lr < 0)\n\ncandidates = [s for s in scores if s.confirmed]\ncandidates.sort(key=lambda s: s.composite_z, reverse=True)\nreturn candidates[:top_n]"
    }
   },
   {
    "kicker": "Data",
    "headline": "Fallbacks, gap filling and retries",
    "body": [
     "NSE publishes one price file for each trading day. Asking for a Saturday returns nothing, so every request goes back one day at a time, up to 30 days, until it finds a file. Stocks missing from a file, for example because they were suspended, are filled in from the closest earlier file that has them.",
     "Downloads are retried three times, waiting between 0.5 and 4 seconds. Files are saved as Parquet in a folder that can be changed with a setting, which also lets the tests use a temporary folder and run without contacting the exchange."
    ],
    "code": {
     "lang": "python",
     "content": "@retry(stop=stop_after_attempt(3),\n       wait=wait_exponential(multiplier=0.5, min=0.5, max=4))\ndef _get_bhavcopy_raw(date_str): ...\n\nasync def fetch_bhavcopy_with_fallback(target, max_lookback_days=30):\n    for i in range(max_lookback_days):\n        day = target - timedelta(days=i)\n        df = await _get_cached_df(day)   # Parquet first, then NSE\n        if df is not None:\n            return day, df\n    return None, None"
    }
   },
   {
    "kicker": "Backtest",
    "headline": "Monthly rebalancing with equal weights",
    "body": [
     "The rebalance dates are the last trading day of each month. On each date the engine calculates both returns, ranks the stocks, buys the top N in equal amounts and records each stock's return until the next date. The return for the month is the simple average of these.",
     "From the monthly returns it calculates the total return, a Sharpe ratio (scaled by the square root of 12), the maximum drawdown and the share of winning months. It also shows a table for each month so any single month can be checked. Because the periods are measured in calendar months, they are close to, but not exactly, a fixed number of trading days."
    ],
    "equation": "R_t=\\frac1{|P_t|}\\sum_{i\\in P_t} r_{i,t},\\qquad \\text{Sharpe}=\\sqrt{12}\\,\\frac{\\bar R}{\\sigma_R}"
   }
  ]
 },
 {
  "slug": "case-options-pricing-engine",
  "caseStudy": true,
  "num": "CS",
  "cardTitle": "Options Pricing Engine: three models that check each other",
  "title": "Options Pricing Engine",
  "subtitle": "Black-Scholes, a binomial tree and Monte Carlo, written from scratch and checked against each other",
  "tags": [
   "Case Study",
   "Python",
   "Derivatives"
  ],
  "summary": "A pricing library with three different models that have to agree, a Streamlit dashboard using live market data, and 220 tests. While writing this up, I also found a problem the tests had missed.",
  "relatedProjects": [
   {
    "name": "Options Pricing Engine on GitHub",
    "url": "https://github.com/KAANSSAR/Options-Pricing-Engine"
   }
  ],
  "slides": [
   {
    "kicker": "The problem",
    "headline": "How do you know an option price is right?",
    "body": [
     "The fair value of an option comes from a model, and a model is only as good as its code. A wrong sign in one Greek or a small error in a tree can still give a price that looks reasonable.",
     "I wrote three pricing methods from scratch: the Black-Scholes formula, a Cox-Ross-Rubinstein binomial tree and a Monte Carlo simulation. They reach the price in completely different ways, so they can be used to check each other. For a call with a spot price of 150, a strike of 155, three months to expiry, a 5% rate and 25% volatility, they give $6.114, $6.113 and $6.128."
    ],
    "stat": {
     "value": "220",
     "label": "tests across five modules, run on Python 3.10 to 3.12"
    }
   },
   {
    "kicker": "How it works",
    "headline": "A library, a dashboard and a solver",
    "body": [
     "The library prices European and American options and calculates all five Greeks from their formulas. An implied volatility solver works backwards from a market price. A Streamlit dashboard with seven tabs uses live prices and historical volatility from Yahoo Finance, with the US 13-week Treasury bill as the risk-free rate.",
     "The dashboard compares the three models, shows how the Greeks change, shows where early exercise happens in the tree, plots simulated prices, and draws a volatility surface and a volatility smile from live option prices."
    ],
    "stat": {
     "value": "$0.25",
     "label": "value of early exercise for the same 3-month put: $9.44 American against $9.19 European"
    }
   },
   {
    "kicker": "Testing",
    "headline": "Checking the models against each other",
    "body": [
     "The tests check the finance as well as the code. Put-call parity must hold, and across 108 combinations of strike, expiry and volatility the largest difference is 3 × 10⁻¹⁴. The tree must get closer to Black-Scholes as the number of steps goes up. An American option must never be worth less than the same European option. The implied volatility solver must return the volatility it was given, and it does to within 10⁻¹² wherever the option's vega is not close to zero.",
     "Monte Carlo is checked with statistics. The average simulated price must match the forward price, and the standard error must fall with the square root of the number of paths."
    ],
    "image": {
     "src": "/research/case-options-pricing-engine/premium.png",
     "alt": "Early exercise premium of an American put rising with strike",
     "caption": "An American put minus the same European put, on a 400-step tree. The further the put is in the money, the more the right to exercise early is worth."
    }
   },
   {
    "kicker": "What the tests missed",
    "headline": "The Monte Carlo error was overstated",
    "body": [
     "While writing this, I ran the Monte Carlo pricer 300 times with different random seeds. Antithetic variates, which pair each random path with its mirror image, do reduce the real error. The spread of prices fell from $0.077 to $0.062, about 35% less variance. However, the standard error the pricer reports hardly changed. This is because it treats the two paths in each pair as independent, when they are not.",
     "So the confidence interval is safe but too wide, and the README overstated the improvement as halving the variance. The fix is small: average each pair first, then calculate the standard error over the pairs. I also found one test that now fails because it uses a fixed expiry date that has passed."
    ],
    "image": {
     "src": "/research/case-options-pricing-engine/antithetic.png",
     "alt": "Actual versus reported Monte Carlo error with and without antithetic variates",
     "caption": "Gold: how much the price actually varies between runs. Grey: the error the pricer reports. With antithetic pairs, the gap between them is the bug."
    }
   },
   {
    "kicker": "What I learned",
    "headline": "Tests only check what you thought to ask",
    "body": [
     "220 passing tests did not catch a standard error that was wrong, because no test compared the reported error with the actual spread of results. For a simulation, the most useful test is to run it many times and look at the spread, not at a single run.",
     "Next, I will fix the standard error, give the date test a fixed date, add a control variate using Black-Scholes, and price Asian and barrier options, where Monte Carlo is the only one of the three methods that still works."
    ]
   }
  ],
  "deepDive": [
   {
    "kicker": "Black-Scholes",
    "headline": "The formula and the Greeks",
    "body": [
     "Prices and all five Greeks come directly from the formulas, with no finite differences in the library. The tests then compare each Greek with a finite difference of the price. This catches sign and scaling errors that a test against one known value would miss.",
     "For the example call, delta is 0.460, gamma 0.021, vega 0.298 per volatility point, theta −0.049 per day and rho 0.157."
    ],
    "equation": "C=S\\,N(d_1)-Ke^{-rT}N(d_2),\\qquad d_{1,2}=\\frac{\\ln(S/K)+(r\\pm\\tfrac12\\sigma^2)T}{\\sigma\\sqrt T}"
   },
   {
    "kicker": "Binomial tree",
    "headline": "It converges, but not smoothly",
    "body": [
     "The tree moves the price up or down by e^(±σ√Δt) at each step, calculates the payoffs at expiry in one step and works backwards. For American options, it compares holding with exercising at every node.",
     "The difference from Black-Scholes does get smaller as the steps increase, but it goes up and down on the way. The strike falls in a different place between the nodes for odd and even numbers of steps, so 25 steps can be more accurate than 50. This is why the tests check eight step counts rather than one, and why a pricer used in practice would average two step counts or place a node on the strike."
    ],
    "image": {
     "src": "/research/case-options-pricing-engine/convergence.png",
     "alt": "Binomial price minus Black-Scholes price oscillating and shrinking as the number of tree steps increases",
     "caption": "Tree price minus Black-Scholes for every step count from 25 to 400. The overall error falls roughly as 1/N, with a sawtooth inside it."
    },
    "code": {
     "lang": "python",
     "content": "u = np.exp(sigma * np.sqrt(dt)); d = 1 / u\np = (np.exp(r * dt) - d) / (u - d)\nj = np.arange(steps + 1)\nV = np.maximum(S * u**(steps - j) * d**j - K, 0)   # call payoff\nfor i in range(steps - 1, -1, -1):\n    V = np.exp(-r * dt) * (p * V[:-1] + (1 - p) * V[1:])\n    if style == 'american':\n        j_i = np.arange(i + 1)\n        St = S * u**(i - j_i) * d**j_i\n        V = np.maximum(V, np.maximum(St - K, 0))   # exercise now?"
    }
   },
   {
    "kicker": "Monte Carlo",
    "headline": "Fixing the standard error",
    "body": [
     "Prices are simulated with log-normal steps under the risk-neutral measure, so the drift is r − σ²/2. With antithetic variates on, half of the random numbers are generated and the other half are their negatives.",
     "The current code takes the standard deviation of all 2n payoffs and divides by √(2n), as if they were independent. Each payoff moves against its pair, so the correct way is to average each pair first. Over 300 seeds with 20,000 paths, the real error is $0.062, compared with the $0.076 the code reports."
    ],
    "equation": "\\hat V=\\frac1n\\sum_{k=1}^{n}\\frac{f(Z_k)+f(-Z_k)}{2},\\qquad \\widehat{\\text{SE}}=\\frac{\\operatorname{sd}\\!\\left(\\tfrac{f(Z_k)+f(-Z_k)}{2}\\right)}{\\sqrt n}",
    "code": {
     "lang": "python",
     "content": "# current: treats the 2n antithetic payoffs as independent\nstd_err = np.std(discounted_payoffs, ddof=1) / np.sqrt(actual_sims)\n\n# fix: average each antithetic pair, then take the error over pairs\nhalf = actual_sims // 2\npairs = 0.5 * (discounted_payoffs[:half] + discounted_payoffs[half:])\nstd_err = np.std(pairs, ddof=1) / np.sqrt(half)"
    }
   },
   {
    "kicker": "Implied volatility",
    "headline": "Brent's method on a bracket",
    "body": [
     "Implied volatility is the volatility that makes the Black-Scholes price equal the market price. The price always rises with volatility, so the solver searches between 10⁻⁶ and 10 using Brent's method, which always converges and does not need vega.",
     "Round trips return the starting volatility to about 10⁻¹³. The only place this fails is far out of the money at low volatility, where the option is worth almost nothing and many volatilities give the same price. The tests cover the no-arbitrage limits, deep in and out of the money options, very short and very long expiries, and high volatility."
    ],
    "stat": {
     "value": "2 × 10⁻¹³",
     "label": "largest implied volatility round-trip error, for volatilities from 5% to 120% where vega is not near zero"
    }
   }
  ]
 },
 {
  "slug": "case-honours-thesis",
  "caseStudy": true,
  "num": "CS",
  "cardTitle": "Honours thesis: a degree planning engine",
  "title": "Honours thesis: a planning engine for engineering degrees",
  "subtitle": "A rule-based engine that repairs degree plans at USYD and UTS, with a language model that only handles the conversation",
  "tags": [
   "Case Study",
   "Python",
   "Verification"
  ],
  "summary": "When a student fails a unit, every later unit that needed it has to move, and every move has to follow the rules. Language models write plans that look right but are not. My thesis builds an engine that gets this right, and then checks that it does.",
  "relatedProjects": [
   {
    "name": "Thesis repository on GitHub",
    "url": "https://github.com/KAANSSAR/honours-thesis"
   }
  ],
  "slides": [
   {
    "kicker": "The problem",
    "headline": "Failing one unit can break a whole degree plan",
    "body": [
     "When a student fails a unit, every later unit that needed it has to move. Each move has to respect prerequisites, corequisites, the semesters a unit is offered in, credit-point requirements and the maximum load in a semester. Students usually work this out by hand or wait for an adviser.",
     "Asking a language model seems like the obvious fix, so I tested that first. Qwen3-8B wrote 14 plans, and none of them was valid. Together they broke 138 rules, most often by placing a unit in a semester when it is not offered."
    ],
    "image": {
     "src": "/research/case-honours-thesis/baseline.png",
     "alt": "Rule violations in plans written by the language model alone, by rule type",
     "caption": "Rule violations across 14 plans written by the model on its own. None of the 14 was valid."
    }
   },
   {
    "kicker": "How it works",
    "headline": "The engine decides and the model explains",
    "body": [
     "I split the job in two. A rule-based engine builds, checks and repairs plans. It is deterministic, so the same request always gets the same answer, and every plan it returns is checked against the published rules. A small language-model layer turns a student's question into a request to the engine and explains the result. It never decides whether a plan is valid.",
     "One engine serves two universities: the University of Sydney (42 standard plans across eight engineering degrees) and UTS Software Engineering (9 plans). The solver does not know which university it is working on. Each university answers the solver's questions through its own rules module."
    ],
    "image": {
     "src": "/research/case-honours-thesis/architecture.png",
     "alt": "Thesis architecture: the student talks to the language layer, which calls the planning engine, which consults per-university rules and is verified by independent checks",
     "caption": "The language model is outside the decision. Everything that can make a plan invalid is handled by the engine."
    }
   },
   {
    "kicker": "Results",
    "headline": "All 1,497 repairs were valid",
    "body": [
     "I failed every unit in every plan, one at a time, which gave 1,497 cases. Every repaired plan followed every rule, and a separately written checker agreed on all 1,497. Failing two units in the same plan, 2,098 pairs, was also repaired correctly every time.",
     "A valid repair could still be longer than it needs to be. To check this, I built a separate model with Google's CP-SAT solver to search for shorter plans. It proved that the engine's repair was the shortest possible in 1,307 of the 1,393 cases it could judge (93.8%)."
    ],
    "image": {
     "src": "/research/case-honours-thesis/scoreboard.png",
     "alt": "Verification results: plans valid, repairs valid, independent checker agreement, two-failure repairs, metamorphic checks, optimality, CP-SAT agreement and planted faults caught",
     "caption": "Each result is produced by a script in the repository, and the run logs are included."
    }
   },
   {
    "kicker": "Consistency",
    "headline": "The same question gets the same answer",
    "body": [
     "I asked the same eight questions as 15 different students. The engine's answer never changed with the student's background, which a system giving study advice needs to guarantee. The explanations are where more work is needed: 24 of 41 were fully faithful to what the engine decided.",
     "The checks also found six problems in the universities' own published plans, where the official material does not follow its own rules."
    ],
    "stat": {
     "value": "0 of 8",
     "label": "questions where the engine's answer changed across 15 students"
    }
   },
   {
    "kicker": "What I learned",
    "headline": "Use the model only where it helps",
    "body": [
     "The project changed direction halfway through. It started as a system of several language-model agents and became a rule-based engine once it was clear the model could not be trusted with the rules. The model is still useful for understanding a question and explaining an answer in plain English.",
     "An engine that claims to be correct is only useful if this can be shown. Checking the engine was as large a part of the thesis as building it: a separate checker, a constraint model, mutation testing and metamorphic tests."
    ]
   }
  ],
  "deepDive": [
   {
    "kicker": "Structure",
    "headline": "One solver for two universities",
    "body": [
     "core.py is the solver, and it does not know which university it is working on. It asks questions through the interface in rules.py: is this unit offered in this semester, are its prerequisites met by this point, is this semester over the load limit, has the student reached the credit points the unit needs. rules_usyd.py and rules_uts.py each answer these for their own handbook.",
     "Only one university's data is loaded at a time, so a Sydney rule can never end up in a UTS plan. The engine, the frontend and the tests use only the Python standard library. OR-Tools and matplotlib are needed only for the evaluation."
    ],
    "code": {
     "lang": "python",
     "content": "# rules.py: the questions the solver asks (excerpt)\nclass Rules:\n    def offered_in(self, code, index, data): ...\n    def prereq_satisfied(self, code, target, schedule, semester_of, prereqs, data): ...\n    def coreq_satisfied(self, code, target, semester_of, coreqs, data): ...\n    def exclusion_satisfied(self, code, semester_of, data): ...\n    def unit_cp(self, code, data): ...\n\n# rules_usyd.py and rules_uts.py each subclass this for their own handbook"
    }
   },
   {
    "kicker": "Checking the engine",
    "headline": "Checking the engine without relying on it",
    "body": [
     "The audit is a second checker, written separately, that reads the engine's output and checks every rule again. It agreed on all 1,497 repairs and found no new violations. The CP-SAT model was written from the rules rather than from the engine. It agreed on 551 of 600 changed plans and is used to check whether repairs are as short as possible.",
     "Metamorphic tests check how answers relate to each other rather than the answers themselves, across every case: 10,479 of 10,479 held. They also showed something I did not expect. In 49 cases, a second failure finished the degree earlier than the first failure alone, because it allowed a second overloaded semester that saved more time than the failure cost. More failures do not always mean a longer degree. An order test also runs everything with different Python hash seeds, to show that the order of a set never changes an answer."
    ],
    "stat": {
     "value": "10,479",
     "label": "metamorphic checks, all of which held"
    }
   },
   {
    "kicker": "Mutation testing",
    "headline": "Would the checks notice a broken engine?",
    "body": [
     "To test the checks, I added nine deliberate faults to the engine and ran the audit on each one. Six were caught, including removing the corequisite check and ignoring the semesters a unit is offered in. Three were not caught: a load limit that is off by one, compaction switched off, and a repair that skips the units that depend on the failed one. A fault that is not caught means the audit cannot tell that engine apart from the real one, so it points to a rule that nothing really tests. The thesis discusses all three.",
     "The optimality result has one detail to note. CP-SAT runs on several threads, so one or two cases can move between 'a shorter plan exists' and 'the solver's plan failed the check' from one run to the next. The number of repairs proved to be the shortest does not change."
    ],
    "stat": {
     "value": "6 of 9",
     "label": "deliberate faults caught by the audit"
    }
   },
   {
    "kicker": "An example",
    "headline": "Failing one UTS unit",
    "body": [
     "Here, a student fails 33130 in their first autumn semester. The engine retakes it in spring, then moves each unit that depends on it to the earliest semester where it is offered and its prerequisites are met. Most single failures move only one unit, but a few long chains of prerequisites move ten or more.",
     "The language layer then explains which units moved and why, using the facts the engine returns rather than anything it remembers about the degree."
    ],
    "image": {
     "src": "/research/case-honours-thesis/repair.png",
     "alt": "Timeline of one repair: the failed unit is retaken and five dependent units each move to a later session",
     "caption": "Filled dot: the original semester. Open dot: after the repair. The dotted line is the published end of the degree."
    }
   }
  ]
 }
];
