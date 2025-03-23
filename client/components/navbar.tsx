import React from "react";
import { Search, Bell, Calendar, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";

interface NavbarProps {
	userName?: string;
	userEmail?: string;
}

const Navbar: React.FC<NavbarProps> = ({
	userName = "John Doe",
	userEmail = "john.doe@example.com",
}) => {
	return (
		<header className="h-16 border-b bg-card flex items-center px-4 sticky top-0 z-30">
			<div className="w-full flex items-center justify-between">
				<div className="relative w-full max-w-md mr-4">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
					<Input
						type="search"
						placeholder="Search..."
						className="w-full pl-8 bg-background"
					/>
				</div>

				<div className="flex items-center space-x-2">
					<Button variant="ghost" size="icon" className="text-muted-foreground">
						<Calendar className="h-5 w-5" />
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="relative text-muted-foreground"
							>
								<Bell className="h-5 w-5" />
								<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-80">
							<DropdownMenuLabel>Notifications</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<div className="text-center py-4 text-muted-foreground text-sm">
								No new notifications
							</div>
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="gap-2 font-normal ml-2"
							>
								<Avatar className="h-8 w-8">
									<AvatarImage src="" alt={userName} />
									<AvatarFallback>
										{userName
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<span className="hidden md:inline">{userName}</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">{userName}</p>
									<p className="text-xs leading-none text-muted-foreground">
										{userEmail}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<User className="mr-2 h-4 w-4" />
								<span>Profile</span>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Settings className="mr-2 h-4 w-4" />
								<span>Settings</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-destructive focus:text-destructive">
								<LogOut className="mr-2 h-4 w-4" />
								<span>Logout</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<ThemeToggle />
				</div>
			</div>
		</header>
	);
};

export default Navbar;
