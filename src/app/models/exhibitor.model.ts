export interface ExtraBadge {
    id: number;
    firstname: string;
    lastname: string;
    position?: string;
    is_extra?: string;
    email?: string;
    phone?: string;
    createdAt?: string;
}

export interface Exhibitor {
    id: number;
    companyname: string;
    firstname?: string;
    lastname?: string;
    position?: string;
    country?: string;
    standnumber?: string;
    spacetype?: string;
    space?: string; // note: original JSON has space as string
    email?: string;
    extrabadges?: ExtraBadge[];
}
