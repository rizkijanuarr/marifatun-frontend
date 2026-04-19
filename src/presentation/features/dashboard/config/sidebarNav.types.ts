export type SidebarNavItem = {
  index?: number;
  label?: string;
  label_key?: string;
  /** Legacy HTML paths; SPA uses `nav` + navPathMap. */
  href?: string;
  nav?: string;
  icon?: string;
  count?: string | null;
};

export type SidebarNavGroup = {
  index?: number;
  label?: string | null;
  label_key?: string;
  items?: SidebarNavItem[];
};

export type SidebarNavConfig = {
  ['$comment']?: string;
  groups: SidebarNavGroup[];
};
