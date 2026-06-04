import {
  format,
  parseISO,
  differenceInCalendarDays,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns'
import type { ISODate } from '../types'

/** Normalize any Date to a local 'yyyy-MM-dd' key. */
export function toISO(d: Date): ISODate {
  return format(d, 'yyyy-MM-dd')
}

export function fromISO(s: ISODate): Date {
  // parseISO on a date-only string yields local midnight — good for day math.
  return parseISO(s)
}

export function todayISO(): ISODate {
  return toISO(new Date())
}

/** Whole-day difference a − b (a later than b → positive). */
export function daysBetween(a: ISODate, b: ISODate): number {
  return differenceInCalendarDays(fromISO(a), fromISO(b))
}

export function addDaysISO(s: ISODate, n: number): ISODate {
  return toISO(addDays(fromISO(s), n))
}

export function isSameISO(a: ISODate, b: ISODate): boolean {
  return isSameDay(fromISO(a), fromISO(b))
}

/** Returns the 6-week grid (Sun→Sat) covering a month, for the calendar UI. */
export function monthGrid(anchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

export function prettyDate(s: ISODate): string {
  return format(fromISO(s), 'EEEE, MMM d')
}

export function shortDate(s: ISODate): string {
  return format(fromISO(s), 'MMM d')
}

export function weekdayShort(s: ISODate): string {
  return format(fromISO(s), 'EEE')
}
