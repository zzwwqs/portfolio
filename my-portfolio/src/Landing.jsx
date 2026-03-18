import { useState, useEffect, useRef, useCallback } from 'react'
import ColorBends from './ColorBends'
import './landing.css'
// 导入头像资源（放在组件顶部）
import avatar from './assets/avatar.png';

const PROJECTS = [
  {
    id: 'vika',
    title: 'vika',
    context: '占位：这是一个效率工具体验升级项目。补充目标用户、关键约束与成功指标。',
    role: ['占位：负责信息架构与关键流程设计', '占位：搭建组件规范与交付规则', '占位：与研发协作完成落地与验收'],
    approach: ['占位：对关键任务流做梳理与分层', '占位：方案对比并明确取舍', '占位：沉淀可复用的设计系统片段'],
    result: '占位：补充数据或可验证结果（例如：完成率/时长/满意度/上线范围）。',
  },
  {
    id: 'bika',
    title: 'bika',
    context: '占位：从 0 到 1 定义产品体验，覆盖核心信息结构与交互框架。',
    role: ['占位：定义信息架构与导航结构', '占位：制作高保真与原型验证', '占位：推动跨团队对齐与落地'],
    approach: ['占位：建立体验原则与设计基线', '占位：关键页面/状态的系统化设计', '占位：交付可维护的组件化规范'],
    result: '占位：补充结果（例如：转化、留存、支持成本等）。',
  },
  {
    id: 'other',
    title: '其他',
    context: '占位：若干视觉/动效/交互探索合集，可替换为你最想展示的内容。',
    role: ['占位：视觉探索与版式系统', '占位：动效与微交互实验', '占位：组件/图标/规范沉淀'],
    approach: ['占位：建立统一视觉语言', '占位：对关键组件做状态与动效定义', '占位：输出可复用资源包'],
    result: '占位：补充影响（例如：提升一致性、减少返工等）。',
  },
]

const EMAIL = 'quanzhenghe15@gmail.com'

