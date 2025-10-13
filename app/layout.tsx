export const metadata = {
  title: 'PAYU SWAP - Decentralized Exchange',
  description: 'Swap PAYU tokens on BSC network',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

