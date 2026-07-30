import { insforge } from "@/lib/insforge";

export interface WorkerItem {
  id: string;
  employee_id: string;
  full_name: string;
  department: string;
  designation: string;
  shift: string;
  profile_image_url: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
  // Computed/UI fields
  fatigueScore?: number;
}

export interface CreateWorkerInput {
  employeeId: string;
  fullName: string;
  department: string;
  designation?: string;
  shift: string;
  photoFile?: File | null;
  photoBlob?: Blob | File | null;
  faceEmbedding?: number[] | null;
}

export interface WorkerFilters {
  searchQuery?: string;
  department?: string;
  shift?: string;
  status?: string;
}

const DEFAULT_WORKERS: Omit<WorkerItem, "id">[] = [
  {
    employee_id: "#ID-77421",
    full_name: "Elias Thorne",
    designation: "Senior Systems Technician",
    department: "Maintenance",
    shift: "Morning",
    status: "Active",
    profile_image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    fatigueScore: 12,
  },
  {
    employee_id: "#ID-28491",
    full_name: "Marcus Chen",
    designation: "Senior Technician",
    department: "Maintenance",
    shift: "Morning",
    status: "Active",
    profile_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    fatigueScore: 12,
  },
  {
    employee_id: "#ID-99231",
    full_name: "Sarah Jenkins",
    designation: "Logistics Lead",
    department: "Logistics",
    shift: "Morning",
    status: "On Break",
    profile_image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    fatigueScore: 45,
  },
  {
    employee_id: "#ID-11028",
    full_name: "David Okafor",
    designation: "Fabrication Operator",
    department: "Fabrication",
    shift: "Morning",
    status: "Active",
    profile_image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    fatigueScore: 78,
  },
  {
    employee_id: "#ID-44210",
    full_name: "Elena Rodriguez",
    designation: "Quality Analyst",
    department: "Quality Control",
    shift: "Morning",
    status: "Away",
    profile_image_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    fatigueScore: 21,
  },
  {
    employee_id: "#ID-88124",
    full_name: "Thomas Müller",
    designation: "Production Lead",
    department: "Fabrication",
    shift: "Morning",
    status: "Active",
    profile_image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    fatigueScore: 33,
  },
];

/**
 * Ensures initial default worker rows exist in the InsForge database if empty.
 */
export async function seedInitialWorkersIfEmpty(): Promise<void> {
  try {
    const { data: existing, error } = await insforge
      .database
      .from("workers")
      .select("id");

    if (error) {
      console.warn("Error checking workers count for seed:", error);
      return;
    }

    if (!existing || existing.length === 0) {
      console.log("Seeding initial workers into InsForge database...");
      await insforge.database.from("workers").insert(
        DEFAULT_WORKERS.map((w) => ({
          employee_id: w.employee_id,
          full_name: w.full_name,
          department: w.department,
          designation: w.designation,
          shift: w.shift,
          status: w.status,
          profile_image_url: w.profile_image_url,
        }))
      );
    }
  } catch (err) {
    console.warn("Workers table auto-seed warning:", err);
  }
}

/**
 * Fetch workers list from InsForge database with filters
 */
