export interface DropdownItem {
    path: string;
    label: string;
  }
  
  export interface NavItem {
    path: string;
    label: string;
    subLabel?: string;
    external?: boolean;
    target?: string;
    rel?: string;
    dropdownItems?: DropdownItem[];
  }