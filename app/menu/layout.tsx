import { Metadata } from 'next'
import { ReactNode } from 'react'

const siteUrl = 'https://chicken-al-ameen.vercel.app'
const ogImage = `${siteUrl}/og-image.png`

export const metadata: Metadata = {
  title: 'Menu | فروج الأمين - Al Amin Chicken',
  description:
    'Order fresh Chicken Shawarma, Crispy, Fajita, Grilled Chicken, Subs, and golden fries. Experience quality chicken 24/7 on Hadi Nasrallah Blvd.',

  alternates: {
    canonical: `${siteUrl}/menu`,
  },

  openGraph: {
    title: 'Menu | فروج الأمين - Al Amin Chicken',
    description:
      'Fresh Chicken Shawarma, Crispy, Fajita, Grilled Chicken, Subs, and more.',
    url: `${siteUrl}/menu`,
    siteName: 'فروج الأمين - Al Amin Chicken',
    type: 'website',
    locale: 'ar_LB',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'فروج الأمين - Al Amin Chicken',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Menu | فروج الأمين - Al Amin Chicken',
    description:
      'Fresh Chicken Shawarma, Crispy, Fajita, Grilled Chicken, Subs, and more.',
    images: [ogImage],
  },

  robots: {
    index: true,
    follow: true,
  },
}

interface MenuLayoutProps {
  children: ReactNode
}

export default function MenuLayout({ children }: MenuLayoutProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',

    name: 'فروج الأمين - Al Amin Chicken',
    url: siteUrl,
    image: ogImage,
    telephone: '+961 70 772 324',

    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Hadi Nasrallah Blvd, Next to Nimr El Wadi',
      addressLocality: 'Beirut',
      addressCountry: 'LB',
    },

    servesCuisine: 'Chicken',

    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    ],

    hasMenu: {
      '@type': 'Menu',
      name: 'Al Amin Chicken Menu',
      url: `${siteUrl}/menu`,

      hasMenuSection: [
        {
          '@type': 'MenuSection',
          name: 'Popular Items',

          hasMenuItem: [
            {
              '@type': 'MenuItem',
              name: 'Chicken Shawarma',
              description:
                'Premium spiced shredded chicken shawarma',
            },
            {
              '@type': 'MenuItem',
              name: 'Crispy Chicken',
              description:
                'Crispy golden fried chicken tenders or pieces',
            },
            {
              '@type': 'MenuItem',
              name: 'Fajita',
              description:
                'Sizzling spiced chicken fajita mix',
            },
            {
              '@type': 'MenuItem',
              name: 'Grilled Chicken',
              description:
                'Perfectly seasoned charcoal or rotisserie grilled chicken',
            },
            {
              '@type': 'MenuItem',
              name: 'Chicken Sub',
              description:
                'Toasted sub sandwich loaded with chicken and signature sauces',
            },
            {
              '@type': 'MenuItem',
              name: 'Fries',
              description:
                'Crispy golden classic French fries',
            },
          ],
        },
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <div>{children}</div>
    </>
  )
}
