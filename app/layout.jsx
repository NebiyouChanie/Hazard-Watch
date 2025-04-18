import './globals.css'
import { SidebarProvider,SidebarTrigger } from '@/components/ui/sidebar' // Adjust path as needed
import { AppSidebar } from '@/components/AppSidebar'
export const metadata = {
  title: 'Hazard Watch',
  description: 'Ethiopia Hazard Monitoring System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
      </body>
    </html>
  )
}