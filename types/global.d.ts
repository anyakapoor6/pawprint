// types/global.d.ts
import type { PetReport } from '@/types/pet';

declare global {
	var scanReportData: PetReport | undefined;
}

export { };
