// AUTH
export type UserRole = "CLIENT" | "OWNER";

export type AuthUser = {
  userId: string;
  role: UserRole;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
};

export type MeResponse = {
  message: string;
  user: AuthUser;
};

/// PROJECT

export type ProjectType = "SINGLE" | "ALBUM";
export type ProjectStatus = "RECORDING" | "MIXING" | "MASTERING" | "COMPLETED";

export type ProjectOwner = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Project = {
  id: string;
  userId: string;
  title: string;
  type: ProjectType;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  user?: ProjectOwner;
};

export type ProjectsResponse = {
  success: boolean;
  message: string;
  data: Project[] | { items: Project[] };
};

export type CreateProjectPayload = {
  title: string;
  type: ProjectType;
};

export type CreateProjectResponse = {
  success: boolean;
  message: string;
  data: Project;
};


// BOOKING

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type ServiceType = "RECORDING" | "MIXING" | "MASTERING";

export type BookingUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Booking = {
  id: string;
  userId: string;
  assignedTo: string | null;
  date: string;
  startTime: string;
  endTime: string;
  serviceType: ServiceType;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  user?: BookingUser;
  assigned?: BookingUser | null;
};

export type BookingsResponse = {
  success: boolean;
  message: string;
  data: Booking[] | { items: Booking[] };
};

export type AvailableSlotsResponse = {
  success: boolean;
  message: string;
  data: {
    date: string;
    availableSlots: string[];
  };
};

export type CreateBookingPayload = {
  date: string;
  startTime: string;
  endTime: string;
  serviceType: ServiceType;
};

export type CreateBookingResponse = {
  success: boolean;
  message: string;
  data: Booking;
};

/// NEW

export type Track = {
  id: string;
  projectId: string;
  title: string;
  order: number | null;
  createdAt: string;
  updatedAt: string;
  versions?: Version[];
  comments?: Comment[];
};

export type Version = {
  id: string;
  trackId: string;
  versionName: string;
  fileUrl: string;
  createdAt: string;
};

export type Comment = {
  id: string;
  trackId: string;
  userId: string;
  text: string;
  timestamp: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

export type ProjectDetailsResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
    userId: string;
    title: string;
    type: ProjectType;
    status: ProjectStatus;
    createdAt: string;
    updatedAt: string;
    tracks: Track[];
  };
};