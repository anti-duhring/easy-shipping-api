export class CreateRouteDto {
    name: string;
    source_id: string;
    destination_id: string;
}

export class CreateRouteDriverDto {
    route_id: string;
    lat: number;
    lng: number;
}