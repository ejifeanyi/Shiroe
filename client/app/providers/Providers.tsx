import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "next-themes";
// import Navbar from "@/components/navbar";
import ToastProvider from "./toast-provider";
import PageLayout from "@/components/page-layout";


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
									{/* <Navbar /> */}
									{children}
								</PageLayout>
							</ToastProvider>
						
			</AuthProvider>
		</ThemeProvider>
	);
}