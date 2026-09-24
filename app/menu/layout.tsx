import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Menu | فروج الأمين - Al Amin Chicken',
  description: 'Order fresh Chicken Shawarma, Crispy, Fajita, Grilled Chicken, Subs, and golden fries. Experience the best quality chicken open 24/7 on Hadi Nasrallah Blvd.',
  openGraph: {
    title: 'Menu | فروج الأمين',
    description: 'Fresh Chicken Shawarma, Crispy, Fajita, Grilled Chicken, Subs, and more.',
    url: 'https://vercel.app',
  },
}

interface MenuLayoutProps {
  children: ReactNode
}

export default function MenuLayout({ children }: MenuLayoutProps) {
  // JSON-LD Menu Schema to boost Google Local Search rankings for specific food items
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    'name': 'فروج الأمين - Al Amin Chicken',
    'image': 'https://vercel.app', // Update with your actual logo asset
    'telePhone': '+961 70 772 324',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Hadi Nasrallah Blvd, Next to Nimr El Wadi',
      'addressLocality': 'Beirut',
      'addressCountry': 'LB'
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ],
      'opens': '00:00',
      'closes': '23:59'
    },
    'hasMenu': {
      '@type': 'Menu',
      'name': 'Al Amin Chicken Menu',
      'hasMenuSection': [
        {
          '@type': 'MenuSection',
          'name': 'Popular Items',
          'hasMenuItem': [
            { '@type': 'MenuItem', 'name': 'Chicken Shawarma', 'description': 'Premium spiced shredded chicken shawarma' },
            { '@type': 'MenuItem', 'name': 'Crispy Chicken', 'description': 'Crispy golden fried chicken tenders or pieces' },
            { '@type': 'MenuItem', 'name': 'Fajita', 'description': 'Sizzling spiced chicken fajita mix' },
            { '@type': 'MenuItem', 'name': 'Grilled Chicken', 'description': 'Perfectly seasoned charcoal or rotisserie grilled chicken' },
            { '@type': 'MenuItem', 'name': 'Chicken Sub', 'description': 'Toasted sub sandwich loaded with chicken and signature sauces' },
            { '@type': 'MenuItem', 'name': 'Fries', 'description': 'Crispy golden classic French fries' }
          ]
        }
      ]
    }
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div>
        {children}
      </div>
    </>
  )
}
