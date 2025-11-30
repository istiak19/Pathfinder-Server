export interface ICreateListingPayload {
    title: string;
    description: string;
    itinerary?: string;
    price: number;
    duration: string;
    meetingPoint: string;
    maxGroupSize: number;
    city: string;
    images?: string[];
    guideId: string;
    status?: string;
};