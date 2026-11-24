import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'My Points | فروج الأمين - Al Amin Chicken',
  description: 'Check your loyalty points, rewards and order status.',
  robots: { index: false, follow: false },
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
