export type WasteType = 'PLASTIC' | 'GLASS' | 'PAPER' | 'METAL';
export type CollectionStatus = 
  | 'PENDING'   
  | 'OCCUPIED'  
  | 'IN_PROGRESS'
  | 'COMPLETED' 
  | 'REJECTED'; 

export interface WasteItem {
  type: WasteType;
  estimatedWeight: number; 
  actualWeight?: number;   
  photos?: string[]; 
}

export interface Collection {
  id?: string;
  customerEmail: string;
  collectorEmail?: string;
  wasteItems: WasteItem[];
  totalEstimatedWeight: number; 
  totalActualWeight?: number;   
  status: CollectionStatus;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  scheduledDate: Date;
  scheduledTime: string; 
  photos?: string[];     
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  rejectionReason?: string;
} 