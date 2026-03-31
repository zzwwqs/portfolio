import { useState, useEffect, useRef, useCallback } from 'react'
import ColorBends from './ColorBends'
import './landing.css'
// 导入头像资源（放在组件顶部）
import avatar from './assets/avatar.png';
import vikaCover1 from './assets/vika_1.png';
import bikaCover1 from './assets/bika_1.png';
import otherCover1 from './assets/other_1.png';
import companyLogo from './assets/logo.png';
import wechatQr from './assets/wechat-qr.png';
import figmaLogo from './assets/figma.png';
import photoshopLogo from './assets/photoshop.png';
import afterEffectsLogo from './assets/aftereffects.png';
import principleLogo from './assets/principle.png';
import notionLogo from './assets/notion.png';
import feishuLogo from './assets/feishu.png';
import jianyingLogo from './assets/jianying.png';
import cursorLogo from './assets/cursor.png';
import lovartLogo from './assets/lovart.png';

const projectImageModules = import.meta.glob('./assets/project*-img*.png', {
  eager: true,
  import: 'default',
})
const vikaImageModules = import.meta.glob('./assets/vika_*.png', {
  eager: true,
  import: 'default',
})
const vikaVideoModules = import.meta.glob('./assets/vika_*.mp4', {
  eager: true,
  import: 'default',
})
const bikaImageModules = import.meta.glob('./assets/bika_*.png', {
  eager: true,
  import: 'default',
})
const bikaVideoModules = import.meta.glob('./assets/bika_*.mp4', {
  eager: true,
  import: 'default',
})
const otherImageModules = import.meta.glob('./assets/other_*.png', {
  eager: true,
  import: 'default',
})
const otherVideoModules = import.meta.glob('./assets/other_*.mp4', {
  eager: true,
  import: 'default',
})