export async function fetchWorkers(filters: WorkerFilters = {}): Promise<WorkerItem[]> {
  await seedInitialWorkersIfEmpty();

  try {
    let query = insforge.database.from("workers").select("*");

    if (filters.department && filters.department !== "All") {
      query = query.eq("department", filters.department);
    }

    if (filters.status && filters.status !== "All") {
      query = query.eq("status", filters.status);
    }

    if (filters.shift && filters.shift !== "All") {
      // Partial or exact match on shift name
      query = query.ilike("shift", `%${filters.shift}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("InsForge workers query error:", error);
      throw new Error(error.message || "Failed to load worker directory from database.");
    }

    let resultList: WorkerItem[] = data || [];

    // Client-side search filtering by name, ID, or designation
    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.toLowerCase().trim();
      resultList = resultList.filter(
        (w) =>
          w.full_name.toLowerCase().includes(q) ||
          w.employee_id.toLowerCase().includes(q) ||
          (w.designation && w.designation.toLowerCase().includes(q))
      );
    }

    // Attach deterministic mock/live fatigue score for UI presentation if missing
    return resultList.map((worker, index) => ({
      ...worker,
      fatigueScore: worker.fatigueScore ?? (12 + (index * 17) % 70),
    }));
  } catch (err: any) {
    console.error("fetchWorkers exception:", err);
    throw err;
  }
}

/**
 * Register a new worker record in InsForge database and upload photo to worker-images bucket
 */
export async function registerNewWorker(input: CreateWorkerInput): Promise<WorkerItem> {
  let uploadedImageUrl: string | null = null;
  const imageToUpload = input.photoBlob || input.photoFile;

  // 1. Upload photo to InsForge storage bucket worker-images if provided
  if (imageToUpload) {
    try {
      const fileExt = imageToUpload instanceof File && imageToUpload.name.includes(".")
        ? imageToUpload.name.split(".").pop() || "jpg"
        : "jpg";
      const fileName = `worker_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { data: uploadData, error: uploadError } = await insforge.storage
        .from("worker-images")
        .upload(filePath, imageToUpload);

      if (uploadError) {
        console.warn("Storage upload warning, using default avatar:", uploadError);
      } else if (uploadData?.url) {
        uploadedImageUrl = uploadData.url;
      }
    } catch (stgErr) {
      console.warn("Storage exception during worker image upload:", stgErr);
    }
  }

  // Fallback avatar if no photo uploaded
  if (!uploadedImageUrl) {
    uploadedImageUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  }

  // 2. Insert new record into InsForge PostgreSQL workers table
  const formattedEmployeeId = input.employeeId.startsWith("#") ? input.employeeId : `#${input.employeeId}`;

  const insertPayload = [
    {
      employee_id: formattedEmployeeId,
      full_name: input.fullName,
      department: input.department,
      designation: input.designation || `${input.department} Operator`,
      shift: input.shift,
      status: "Active",
      profile_image_url: uploadedImageUrl,
      face_embedding: input.faceEmbedding || null,
    },
  ];

  const { data, error } = await insforge
    .database
    .from("workers")
    .insert(insertPayload)
    .select("*");

  if (error) {
    console.error("InsForge worker insert error:", error);
    throw new Error(error.message || "Failed to register worker in database.");
  }

  if (data && data.length > 0) {
    return {
      ...data[0],
      fatigueScore: 12,
    };
  }

  throw new Error("Worker record created but returned empty payload.");
}

/**
 * Delete a worker record from InsForge database
 */
export async function deleteWorker(workerId: string): Promise<void> {
  const { error } = await insforge
    .database
    .from("workers")
    .delete()
    .eq("id", workerId);

  if (error) {
    console.error("InsForge delete worker error:", error);
    throw new Error(error.message || "Failed to delete worker from database.");
  }
}

/**
 * Update worker information in InsForge database
 */
export async function updateWorker(
  workerId: string,
  updates: Partial<CreateWorkerInput & { status?: string }>
): Promise<WorkerItem> {
  const payload: Record<string, any> = {};

  if (updates.fullName) payload.full_name = updates.fullName;
  if (updates.department) payload.department = updates.department;
  if (updates.designation) payload.designation = updates.designation;
  if (updates.shift) payload.shift = updates.shift;
  if (updates.status) payload.status = updates.status;

  const { data, error } = await insforge
    .database
    .from("workers")
    .update(payload)
    .eq("id", workerId)
    .select("*");

  if (error) {
    console.error("InsForge update worker error:", error);
    throw new Error(error.message || "Failed to update worker in database.");
  }

  if (data && data.length > 0) {
    return data[0];
  }

  throw new Error("Worker updated but no data returned.");
}

