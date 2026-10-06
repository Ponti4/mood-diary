import { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

export const CalendarIcon = (props: IconProps) => <svg {...base} {...props}><path d="M6 2v4M18 2v4M3 9h18"/><rect x="3" y="4" width="18" height="17" rx="3"/></svg>
export const ChartIcon = (props: IconProps) => <svg {...base} {...props}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
export const SettingsIcon = (props: IconProps) => <svg {...base} {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1-1.55V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9a1.7 1.7 0 0 0 1.55 1H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z"/></svg>
export const DownloadIcon = (props: IconProps) => <svg {...base} {...props}><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 20h16"/></svg>
export const UploadIcon = (props: IconProps) => <svg {...base} {...props}><path d="M12 16V4m0 0 4 4m-4-4L8 8M4 20h16"/></svg>
export const ChevronLeftIcon = (props: IconProps) => <svg {...base} {...props}><path d="m15 18-6-6 6-6"/></svg>
export const ChevronRightIcon = (props: IconProps) => <svg {...base} {...props}><path d="m9 18 6-6-6-6"/></svg>
export const TrashIcon = (props: IconProps) => <svg {...base} {...props}><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6"/></svg>
export const CheckIcon = (props: IconProps) => <svg {...base} {...props}><path d="m5 12 4 4L19 6"/></svg>