export default function Landing() {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const [copyStatus, setCopyStatus] = useState('')
  const modalPanelRef = useRef(null)
  const lastFocusRef = useRef(null)

  const openModal = useCallback((projectId) => {
    const index = Math.max(0, PROJECTS.findIndex((p) => p.id === projectId))
    setActiveProjectIndex(index)
    lastFocusRef.current = document.activeElement
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    if (lastFocusRef.current && typeof lastFocusRef.current.focus === 'function') {
      lastFocusRef.current.focus()
    }
  }, [])

  const goPrev = useCallback(() => {
    setActiveProjectIndex((i) => (i - 1 + PROJECTS.length) % PROJECTS.length)
  }, [])

  const goNext = useCallback(() => {
    setActiveProjectIndex((i) => (i + 1) % PROJECTS.length)
  }, [])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopyStatus('已复制到剪贴板')
      setTimeout(() => setCopyStatus(''), 1200)
    } catch {
      setCopyStatus('复制失败（浏览器权限限制）')
    }
  }, [])

  // Body scroll lock when modal open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  // Focus modal panel when open
  useEffect(() => {
    if (modalOpen && modalPanelRef.current) {
      const panel = modalPanelRef.current
      const t = requestAnimationFrame(() => { panel.focus() })
      return () => cancelAnimationFrame(t)
    }
  }, [modalOpen])

  // Keyboard: Escape, arrows, focus trap
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!modalOpen) return
      if (e.key === 'Escape') {
        e.preventDefault()
        closeModal()
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
      if (e.key === 'Tab' && modalPanelRef.current) {
        const focusables = Array.from(
          modalPanelRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((x) => !x.hasAttribute('disabled'))
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [modalOpen, closeModal, goPrev, goNext])

  // Scroll reveal
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targets = document.querySelectorAll('[data-reveal]')
    if (reduce || !targets.length) {
      targets.forEach((el) => el.classList.add('is-in'))
      return
    }
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            observer.unobserve(entry.target)
          }
        })
      },
      { root: null, threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Stagger hero
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = document.querySelectorAll('[data-stagger], [data-blur-in]')
    if (reduce) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const timers = []
    els.forEach((el, i) => {
      const delay = Math.min(220 + i * 110, 880)
      timers.push(setTimeout(() => el.classList.add('is-in'), delay))
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  // Dashboard 3D on scroll
  useEffect(() => {
    const wrap = document.querySelector('[data-dash-wrap]')
    const dash = document.querySelector('[data-dash]')
    if (!wrap || !dash) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      dash.style.transform = 'rotateX(0deg) scale(1)'
      return
    }
    let raf = 0
    const tick = () => {
      raf = 0
      const r = wrap.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const start = vh * 0.85
      const end = vh * 0.15
      const t = (start - r.top) / (start - end)
      const p = Math.max(0, Math.min(1, t))
      const rot = 20 * (1 - p)
      const scale = 0.9 + 0.1 * p
      dash.style.transform = `rotateX(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Charts (count + bar) when in view
  useEffect(() => {
    const charts = document.querySelectorAll('[data-chart]')
    if (!charts.length) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function playChart(chart) {
      const values = chart.querySelectorAll('[data-count-to]')
      const bars = chart.querySelectorAll('[data-bar-to]')
      bars.forEach((b) => {
        const to = Number(b.dataset.barTo || 0)
        b.style.width = `${Math.max(0, Math.min(1, to)) * 100}%`
        b.style.transition = reduce ? 'none' : 'width 900ms cubic-bezier(.2,.8,.2,1)'
      })
      values.forEach((v) => {
        const to = Number(v.dataset.countTo || 0)
        if (reduce) {
          v.textContent = String(to)
          return
        }
        const start = performance.now()
        const from = Number(v.textContent || 0)
        const dur = 900
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur)
          const eased = 1 - (1 - t) ** 3
          v.textContent = String(Math.round(from + (to - from) * eased))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
    }

    if (!('IntersectionObserver' in window)) {
      charts.forEach(playChart)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playChart(entry.target)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    )
    charts.forEach((c) => observer.observe(c))
    return () => observer.disconnect()
  }, [])

  // Tilt cards
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const max = 7
    const perspective = 900
    const els = document.querySelectorAll('[data-tilt]')
    const cleanups = []
    els.forEach((el) => {
      el.style.transform = `perspective(${perspective}px) translateZ(0)`
      const onMove = (e) => {
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width
        const y = (e.clientY - r.top) / r.height
        const rx = (y - 0.5) * -2 * max
        const ry = (x - 0.5) * 2 * max
        el.style.transform = `perspective(${perspective}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`
      }
      const onLeave = () => {
        el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0)`
      }
      el.addEventListener('mousemove', onMove, { passive: true })
      el.addEventListener('mouseleave', onLeave, { passive: true })
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      })
    })
    return () => cleanups.forEach((f) => f())
  }, [])

  const project = PROJECTS[activeProjectIndex] || PROJECTS[0]

  return (
    <>
      <div className="bg-noise" aria-hidden="true"></div>
      <div className="bg-glow" aria-hidden="true"></div>
      <div className="bg-aurora" aria-hidden="true"></div>
      <div className="bg-grid" aria-hidden="true"></div>
      <div className="bg-stars" aria-hidden="true"></div>

      <header className="header">
        <div className="container header__inner">
          <a className="brand" href="#top" aria-label="回到顶部">
            <span className="brand__dot" aria-hidden="true"></span>
            <span className="brand__text">全正和</span>
          </a>

          <nav className="nav" aria-label="主导航">
            <a className="nav__link" href="#projects">项目</a>
            <a className="nav__link" href="#about">关于</a>
            <a className="nav__link" href="#contact">联系</a>
          </nav>

          <div className="header__actions">
            <a className="btn btn--ghost" href="#projects">查看项目</a>
            <a className="btn btn--primary" href="#contact">联系我</a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero hero--funnel" data-reveal>
          <div className="hero__bg" aria-hidden="true">
            <ColorBends
              className="hero-aurora"
              colors={['#ff5c7a', '#907FF0']}
              rotation={0}
              speed={0.2}
              scale={1}
              frequency={1}
              warpStrength={1}
              mouseInfluence={1}
              parallax={0.5}
              noise={0.1}
              transparent
              autoRotate={0}
            />
          </div>

          <div className="container hero__inner">
            <div className="hero__copy hero__copy--center">
              <div className="pill">
                <span className="pill__dot" aria-hidden="true"></span>
                <span>Web & App 体验设计</span>
                <span className="pill__sep" aria-hidden="true"></span>
                <span>全正和</span>
              </div>

              <h1 className="hero__title hero__title--xl" data-stagger>
              2026 Portfolio
              </h1>

              <p className="hero__subtitle hero__subtitle--xl" data-stagger data-blur-in>
              颜值之外，更有清晰、可用、可落地的真实体验设计

              </p>

              <div className="chips" aria-label="标签">
                <span className="chip">界面</span>
                <span className="chip">体验</span>
                <span className="chip">设计系统</span>
                <span className="chip">原型</span>
                <span className="chip">研究</span>
                <span className="chip">动效</span>
              </div>

              <div className="hero__cta hero__cta--center" data-stagger>
                <a className="btn btn--primary btn--brand" href="#dashboard">
                  开始了解
                </a>
              </div>
            </div>

            <div className="trusted" data-stagger>
              <div className="trusted__kicker">作品集内容</div>
              <div className="logo-wall" aria-label="品牌 Logo 墙">
                <div className="logo-wall__mask" aria-hidden="true"></div>
                <div className="logo-wall__track" data-marquee>
                  <div className="logo-wall__row">
                    <span className="logo">Vika.cn</span>
                    <span className="logo">维格云</span>
                    <span className="logo">Aitable.ai</span>
                    <span className="logo">Bika.ai</span>
                    <span className="logo">产品体验</span>
                    <span className="logo">用户故事</span>
                    <span className="logo">设计沉淀</span>
                    <span className="logo">知识分享</span>
                  </div>
                  <div className="logo-wall__row" aria-hidden="true">
                    <span className="logo">Vika.cn</span>
                    <span className="logo">维格云</span>
                    <span className="logo">Aitable.ai</span>
                    <span className="logo">Bika.ai</span>
                    <span className="logo">产品体验</span>
                    <span className="logo">用户故事</span>
                    <span className="logo">设计沉淀</span>
                    <span className="logo">知识分享</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--dashboard" id="dashboard" data-reveal>
          <div className="container">
            <div className="dash-wrap" data-dash-wrap>
              <div className="dash dash--metrics" data-dash>
                <div className="dash-metrics">
                  <div className="dash-metrics__left">
                    <div className="dash-metric-card dash-metric-card--big glass">
                      <div className="dash-metric-card__value">820+</div>
                      <div className="dash-metric-card__title">完成设计任务</div>
                      <div className="dash-metric-card__sub">Complete the design task</div>
                    </div>

                    <div className="dash-metrics__row">
                      <div className="dash-metric-card glass">
                        <div className="dash-metric-card__value">150+</div>
                        <div className="dash-metric-card__title">设计优化增量</div>
                        <div className="dash-metric-card__sub">Design Optimization Increment</div>
                      </div>
                      <div className="dash-metric-card glass">
                        <div className="dash-metric-card__value">90+</div>
                        <div className="dash-metric-card__title">设计分享 / 沉淀</div>
                        <div className="dash-metric-card__sub">Design Sharing / Accumulation</div>
                      </div>
                    </div>
                  </div>

                  <div className="dash-metric-card dash-metric-card--right glass">
                    <div className="dash-metric-card__value">92%</div>
                    <div className="dash-metric-card__title">设计评审通过率</div>
                    <div className="dash-metric-card__sub">Design Review Pass Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--about" id="about" data-reveal>
          <div className="container">
            <div className="about-intro">
              <h2 className="about-intro__title">个人简介</h2>
              
<div className="profile-name">
  {/* 新增头像标签 */}
  <img 
    src={avatar} 
    alt="全正和（Allen）头像" 
    className="profile-avatar"
  />
  全正和（Allen） 7 年产品设计师
</div>
            </div>

            <div className="about-exp glass card" data-tilt>
              <h3 className="about-exp__title">工作经历</h3>
              <div className="exp-item">
                <div className="exp-item__head">
                  <span className="exp-item__icon exp-item__icon--v">V</span>
                  <span className="exp-item__company">深圳维格云科技有限公司</span>
                  <span className="exp-item__dates">2020.6.1-2026.01</span>
                </div>
                <ul className="list list--compact exp-item__list">
                  <li>负责维格表 WEB 端 & APP 端，梳理用户使用场景、理解业务逻辑，并进行用户调研，完成研究结果到设计阶段的转化；</li>
                  <li>把控设计产出，跟进开发测试，还原设计成果，并收集上线数据及用户反馈，持续优化；</li>
                  <li>跟踪和分析业界的可用性设计趋势，并对产品结构、流程、功能界面用户体验、交互功能等进行研究并提出改善方案；</li>
                  <li>定期组织团队设计分享，沉淀设计过程和方法，提升团队影响力和专业度；</li>
                </ul>
              </div>
              <div className="exp-item">
                <div className="exp-item__head">
                  <span className="exp-item__icon exp-item__icon--arc">Arc</span>
                  <span className="exp-item__company">深圳澳城新科技有限公司</span>
                  <span className="exp-item__dates">2018.10-2020.05</span>
                </div>
                <ul className="list list--compact exp-item__list">
                  <li>负责「Agent」「Arc」等位于澳大利亚的 Web 端、移动端产品界面的 UI/UE 主视觉设计；</li>
                  <li>从用户体验的角度提出建议与解决方案，建立产品的界面设计规范；</li>
                  <li>独立胜任设计项目，分析前期需求、交互梳理、视觉输出及技术实现的跟进；</li>
                </ul>
              </div>
            </div>

            <div className="about-row">
              <div className="glass card about-values" data-tilt>
               
                <div className="values-group">
                  <h4 className="values-group__title">个人目标</h4>
                  <ul className="list list--compact">
                    <li>以用户可用性与可读性为核心</li>
                    <li>追求设计一致性、可维护性与可扩展性</li>
                    <li>用数据、用户反馈与真实场景驱动设计决策</li>
                    <li>持续关注行业趋势，推动产品体验迭代升级</li>
                  </ul>
                </div>
              </div>
              <div className="glass card about-tools" data-tilt>
                <h3 className="card__title">工具交付</h3>
                <div className="chips chips--wrap chips--with-icon">
                  <span className="chip chip--muted chip--check">Figma</span>
                  <span className="chip chip--muted chip--check">Notion</span>
                  <span className="chip chip--muted chip--check">飞书文档</span>
                  <span className="chip chip--muted chip--check">After Effects</span>
                  <span className="chip chip--muted chip--check">剪映</span>
                  <span className="chip chip--muted chip--check">Cursor</span>


                </div>
              </div>
            </div>

            
          </div>
        </section>

        <section className="section section--projects" id="projects" data-reveal>
          <div className="container">
            <h2 className="projects__heading">作品目录</h2>

            <div className="projects-showcase">
              <button
                className="project-card glass"
                type="button"
                onClick={() => openModal('vika')}
                data-tilt
                data-project
              >
                <div className="project-card__preview">
                  <span className="project-card__label">项目介绍</span>
                  <div className="project-card__placeholder" aria-hidden="true">
                    <div className="project-card__graphic"></div>
                  </div>
                  <div className="project-card__icons" aria-hidden="true">
                    <span className="project-card__icon"></span>
                    <span className="project-card__icon"></span>
                    <span className="project-card__icon"></span>
                  </div>
                </div>
                <div className="project-card__body">
                  <span className="project-card__num">01</span>
                  <div className="project-card__text">
                    <h3 className="project-card__title">Vika 维格表</h3>
                    <p className="project-card__desc">维格表不是电子表格，是新一代的数据生产力平台。</p>
                  </div>
                </div>
              </button>

              <button
                className="project-card glass"
                type="button"
                onClick={() => openModal('bika')}
                data-tilt
                data-project
              >
                <div className="project-card__preview">
                  <span className="project-card__label">项目介绍</span>
                  <div className="project-card__placeholder" aria-hidden="true">
                    <div className="project-card__graphic"></div>
                  </div>
                  <div className="project-card__icons" aria-hidden="true">
                    <span className="project-card__icon"></span>
                    <span className="project-card__icon"></span>
                    <span className="project-card__icon"></span>
                  </div>
                </div>
                <div className="project-card__body">
                  <span className="project-card__num">02</span>
                  <div className="project-card__text">
                    <h3 className="project-card__title">Bika.ai</h3>
                    <p className="project-card__desc">Your AI team. Your workflow. Your superpower.</p>
                  </div>
                </div>
              </button>

              <button
                className="project-card glass"
                type="button"
                onClick={() => openModal('other')}
                data-tilt
                data-project
              >
                <div className="project-card__preview">
                  <span className="project-card__label">项目介绍</span>
                  <div className="project-card__placeholder" aria-hidden="true">
                    <div className="project-card__graphic"></div>
                  </div>
                  <div className="project-card__icons" aria-hidden="true">
                    <span className="project-card__icon"></span>
                    <span className="project-card__icon"></span>
                    <span className="project-card__icon"></span>
                  </div>
                </div>
                <div className="project-card__body">
                  <span className="project-card__num">03</span>
                  <div className="project-card__text">
                    <h3 className="project-card__title">其他</h3>
                    <p className="project-card__desc">设计沉淀 / 乐于钻研 / 知识分享</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>

        <section className="section" id="contact" data-reveal>
          <div className="container">
            <div className="section__head">
              <h2 className="section__title">关于 / 联系</h2>
              <p className="section__desc">
                欢迎交流合作与机会。你可以通过微信或邮箱联系我。
              </p>
            </div>

            <div className="contact-grid">
              <div className="glass card">
                <h3 className="card__title">微信</h3>
                <div className="qr">
                  <div className="qr__placeholder" role="img" aria-label="微信二维码占位">
                    <div className="qr__grid" aria-hidden="true"></div>
                    <div className="qr__label">二维码占位</div>
                  </div>
                  <p className="muted">
                    后续把二维码图片替换到 <code>assets/wechat-qr.png</code> 并更新这里的
                    <code>img</code> 即可。
                  </p>
                </div>
              </div>

              <div className="glass card">
                <h3 className="card__title">邮箱</h3>
                <p className="contact-email">
                  <a className="link" href="mailto:quanzhenghe15@gmail.com">
                    quanzhenghe15@gmail.com
                  </a>
                </p>
                <div className="contact-actions">
                  <button className="btn btn--ghost" type="button" onClick={copyEmail}>
                    复制邮箱
                  </button>
                  <a className="btn btn--primary" href="mailto:quanzhenghe15@gmail.com">
                    发邮件
                  </a>
                </div>
                <p className="muted" id="copy-status" aria-live="polite">{copyStatus}</p>
              </div>
            </div>

            <footer className="footer">
              <span>
                © {new Date().getFullYear()} 全正和
              </span>
              <span className="footer__sep" aria-hidden="true"></span>
              <span className="muted">界面 / 体验 作品集</span>
            </footer>
          </div>
        </section>
      </main>

      <div
        className={`modal ${modalOpen ? 'is-open' : ''}`}
        aria-hidden={!modalOpen}
      >
        <div className="modal__backdrop" onClick={closeModal} aria-hidden="true" />
        <div
          ref={modalPanelRef}
          className="modal__panel glass"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={-1}
        >
          <div className="modal__header">
            <div>
              <div className="modal__kicker">项目</div>
              <h3 className="modal__title" id="modal-title">{project.title}</h3>
            </div>
            <button
              type="button"
              className="icon-btn"
              aria-label="关闭"
              onClick={closeModal}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="modal__body" id="modal-body">
            <div className="modal__cover" role="img" aria-label="封面占位">
              <div className="modal__cover-inner">
                <div className="modal__cover-badge">封面占位</div>
              </div>
            </div>

            <div className="modal__cols">
              <div className="modal__col">
                <h4 className="h4">背景 / 目标</h4>
                <p className="muted" data-field="context">{project.context}</p>
              </div>
              <div className="modal__col">
                <h4 className="h4">我的职责</h4>
                <ul className="list list--compact" data-field="role">
                  {project.role.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="modal__section">
              <h4 className="h4">方案与过程</h4>
              <ul className="list list--compact" data-field="approach">
                {project.approach.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="modal__section">
              <h4 className="h4">结果（可选）</h4>
              <p className="muted" data-field="result">{project.result}</p>
            </div>
          </div>

          <div className="modal__footer">
            <div className="modal__nav">
              <button type="button" className="btn btn--ghost" onClick={goPrev}>
                上一个
              </button>
              <button type="button" className="btn btn--ghost" onClick={goNext}>
                下一个
              </button>
            </div>
            <button type="button" className="btn btn--primary" onClick={closeModal}>
              完成
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

