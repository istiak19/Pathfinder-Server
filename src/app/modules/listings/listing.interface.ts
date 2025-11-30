export enum ListingCategory {
    FOOD = "FOOD",
    ART = "ART",
    ADVENTURE = "ADVENTURE",
    NATURE = "NATURE",
    CULTURE = "CULTURE",
    SHOPPING = "SHOPPING",
    SPORTS = "SPORTS",
    WELLNESS = "WELLNESS",
    HISTORY = "HISTORY",
    ENTERTAINMENT = "ENTERTAINMENT"
};

export interface ICreateListingPayload {
    title: string;
    description: string;
    itinerary?: string;
    price: number;
    duration: string;
    category: ListingCategory;
    meetingPoint: string;
    maxGroupSize: number;
    city: string;
    images?: string[];
    guideId: string;
    status?: string;
};