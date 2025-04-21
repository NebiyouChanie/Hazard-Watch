import './globals.css'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { HazardDataProvider } from '@/context/HazardDataContext'
import { TimeSeriesDataProvider } from '@/context/TimeSeriesDataContext';

export const metadata = {
  title: 'Hazard Watch',
  description: 'Ethiopia Hazard Monitoring System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
          <HazardDataProvider>
          <TimeSeriesDataProvider>
            <main>
            <SidebarProvider>
                <AppSidebar />
                  <SidebarTrigger />
                  {children}
            </SidebarProvider>
            </main>
            </TimeSeriesDataProvider>
          </HazardDataProvider>
      </body>
    </html>
  )
}