const PROJECTS = [
  {
    id: 'vika',
    title: 'Vika 维格表',
    context: '占位：这是一个效率工具体验升级项目。补充目标用户、关键约束与成功指标。',
    role: ['占位：负责信息架构与关键流程设计', '占位：搭建组件规范与交付规则', '占位：与研发协作完成落地与验收'],
    approach: ['占位：对关键任务流做梳理与分层', '占位：方案对比并明确取舍', '占位：沉淀可复用的设计系统片段'],
    result: '占位：补充数据或可验证结果（例如：完成率/时长/满意度/上线范围）。',
  },
  {
    id: 'bika',
    title: 'Bika.ai',
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
  const [renderGallery, setRenderGallery] = useState(false)
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const [copyStatus, setCopyStatus] = useState('')
  const [loadedMedia, setLoadedMedia] = useState({})
  const modalPanelRef = useRef(null)
  const modalBodyRef = useRef(null)
  const lastFocusRef = useRef(null)

  const openModal = useCallback((projectId) => {
    const index = Math.max(0, PROJECTS.findIndex((p) => p.id === projectId))
    setActiveProjectIndex(index)
    lastFocusRef.current = document.activeElement
    setModalOpen(true)
    setRenderGallery(false)
    setLoadedMedia({})
    // 让“底部缓慢上滑”先跑起来，随后再渲染图片，减少卡顿/解码抖动
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setRenderGallery(true))
    })
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setRenderGallery(false)
    setLoadedMedia({})
    if (lastFocusRef.current && typeof lastFocusRef.current.focus === 'function') {
      lastFocusRef.current.focus()
    }
  }, [])

  const goPrev = useCallback(() => {
    setActiveProjectIndex((i) => (i > 0 ? i - 1 : i))
  }, [])

  const goNext = useCallback(() => {
    setActiveProjectIndex((i) => (i < PROJECTS.length - 1 ? i + 1 : i))
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

  // 切换项目时回到内容区顶部，避免仍停留在上一项目的滚动位置
  useEffect(() => {
    if (!modalOpen || !modalBodyRef.current) return
    const el = modalBodyRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }, [activeProjectIndex, modalOpen])

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

  const canPrev = activeProjectIndex > 0
  const canNext = activeProjectIndex < PROJECTS.length - 1

  const projectNum = project.id === 'vika' ? 1 : project.id === 'bika' ? 2 : 3
  const getLegacyGallerySrc = (imgIndex) => {
    const key = `./assets/project${projectNum}-img${imgIndex}.png`
    return projectImageModules[key] || vikaCover1
  }
  const getProjectGalleryItems = () => {
    if (project.id === 'vika') {
      return [...Object.entries(vikaImageModules), ...Object.entries(vikaVideoModules)]
        .map(([path, src]) => {
          const match = path.match(/vika_(\d+)\.(png|mp4)$/)
          if (!match) return null
          const index = Number(match[1])
          const ext = match[2]
          return {
            key: `vika-${index}`,
            index,
            src,
            type: ext === 'mp4' ? 'video' : 'image',
          }
        })
        .filter(Boolean)
        .sort((a, b) => a.index - b.index)
    }
    if (project.id === 'bika') {
      return [...Object.entries(bikaImageModules), ...Object.entries(bikaVideoModules)]
        .map(([path, src]) => {
          const match = path.match(/bika_(\d+)\.(png|mp4)$/)
          if (!match) return null
          const index = Number(match[1])
          const ext = match[2]
          return {
            key: `bika-${index}`,
            index,
            src,
            type: ext === 'mp4' ? 'video' : 'image',
          }
        })
        .filter(Boolean)
        .sort((a, b) => a.index - b.index)
    }
    if (project.id === 'other') {
      return [...Object.entries(otherImageModules), ...Object.entries(otherVideoModules)]
        .map(([path, src]) => {
          const match = path.match(/other_(\d+)\.(png|mp4)$/)
          if (!match) return null
          const index = Number(match[1])
          const ext = match[2]
          return {
            key: `other-${index}`,
            index,
            src,
            type: ext === 'mp4' ? 'video' : 'image',
          }
        })
        .filter(Boolean)
        .sort((a, b) => a.index - b.index)
    }

    return Array.from({ length: 12 }, (_, i) => {
      const index = i + 1
      return {
        key: `${project.id}-${index}`,
        index,
        src: getLegacyGallerySrc(index),
        type: 'image',
      }
    })
  }
  const galleryItems = getProjectGalleryItems()

  return (
    <>
      <div className={`bg-noise ${modalOpen ? 'modal-backdrop-blur-fallback' : ''}`} aria-hidden="true"></div>
      <div className={`bg-glow ${modalOpen ? 'modal-backdrop-blur-fallback' : ''}`} aria-hidden="true"></div>
      <div className={`bg-aurora ${modalOpen ? 'modal-backdrop-blur-fallback' : ''}`} aria-hidden="true"></div>
      <div className={`bg-grid ${modalOpen ? 'modal-backdrop-blur-fallback' : ''}`} aria-hidden="true"></div>
      <div className={`bg-stars ${modalOpen ? 'modal-backdrop-blur-fallback' : ''}`} aria-hidden="true"></div>

      <header className={`header ${modalOpen ? 'modal-backdrop-blur-fallback' : ''}`}>
        <div className="container header__inner">
          <a className="brand" href="#top" aria-label="回到顶部">
            <span className="brand__dot" aria-hidden="true"></span>
            <span className="brand__text">2026 作品集</span>
          </a>

          <nav className="nav" aria-label="主导航">
          <a className="nav__link" href="#top">首页</a>
          <a className="nav__link" href="#about">个人简介</a>
            <a className="nav__link" href="#projects">作品目录</a>
          </nav>

          <div className="header__actions">
            <a className="btn btn--primary" href="#contact">联系我</a>
          </div>
        </div>
      </header>

      <main id="top" className={modalOpen ? 'modal-backdrop-blur-fallback' : ''}>
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
                <span>UI & UX 设计</span>
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
                <a className="btn btn--primary btn--brand btn--hero-pulse" href="#dashboard">
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
                    <span className="logo">Aitable.ai</span>
                    <span className="logo">Bika.ai</span>
                    <span className="logo">User Experience</span>
                    <span className="logo">Daily Sharing</span>
                    <span className="logo">Design Accumulation</span>
                    <span className="logo">User Story</span>
                  </div>
                  <div className="logo-wall__row" aria-hidden="true">
                    <span className="logo">Vika.cn</span>
                    <span className="logo">Aitable.ai</span>
                    <span className="logo">Bika.ai</span>
                    <span className="logo">User Experience</span>
                    <span className="logo">Daily Sharing</span>
                    <span className="logo">Design Accumulation</span>
                    <span className="logo">User Story</span>
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
                      <div className="dash-metric-card__title">2020-2026 累计交付设计项目</div>
                      <div className="dash-metric-card__sub">Complete the design task</div>
                    </div>

                    <div className="dash-metrics__row">
                      <div className="dash-metric-card glass">
                        <div className="dash-metric-card__value">150+</div>
                        <div className="dash-metric-card__title">产品体验优化累计</div>
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
  全正和（Allen）・ 7 年产品设计师 ・ 29岁
</div>
            </div>

            <div className="about-exp glass card" data-tilt>
              <h3 className="about-exp__title">工作经历</h3>
              <div className="exp-item">
                <div className="exp-item__head">
                  <img
                    src={companyLogo}
                    alt="维格云 logo"
                    className="exp-item__icon exp-item__icon--v-logo"
                  />
                  <span className="exp-item__company">深圳维格云科技有限公司</span>
                  <span className="exp-item__dates">2020.6.1-2026.01</span>
                </div>
                <ul className="list list--compact exp-item__list">
                  <li>负责维格表、Bika.ai两大产品的WEB端与APP端全链路UI/UX设计，深度梳理核心用户使用场景，精准拆解复杂业务逻辑，开展针对性用户调研与需求分析，高效完成用户研究成果到原型、视觉、交互方案的落地转化，搭建贴合用户习惯的产品体验体系。</li>
                  <li>严格把控从需求拆解、原型绘制、高保真视觉输出到交互规范制定的全流程设计产出，全程跟进前端开发与测试环节，精准推动设计稿1:1还原，同步收集上线后用户反馈与核心体验数据，基于数据驱动完成产品体验的持续迭代与优化</li>
                  <li>实时跟踪国内外前沿UI/UX设计趋势与行业优秀案例，深度分析产品现有结构、用户流程、功能界面及交互逻辑的痛点，针对性输出系统化体验改善方案，助力产品提升核心竞争力与用户留存率</li>
                  <li>定期牵头组织团队内部设计分享会，梳理沉淀标准化设计流程、设计方法与组件规范，搭建可复用设计资产库，主动赋能团队成员，全面提升团队整体设计专业度与行业影响力</li>
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
                  <span className="chip chip--muted chip--tool">
                    <img className="chip__icon" src={figmaLogo} alt="" aria-hidden="true" />
                    Figma
                  </span>
                  <span className="chip chip--muted chip--tool">
                    <img className="chip__icon" src={photoshopLogo} alt="" aria-hidden="true" />
                    Photoshop
                  </span>
                  <span className="chip chip--muted chip--tool">
                    <img className="chip__icon" src={afterEffectsLogo} alt="" aria-hidden="true" />
                    After Effects
                  </span>
                  <span className="chip chip--muted chip--tool">
                    <img className="chip__icon" src={principleLogo} alt="" aria-hidden="true" />
                    Principle
                  </span>
                  <span className="chip chip--muted chip--tool">
                    <img className="chip__icon" src={notionLogo} alt="" aria-hidden="true" />
                    Notion
                  </span>
                  <span className="chip chip--muted chip--tool">
                    <img className="chip__icon" src={feishuLogo} alt="" aria-hidden="true" />
                    飞书文档
                  </span>
                  <span className="chip chip--muted chip--tool">
                    <img className="chip__icon" src={jianyingLogo} alt="" aria-hidden="true" />
                    剪映
                  </span>
                  <span className="chip chip--muted chip--tool">
                    <img className="chip__icon" src={cursorLogo} alt="" aria-hidden="true" />
                    Cursor
                  </span>
                  <span className="chip chip--muted chip--tool">
                    <img className="chip__icon" src={lovartLogo} alt="" aria-hidden="true" />
                    Lovart
                  </span>
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
                {/* 只保留封面图，删除其他所有元素 */}
                  <img 
                    src={vikaCover1}
                    alt="项目封面" 
                    className="project-card__cover" // 必须和 CSS 中的类名一致
                  />
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
                  {/* 只保留封面图，删除其他所有元素 */}
                  <img 
                    src={bikaCover1} 
                    alt="项目封面" 
                    className="project-card__cover" // 必须和 CSS 中的类名一致
                  />
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
                <div className="project-card__preview">{/* 只保留封面图，删除其他所有元素 */}
                  <img 
                    src={otherCover1}
                    alt="项目封面" 
                    className="project-card__cover" // 必须和 CSS 中的类名一致
                  />
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
              <h2 className="section__title">联系我
              </h2>
              <p className="section__desc">
                欢迎交流合作与机会。你可以通过微信或邮箱联系我
              </p>
            </div>

            <div className="contact-grid">
              <div className="glass card contact-card contact-card--wechat">
                <h3 className="card__title">微信</h3>
                <div className="qr">
                  <img className="qr__img" src={wechatQr} alt="微信二维码" />
                </div>
              </div>

              <div className="glass card contact-card contact-card--email">
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
                    发送邮件
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
              <span className="muted">UI / UX 作品集</span>
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
          aria-labelledby="modal-project-title"
          tabIndex={-1}
        >
          <div className="modal__header">
            <h2 className="modal__header-title" id="modal-project-title">
              {project.title}
            </h2>
            <button
              className="modal__close-btn"
              type="button"
              aria-label="关闭弹窗"
              onClick={closeModal}
            >
              ×
            </button>
          </div>

          <div ref={modalBodyRef} className="modal__body" id="modal-body">
            <div className="modal__gallery" aria-label="项目作品图片">
              {renderGallery &&
                galleryItems.map((item, idx) => {
                  const isLoaded = Boolean(loadedMedia[item.key])
                  const itemClass = `modal__media ${isLoaded ? 'is-loaded' : ''}`
                  const itemStyle = { '--media-delay': `${Math.min(idx * 70, 560)}ms` }

                  if (item.type === 'video') {
                    return (
                      <div key={item.key} className={itemClass} style={itemStyle}>
                        <video
                          src={item.src}
                          className="modal__img"
                          controls
                          preload="metadata"
                          playsInline
                          onLoadedData={() =>
                            setLoadedMedia((prev) => ({ ...prev, [item.key]: true }))
                          }
                        />
                      </div>
                    )
                  }

                  return (
                    <div key={item.key} className={itemClass} style={itemStyle}>
                      <img
                        src={item.src}
                        alt={`项目图 ${item.index}`}
                        className="modal__img"
                        loading="eager"
                        onLoad={() => setLoadedMedia((prev) => ({ ...prev, [item.key]: true }))}
                        onError={() => setLoadedMedia((prev) => ({ ...prev, [item.key]: true }))}
                        ref={(el) => {
                          if (!el) return
                          if (loadedMedia[item.key]) return
                          if (el.complete && el.naturalWidth > 0) {
                            setLoadedMedia((prev) => ({ ...prev, [item.key]: true }))
                          }
                        }}
                      />
                    </div>
                  )
                })}
            </div>

            <div className="modal__bottom" aria-label="项目切换按钮">
              <button
                type="button"
                className="btn modal__nav-btn"
                onClick={goPrev}
                disabled={!canPrev}
              >
                上一个项目
              </button>
              <button
                type="button"
                className="btn modal__nav-btn"
                onClick={goNext}
                disabled={!canNext}
              >
                下一个项目
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

