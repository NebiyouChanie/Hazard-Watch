import './globals.css'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { HazardDataProvider } from '@/context/HazardDataContext'

export const metadata = {
  title: 'Hazard Watch',
  description: 'Ethiopia Hazard Monitoring System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <SidebarProvider>
          <HazardDataProvider>
            <AppSidebar />
            <main>
              <SidebarTrigger />
              {children}
            </main>
          </HazardDataProvider>
        </SidebarProvider>
      </body>
    </html>
  )
}