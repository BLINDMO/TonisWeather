import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from './store'
import { applyFontTheme } from './lib/fonts'
import { useAdaptationTracker } from './lib/useAdaptationTracker'
import Splash from './components/Splash'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import CalendarPage from './pages/CalendarPage'
import WorkshopPage from './pages/WorkshopPage'
import SettingsPage from './pages/SettingsPage'
import BottomNav, { type Tab } from './components/BottomNav'
import DaySheet from './components/DaySheet'
import GiraffeModal from './components/GiraffeModal'
import type { ISODate } from './types'

export default function App() {
  const onboarded = useStore((s) => s.onboarded)
  const name = useStore((s) => s.profile?.name ?? 'Toni')
  const fontTheme = useStore((s) => s.settings.fontTheme)

  useEffect(() => {
    applyFontTheme(fontTheme)
  }, [fontTheme])

  // Watches every model rebuild and records meaningful changes to the adaptation log
  useAdaptationTracker()

  const [tab, setTab] = useState<Tab>('home')
  const [openDate, setOpenDate] = useState<ISODate | null>(null)
  const [giraffeDate, setGiraffeDate] = useState<ISODate | null>(null)
  const [workshopPrompt, setWorkshopPrompt] = useState<string | null>(null)

  if (!onboarded)
    return (
      <>
        <Splash />
        <Onboarding />
      </>
    )

  const goWorkshop = (promptId?: string) => {
    setGiraffeDate(null)
    setWorkshopPrompt(promptId ?? null)
    setTab('workshop')
  }

  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-b from-mist via-white to-[#eef0ff]">
      <Splash />
      <AnimatePresence mode="wait">
        <motion.main
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="pt-1"
        >
          {tab === 'home' && <Home onOpenDay={setOpenDate} />}
          {tab === 'calendar' && <CalendarPage onOpenDay={setOpenDate} />}
          {tab === 'workshop' && (
            <WorkshopPage openPromptId={workshopPrompt} />
          )}
          {tab === 'me' && <SettingsPage />}
        </motion.main>
      </AnimatePresence>

      <BottomNav
        tab={tab}
        onChange={(t) => {
          if (t === 'workshop') setWorkshopPrompt(null)
          setTab(t)
        }}
      />

      <DaySheet date={openDate} onClose={() => setOpenDate(null)} onHardDay={setGiraffeDate} />

      <GiraffeModal
        open={!!giraffeDate}
        name={name}
        onClose={() => setGiraffeDate(null)}
        onOpenWorkshop={() => goWorkshop()}
      />
    </div>
  )
}
