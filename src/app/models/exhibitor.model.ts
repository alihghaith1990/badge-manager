export interface ExtraBadge {
    id: string;
    firstname: string;
    lastname: string;
    position?: string;
    is_extra?: string;
    email?: string;
    phone?: string;
    createdAt?: string;
}

export interface Exhibitor {
    id: string;
    mshowid: string;
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
    max?: number;
}
