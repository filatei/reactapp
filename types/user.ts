export interface UserProfile {
    name: string;
    email: string;
    phoneNumber?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
} 