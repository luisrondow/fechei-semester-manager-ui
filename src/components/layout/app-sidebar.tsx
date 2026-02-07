import { Link, useMatches } from "@tanstack/react-router";
import {
	BookOpen,
	GraduationCap,
	LayoutDashboard,
	PanelLeftClose,
	PanelLeftOpen,
	Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";

interface AppSidebarProps {
	collapsed: boolean;
	onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
	const { t } = useI18n();
	const matches = useMatches();

	const currentPath = matches[matches.length - 1]?.fullPath ?? "/";

	const navItems = [
		{
			to: "/dashboard" as const,
			label: t.nav.dashboard,
			icon: LayoutDashboard,
			match: (path: string) => path === "/dashboard",
		},
		{
			to: "/semesters" as const,
			label: t.nav.semesters,
			icon: GraduationCap,
			match: (path: string) =>
				path.startsWith("/semester") || path === "/semesters",
		},
	];

	return (
		<TooltipProvider delayDuration={0}>
			<aside
				className={`fixed top-0 left-0 h-full bg-sidebar text-sidebar-foreground z-40 flex flex-col transition-all duration-300 ease-in-out ${
					collapsed ? "w-16" : "w-64"
				}`}
			>
				{/* Logo */}
				<div className="flex items-center h-16 px-4 border-b border-sidebar-border">
					<Link to="/dashboard" className="flex items-center gap-3 min-w-0">
						<div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
							<BookOpen className="w-4 h-4 text-sidebar-primary-foreground" />
						</div>
						{!collapsed && (
							<div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-200">
								<span className="font-display text-lg leading-none tracking-tight">
									{t.common.appName}
								</span>
								<span className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/50 mt-0.5">
									{t.common.tagline}
								</span>
							</div>
						)}
					</Link>
				</div>

				{/* Navigation */}
				<nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
					{navItems.map((item) => {
						const isActive = item.match(currentPath);
						const Icon = item.icon;

						const link = (
							<Link
								to={item.to}
								className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
									isActive
										? "bg-sidebar-accent text-sidebar-primary"
										: "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
								} ${collapsed ? "justify-center" : ""}`}
							>
								<Icon className="w-5 h-5 shrink-0" />
								{!collapsed && (
									<span className="animate-in fade-in slide-in-from-left-2 duration-200">
										{item.label}
									</span>
								)}
							</Link>
						);

						if (collapsed) {
							return (
								<Tooltip key={item.to}>
									<TooltipTrigger asChild>{link}</TooltipTrigger>
									<TooltipContent side="right" sideOffset={8}>
										{item.label}
									</TooltipContent>
								</Tooltip>
							);
						}

						return <div key={item.to}>{link}</div>;
					})}
				</nav>

				{/* Footer */}
				<div className="px-2 py-3 border-t border-sidebar-border space-y-1">
					{(() => {
						const settingsLink = (
							<Link
								to="/settings"
								className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 ${
									collapsed ? "justify-center" : ""
								}`}
							>
								<Settings className="w-5 h-5 shrink-0" />
								{!collapsed && (
									<span className="animate-in fade-in slide-in-from-left-2 duration-200">
										{t.nav.settings}
									</span>
								)}
							</Link>
						);

						if (collapsed) {
							return (
								<Tooltip>
									<TooltipTrigger asChild>{settingsLink}</TooltipTrigger>
									<TooltipContent side="right" sideOffset={8}>
										{t.nav.settings}
									</TooltipContent>
								</Tooltip>
							);
						}

						return settingsLink;
					})()}

					<Separator className="bg-sidebar-border" />

					<Button
						variant="ghost"
						size="sm"
						onClick={onToggle}
						className={`w-full text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 ${
							collapsed ? "justify-center px-0" : "justify-start"
						}`}
					>
						{collapsed ? (
							<PanelLeftOpen className="w-4 h-4" />
						) : (
							<>
								<PanelLeftClose className="w-4 h-4 mr-2" />
								<span className="text-xs animate-in fade-in slide-in-from-left-2 duration-200">
									Collapse
								</span>
							</>
						)}
					</Button>
				</div>
			</aside>
		</TooltipProvider>
	);
}
