import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
    title: "Map Editor - The Land Business Tulum",
    description: "Editor profesional de mapas KML/KMZ para The Land Business Tulum",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
        <body className="font-raleway">{children}</body>
        </html>
    )
}
