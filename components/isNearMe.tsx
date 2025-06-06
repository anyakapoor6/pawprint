interface GeoLocation {
	latitude: number;
	longitude: number;
}

export function isNearMe(
	locationA: GeoLocation,
	locationB: GeoLocation,
	thresholdKm = 50
): boolean {
	const toRad = (value: number) => (value * Math.PI) / 180;

	const lat1 = locationA.latitude;
	const lon1 = locationA.longitude;
	const lat2 = locationB.latitude;
	const lon2 = locationB.longitude;

	const R = 6371; // km
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);

	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) *
		Math.cos(toRad(lat2)) *
		Math.sin(dLon / 2) ** 2;

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = R * c;

	return distance <= thresholdKm;
}
