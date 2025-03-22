import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Providers from "./providers/Providers";

const manrope = Manrope({
	variable: "--manrope",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "shiroe",
	description:
		"Personalized productivity web app where users can create, manage, and optimize their tasks using AI recommendations.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${manrope.variable} antialiased`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
