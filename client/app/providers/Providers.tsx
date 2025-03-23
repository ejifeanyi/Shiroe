import { AuthProvider } from "@/context/auth-context";
import ToastProvider from "./toast-provider";
import PageLayout from "@/components/page-layout";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<AuthProvider>
				<ToastProvider>
					<PageLayout>
						{children}
					</PageLayout>
				</ToastProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}
