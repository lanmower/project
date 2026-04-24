// Previous types remain...

export interface SystemSettings {
  id: string;
  emailDomains: string[];  // Allowed email domains for sign-in
  defaultEmailCategories: string[];
  taskCategories: string[];
  priorityLevels: Array<{
    id: string;
    name: string;
    color: string;
    order: number;
  }>;
  statusTypes: Array<{
    id: string;
    name: string;
    color: string;
    order: number;
  }>;
  attachmentTypes: Array<{
    mimeType: string;
    icon: string;
    allowPreview: boolean;
    maxSize: number;
  }>;
  aiProviders: Array<{
    id: string;
    name: string;
    enabled: boolean;
    config: Record<string, any>;
  }>;
  roles: Array<{
    id: UserRole;
    name: string;
    permissions: string[];
    order: number;
  }>;
  notificationTypes: Array<{
    id: string;
    name: string;
    template: string;
    channels: string[];
  }>;
  customFields: Array<{
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
    options?: string[];
    required: boolean;
    appliesTo: ('email' | 'task' | 'rule')[];
    visibleToRoles: UserRole[];
    editableByRoles: UserRole[];
  }>;
  workflowStates: Array<{
    id: string;
    name: string;
    color: string;
    order: number;
    allowedTransitions: string[];
    requiredFields?: string[];
    autoActions?: Array<{
      type: string;
      config: Record<string, any>;
    }>;
  }>;
  dashboardLayouts: Record<UserRole, Array<{
    id: string;
    name: string;
    type: 'chart' | 'list' | 'stat' | 'custom';
    config: Record<string, any>;
    position: { x: number; y: number; w: number; h: number };
  }>>;
}

export interface DynamicView {
  id: string;
  name: string;
  icon: string;
  component: string;
  requiredRoles: UserRole[];
  position: number;
  config: {
    filters?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    sort?: Array<{
      field: string;
      direction: 'asc' | 'desc';
    }>;
    columns?: Array<{
      field: string;
      title: string;
      width?: number;
      sortable?: boolean;
      filterable?: boolean;
    }>;
    actions?: Array<{
      name: string;
      icon: string;
      handler: string;
      requiredRoles: UserRole[];
    }>;
  };
}

export interface CustomAction {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'task' | 'system';
  script: string;
  requiredRoles: UserRole[];
  config: Record<string, any>;
  isActive: boolean;
}

// Update existing interfaces to support dynamic fields
export interface ProcessedEmail {
  // Previous fields remain...
  customFields?: Record<string, any>;
  workflowState?: string;
  assignedTo?: string[];
  labels?: string[];
}

export interface TodoItem {
  // Previous fields remain...
  customFields?: Record<string, any>;
  workflowState?: string;
  dependencies?: string[];
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}