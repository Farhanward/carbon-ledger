import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, KeyRound, Plus, RefreshCw, ShieldCheck, Utensils } from 'lucide-react'
import type { Bootstrap, LedgerDashboard } from './lib/api'
import { api } from './lib/api'
import './App.css'

type Locale = 'ar' | 'en'

const copy = {
  ar: {
    dir: 'rtl',
    language: 'English',
    title: 'CarbonLedger',
    subtitle: 'دفتر المطعم لنظام Windows: مبيعات، مصاريف، إقفال يومي، وتقارير مقفلة بترخيص.',
    license: 'الترخيص',
    placeholder: 'مفتاح التطوير: CF-DEMO-ALL',
    active: 'مفعل',
    inactive: 'غير مفعل',
    fingerprint: 'بصمة الجهاز',
    sale: 'إضافة بيع',
    expense: 'إضافة مصروف',
    close: 'إقفال اليوم',
    amount: 'المبلغ',
    category: 'التصنيف',
    note: 'ملاحظة',
    todaySales: 'دخل اليوم',
    todayExpenses: 'مصروف اليوم',
    net: 'الصافي',
    reports: 'تقارير الإقفال المقفلة',
    timeline: 'آخر العمليات',
    loading: 'تحميل CarbonLedger...',
  },
  en: {
    dir: 'ltr',
    language: 'العربية',
    title: 'CarbonLedger',
    subtitle: 'Windows restaurant ledger: sales, expenses, daily closing, and license-locked reports.',
    license: 'License',
    placeholder: 'Development key: CF-DEMO-ALL',
    active: 'Active',
    inactive: 'Inactive',
    fingerprint: 'Device fingerprint',
    sale: 'Add sale',
    expense: 'Add expense',
    close: 'Close day',
    amount: 'Amount',
    category: 'Category',
    note: 'Note',
    todaySales: 'Today sales',
    todayExpenses: 'Today expenses',
    net: 'Net',
    reports: 'Locked closing reports',
    timeline: 'Recent activity',
    loading: 'Loading CarbonLedger...',
  },
} as const

function App() {
  const [locale, setLocale] = useState<Locale>('ar')
  const [data, setData] = useState<Bootstrap | null>(null)
  const [licenseKey, setLicenseKey] = useState('')
  const [form, setForm] = useState({ amount: '', category: '', note: '' })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const t = copy[locale]
  const money = useMemo(() => new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US'), [locale])

  useEffect(() => {
    api.bootstrap().then(setData).catch((error) => setMessage(String(error)))
  }, [])

  async function run(work: () => Promise<LedgerDashboard>) {
    setBusy(true)
    setMessage('')
    try {
      const ledger = await work()
      setData((current) => current ? { ...current, ledger } : current)
      setForm({ amount: '', category: '', note: '' })
    } catch (error) {
      setMessage(String(error))
    } finally {
      setBusy(false)
    }
  }

  async function activate() {
    setBusy(true)
    try {
      const license = await api.activateLicense(licenseKey, 'ledger')
      setData((current) => current ? { ...current, license } : current)
      setLicenseKey('')
    } catch (error) {
      setMessage(String(error))
    } finally {
      setBusy(false)
    }
  }

  if (!data) {
    return <main className="app-shell single" dir={t.dir} lang={locale}><div className="empty-state">{t.loading}</div></main>
  }

  return (
    <main className="app-shell single" dir={t.dir} lang={locale}>
      <section className="workspace">
        <header className="module-header">
          <div className="module-icon"><Utensils /></div>
          <div>
            <h2>{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>
          <button onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}>{t.language}</button>
        </header>

        {message && <div className="notice">{message}</div>}

        <article className="license-panel top-license">
          <div className={data.license.active ? 'status status--ok' : 'status'}>
            <ShieldCheck size={18} />
            {data.license.active ? t.active : t.inactive}
          </div>
          <label>{t.fingerprint}<input readOnly value={data.device_fingerprint} /></label>
          <div className="license-row">
            <input value={licenseKey} onChange={(event) => setLicenseKey(event.target.value)} placeholder={t.placeholder} />
            <button onClick={activate} disabled={busy || !licenseKey}><KeyRound size={18} /></button>
          </div>
        </article>

        <div className="metric-grid">
          <Metric label={t.todaySales} value={`${money.format(data.ledger.today_sales)} SAR`} />
          <Metric label={t.todayExpenses} value={`${money.format(data.ledger.today_expenses)} SAR`} />
          <Metric label={t.net} value={`${money.format(data.ledger.today_net)} SAR`} />
        </div>

        <div className="split-grid">
          <Panel title={t.sale}>
            <div className="form-grid">
              <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder={t.amount} />
              <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder={t.category} />
              <input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder={t.note} />
              <button onClick={() => run(() => api.addSale(Number(form.amount), form.category, form.note))} disabled={busy}><Plus size={18} />{t.sale}</button>
              <button className="danger" onClick={() => run(() => api.addExpense(Number(form.amount), form.category, form.note))} disabled={busy}><Plus size={18} />{t.expense}</button>
              <button className="dark" onClick={() => run(api.closeDay)} disabled={busy}><CalendarClock size={18} />{t.close}</button>
            </div>
          </Panel>
          <Panel title={t.reports}>
            <DataList rows={data.ledger.closings.map((row) => [row.date, `${money.format(row.total_sales)} / ${money.format(row.total_expenses)}`, `${money.format(row.net)} SAR`])} />
          </Panel>
        </div>

        <Panel title={t.timeline}>
          <DataList rows={data.ledger.rows.map((row) => [row.kind, `${money.format(row.amount)} SAR`, row.category, row.note])} />
        </Panel>

        <button className="floating-sync" onClick={() => api.bootstrap().then(setData)}><RefreshCw size={18} /></button>
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong></article>
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <article className="panel"><h3>{title}</h3>{children}</article>
}

function DataList({ rows }: { rows: Array<Array<React.ReactNode>> }) {
  if (!rows.length) return <div className="empty-state">No records yet</div>
  return <div className="data-list">{rows.map((row, index) => <div className="data-row" key={index}>{row.map((cell, cellIndex) => <span key={cellIndex}>{cell}</span>)}</div>)}</div>
}

export default App
