"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export type MegaMenuItem = {
  id: number;
  label: string;
  subMenus?: {
    title: string;
    items: {
      label: string;
      description: string;
      icon: React.ElementType;
      href?: string;
    }[];
  }[];
  link?: string;
  onClick?: () => void;
};

export interface MegaMenuProps extends React.HTMLAttributes<HTMLUListElement> {
  items: MegaMenuItem[];
  className?: string;
  locked?: boolean;
}

const MegaMenu = React.forwardRef<HTMLUListElement, MegaMenuProps>(
  ({ items, className, locked, ...props }, ref) => {
    const [openMenu, setOpenMenu] = React.useState<string | null>(null);
    const [isHover, setIsHover] = React.useState<number | null>(null);
    const [lockedTooltip, setLockedTooltip] = React.useState<number | null>(null);

    const handleHover = (menuLabel: string | null) => {
      if (!locked) setOpenMenu(menuLabel);
    };

    return (
      <ul
        ref={ref}
        className={`relative flex items-center space-x-0 ${className || ""}`}
        {...props}
      >
        {items.map((navItem) => (
          <li
            key={navItem.label}
            className="relative"
            onMouseEnter={() => {
              handleHover(navItem.label);
              if (locked) setLockedTooltip(navItem.id);
            }}
            onMouseLeave={() => {
              handleHover(null);
              if (locked) setLockedTooltip(null);
            }}
          >
            <button
              className="relative flex cursor-pointer items-center justify-center gap-1 py-1.5 px-4 text-sm text-white/50 transition-colors duration-300 hover:text-white group"
              onMouseEnter={() => setIsHover(navItem.id)}
              onMouseLeave={() => setIsHover(null)}
              onClick={(e) => {
                if (locked) {
                  e.preventDefault();
                  setLockedTooltip(navItem.id);
                  return;
                }
                if (navItem.link) {
                  navItem.onClick?.();
                }
              }}
            >
              <span>{navItem.label}</span>
              {navItem.subMenus && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 group-hover:rotate-180 ${
                    openMenu === navItem.label ? "rotate-180" : ""
                  }`}
                />
              )}
              {(isHover === navItem.id || openMenu === navItem.label) && (
                <motion.div
                  layoutId="hover-bg"
                  className="absolute inset-0 size-full bg-white/10"
                  style={{
                    borderRadius: 99,
                  }}
                />
              )}
            </button>

            {/* Locked tooltip — shown on hover/click when locked */}
            <AnimatePresence>
              {locked && lockedTooltip === navItem.id && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-20">
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap border border-gold-400/20 bg-dark-800/95 backdrop-blur-xl rounded-xl px-5 py-3 shadow-xl"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gold-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      <a href="/signup" className="text-xs text-gold-400 hover:text-gold-300 transition font-medium">
                        Create an account
                      </a>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {openMenu === navItem.label && navItem.subMenus && !locked && (
                <div className="absolute left-0 top-full w-auto pt-2 z-10">
                  <motion.div
                    className="w-max border border-white/10 bg-[#0A0A0A] p-4"
                    style={{
                      borderRadius: 16,
                    }}
                    layoutId="menu"
                  >
                    <div className="flex w-fit shrink-0 space-x-9 overflow-hidden">
                      {navItem.subMenus.map((sub) => (
                        <motion.div layout className="w-full" key={sub.title}>
                          <h3 className="mb-4 text-sm font-medium capitalize text-white/50">
                            {sub.title}
                          </h3>
                          <ul className="space-y-6">
                            {sub.items.map((item) => {
                              const Icon = item.icon;
                              return (
                                <li key={item.label}>
                                  <Link
                                    href={item.href || "#"}
                                    className="flex items-start space-x-3 group"
                                  >
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/30 text-white transition-colors duration-300 group-hover:bg-white group-hover:text-[#0A0A0A]">
                                      <Icon className="h-5 w-5 flex-none" />
                                    </div>
                                    <div className="w-max leading-5">
                                      <p className="shrink-0 text-sm font-medium text-white">
                                        {item.label}
                                      </p>
                                      <p className="shrink-0 text-xs text-white/50 transition-colors duration-300 group-hover:text-white">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    );
  }
);

MegaMenu.displayName = "MegaMenu";

export default MegaMenu;
