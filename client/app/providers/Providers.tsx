import { AuthProvider } from "@/context/auth-context";
import ToastProvider from "./toast-provider";
import { ThemeProvider } from "./theme-provider";
import { NotificationProvider } from "@/context/notification-context";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<AuthProvider>
				<NotificationProvider>
					<ToastProvider>{children}</ToastProvider>
				</NotificationProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}
