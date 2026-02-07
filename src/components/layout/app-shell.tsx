import { Outlet } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/lib/i18n";
import { AppSidebar } from "./app-sidebar";

export function AppShell() {
	const [collapsed, setCollapsed] = useState(false);
	const { t } = useI18n();

	return (
		<div className="grain-overlay min-h-screen">
			{/* Desktop sidebar */}
			<div className="hidden md:block">
				<AppSidebar
					collapsed={collapsed}
					onToggle={() => setCollapsed(!collapsed)}
				/>
			</div>

			{/* Mobile header with sheet */}
			<div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-md border-b border-border z-30 flex items-center px-4">
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="mr-3">
							<Menu className="w-5 h-5" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-64 p-0 bg-sidebar">
						<AppSidebar collapsed={false} onToggle={() => {}} />
					</SheetContent>
				</Sheet>
				<span className="font-display text-lg">{t.common.appName}</span>
			</div>

			{/* Main content */}
			<main
				className={`transition-all duration-300 ease-in-out pt-14 md:pt-0 ${
					collapsed ? "md:pl-16" : "md:pl-64"
				}`}
			>
				<div className="min-h-screen">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
