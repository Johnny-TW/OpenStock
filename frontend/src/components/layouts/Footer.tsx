export default function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-0 border-t px-4 h-16 flex items-center justify-center text-center text-sm text-muted-foreground bg-background">
      &copy; {new Date().getFullYear()} ee39-stocksmart-system. All rights reserved.
    </footer>
  )
}
